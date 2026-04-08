import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { useAuth } from '../_layout';
import { signOut } from '@/lib/auth';
import {
  getCurrentLocation,
  watchPosition,
  updateProLocation,
  setProOnlineStatus,
  type Coords,
} from '@/lib/location';
import { BUSINESS_HOURS } from '@/constants/business-rules';

/** 現在時刻が営業時間内かどうか */
function isWithinBusinessHours(): boolean {
  const now = new Date();
  // JST offset: UTC+9
  const jstHour = (now.getUTCHours() + 9) % 24;
  return jstHour >= BUSINESS_HOURS.OPEN_HOUR && jstHour < BUSINESS_HOURS.CLOSE_HOUR;
}

/** 営業終了までのミリ秒を返す（営業時間外なら0） */
function msUntilClose(): number {
  const now = new Date();
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const jstDate = new Date(jstMs);
  const closeToday = new Date(jstDate);
  closeToday.setUTCHours(BUSINESS_HOURS.CLOSE_HOUR, 0, 0, 0);
  const diff = closeToday.getTime() - jstDate.getTime();
  return diff > 0 ? diff : 0;
}

/** 営業時間を "HH:00〜HH:00" 形式で返す */
function formatBusinessHours(): string {
  const open = String(BUSINESS_HOURS.OPEN_HOUR).padStart(2, '0');
  const close = String(BUSINESS_HOURS.CLOSE_HOUR).padStart(2, '0');
  return `${open}:00〜${close}:00`;
}

const MOCK_STATS = {
  todayEarnings: 18000,
  todayJobs: 3,
  monthEarnings: 342000,
  monthJobs: 28,
  rating: 4.9,
  totalReviews: 127,
};

const MOCK_RECENT_JOBS = [
  {
    id: '1',
    customer: '山田 様',
    service: '手洗い洗車',
    price: 3000,
    time: '10:30',
    status: 'completed',
  },
  {
    id: '2',
    customer: '高橋 様',
    service: 'ガラスコーティング',
    price: 15000,
    time: '13:00',
    status: 'in_progress',
  },
];

export default function ProHome() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<Coords | null>(null);
  const watchRef = useRef<{ remove: () => void } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const proId = user?.id;

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'プロ';

  /** GPS停止 + オフライン化の共通処理 */
  const goOffline = useCallback(async () => {
    watchRef.current?.remove();
    watchRef.current = null;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setCurrentCoords(null);
    setIsOnline(false);
    if (proId) await setProOnlineStatus(proId, false);
  }, [proId]);

  /** 営業終了時刻に自動OFFするタイマーをセット */
  const scheduleAutoOff = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    const remaining = msUntilClose();
    if (remaining <= 0) return;

    closeTimerRef.current = setTimeout(() => {
      goOffline();
      Alert.alert(
        '営業時間終了',
        `${formatBusinessHours()} の営業時間が終了したため、自動的にオフラインになりました。`,
      );
    }, remaining);
  }, [goOffline]);

  const handleToggleOnline = useCallback(
    async (value: boolean) => {
      if (!proId) return;

      if (value) {
        // 営業時間チェック
        if (BUSINESS_HOURS.BLOCK_OUTSIDE_HOURS && !isWithinBusinessHours()) {
          Alert.alert(
            '営業時間外',
            `受付可能な時間は ${formatBusinessHours()} です。\n営業時間内にONにしてください。`,
          );
          return;
        }

        try {
          const coords = await getCurrentLocation();
          setCurrentCoords(coords);

          await setProOnlineStatus(proId, true, coords);

          watchRef.current = watchPosition((newCoords) => {
            setCurrentCoords(newCoords);
            updateProLocation(proId, newCoords);
          }, 5000);

          setIsOnline(true);

          // 営業終了時に自動OFFタイマー
          if (BUSINESS_HOURS.AUTO_OFF_AT_CLOSE) {
            scheduleAutoOff();
          }
        } catch {
          Alert.alert('位置情報エラー', 'GPSの取得に失敗しました。設定を確認してください。');
        }
      } else {
        await goOffline();
      }
    },
    [proId, goOffline, scheduleAutoOff]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (proId && isOnline) {
        setProOnlineStatus(proId, false);
      }
    };
  }, [proId, isOnline]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with GPS Toggle */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{userName}</Text>
            <Text style={styles.role}>プロモード</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => signOut()}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* GPS Online Toggle */}
        <View style={[styles.gpsCard, isOnline && styles.gpsCardOnline]}>
          <View style={styles.gpsInfo}>
            <View
              style={[
                styles.gpsIndicator,
                { backgroundColor: isOnline ? Colors.success : Colors.textMuted },
              ]}
            />
            <View>
              <Text style={[styles.gpsTitle, isOnline && styles.gpsTitleOnline]}>
                {isOnline ? '出張受付中' : 'オフライン'}
              </Text>
              <Text style={[styles.gpsSubtitle, isOnline && styles.gpsSubtitleOnline]}>
                {isOnline
                  ? 'GPS ON — お客さまからの依頼を受付中'
                  : `受付時間 ${formatBusinessHours()} — ONにして依頼を受けましょう`}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{
              false: Colors.border,
              true: Colors.primarySoft,
            }}
            thumbColor={isOnline ? Colors.primary : Colors.textMuted}
          />
        </View>

        {/* GPS Coordinates */}
        {isOnline && currentCoords && (
          <View style={styles.coordsRow}>
            <Ionicons name="navigate" size={14} color={Colors.primaryMedium} />
            <Text style={styles.coordsText}>
              {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Today's Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ¥{MOCK_STATS.todayEarnings.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>本日の売上</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{MOCK_STATS.todayJobs}</Text>
            <Text style={styles.statLabel}>本日の件数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ¥{(MOCK_STATS.monthEarnings / 10000).toFixed(1)}万
            </Text>
            <Text style={styles.statLabel}>今月の売上</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={Colors.gold} />
              <Text style={styles.statValue}>{MOCK_STATS.rating}</Text>
            </View>
            <Text style={styles.statLabel}>
              評価 ({MOCK_STATS.totalReviews}件)
            </Text>
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>本日の作業</Text>
          {MOCK_RECENT_JOBS.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobTime}>
                <Text style={styles.jobTimeText}>{job.time}</Text>
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobCustomer}>{job.customer}</Text>
                <Text style={styles.jobService}>{job.service}</Text>
              </View>
              <View style={styles.jobRight}>
                <Text style={styles.jobPrice}>
                  ¥{job.price.toLocaleString()}
                </Text>
                <View
                  style={[
                    styles.jobStatus,
                    {
                      backgroundColor:
                        job.status === 'completed'
                          ? Colors.primaryFaint
                          : Colors.goldLight + '40',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.jobStatusText,
                      {
                        color:
                          job.status === 'completed'
                            ? Colors.primary
                            : Colors.gold,
                      },
                    ]}
                  >
                    {job.status === 'completed' ? '完了' : '作業中'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  role: {
    fontSize: FontSize.sm,
    color: Colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  gpsCardOnline: {
    borderColor: Colors.primarySoft,
    backgroundColor: Colors.primaryFaint,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  gpsIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  gpsTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gpsTitleOnline: {
    color: Colors.primary,
  },
  gpsSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  gpsSubtitleOnline: {
    color: Colors.primaryMedium,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  coordsText: {
    fontSize: FontSize.xs,
    color: Colors.primaryMedium,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    flexGrow: 1,
    flexBasis: '47%',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  section: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobTime: {
    backgroundColor: Colors.primaryFaint,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  jobTimeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  jobInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  jobCustomer: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  jobService: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  jobRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  jobPrice: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  jobStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  jobStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
