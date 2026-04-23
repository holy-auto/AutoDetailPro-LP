import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import AdBanner from '@/components/AdBanner';
import AdMobBanner from '@/components/AdMobBanner';
import {
  CUSTOMER_TRACKER_STEPS,
  CANCELLATION,
  COMPLETION,
  type OrderStatus,
} from '@/constants/business-rules';
import {
  DEFAULT_LOCATION,
  fetchRoute,
  subscribeToProLocation,
  type Coords,
  type RouteInfo,
} from '@/lib/location';
import { requestMaskedCall, maskPhoneForDisplay } from '@/lib/masked-calls';

// Simulate pro movement path
const PRO_PATH: Coords[] = [
  { latitude: 35.6862, longitude: 139.7645 },
  { latitude: 35.6852, longitude: 139.7650 },
  { latitude: 35.6842, longitude: 139.7655 },
  { latitude: 35.6832, longitude: 139.7660 },
  { latitude: 35.6822, longitude: 139.7665 },
  { latitude: 35.6812, longitude: 139.7671 }, // destination (customer)
];

const CUSTOMER_LOCATION: Coords = {
  latitude: 35.6812,
  longitude: 139.7671,
};

export default function TrackingScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams<{
    proName: string;
    totalPrice: string;
    paymentMethod: string;
    orderId: string;
    proId: string;
  }>();

  const totalPrice = parseInt(params.totalPrice ?? '0', 10);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('accepted');
  const [proLocation, setProLocation] = useState<Coords>(PRO_PATH[0]);
  const [proPathIndex, setProPathIndex] = useState(0);
  const [eta, setEta] = useState('計算中...');
  const [routeCoords, setRouteCoords] = useState<Coords[]>([]);
  const [routeDistance, setRouteDistance] = useState('');
  const [confirmTimeout, setConfirmTimeout] = useState(
    COMPLETION.CONFIRMATION_TIMEOUT_MIN * 60
  );
  const routeFetchedRef = useRef(false);

  // Fetch driving route when pro starts moving (or on mount)
  useEffect(() => {
    if (routeFetchedRef.current) return;
    routeFetchedRef.current = true;

    (async () => {
      const route = await fetchRoute(proLocation, CUSTOMER_LOCATION);
      setRouteCoords(route.coordinates);
      setEta(route.durationText);
      setRouteDistance(route.distanceText);
    })();
  }, []);

  // Re-fetch route when pro location changes significantly
  const lastRouteFetchRef = useRef<Coords>(proLocation);
  useEffect(() => {
    if (currentStatus !== 'on_the_way') return;

    const prev = lastRouteFetchRef.current;
    const dLat = Math.abs(proLocation.latitude - prev.latitude);
    const dLng = Math.abs(proLocation.longitude - prev.longitude);
    // Re-fetch if moved more than ~200m
    if (dLat < 0.002 && dLng < 0.002) return;

    lastRouteFetchRef.current = proLocation;
    (async () => {
      const route = await fetchRoute(proLocation, CUSTOMER_LOCATION);
      setRouteCoords(route.coordinates);
      setEta(route.durationText);
      setRouteDistance(route.distanceText);
    })();
  }, [proLocation, currentStatus]);

  // Subscribe to pro's real-time location if proId is available
  useEffect(() => {
    if (!params.proId) return;
    const sub = subscribeToProLocation(params.proId, (coords) => {
      setProLocation(coords);
      // Animate camera to keep both markers visible
      mapRef.current?.animateToRegion(
        {
          latitude: (coords.latitude + CUSTOMER_LOCATION.latitude) / 2,
          longitude: (coords.longitude + CUSTOMER_LOCATION.longitude) / 2,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    });
    return () => {
      sub.unsubscribe();
    };
  }, [params.proId]);

  // Simulate pro movement (demo fallback when no real proId)
  useEffect(() => {
    if (params.proId) return; // skip simulation when connected to real pro
    if (currentStatus !== 'on_the_way') return;

    const interval = setInterval(() => {
      setProPathIndex((prev) => {
        const next = prev + 1;
        if (next >= PRO_PATH.length) {
          clearInterval(interval);
          return prev;
        }
        setProLocation(PRO_PATH[next]);

        mapRef.current?.animateToRegion(
          {
            latitude:
              (PRO_PATH[next].latitude + CUSTOMER_LOCATION.latitude) / 2,
            longitude:
              (PRO_PATH[next].longitude + CUSTOMER_LOCATION.longitude) / 2,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          800
        );

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentStatus, params.proId]);

  // Status progression simulation
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        setCurrentStatus('on_the_way');
      }, 2000)
    );
    timers.push(
      setTimeout(() => {
        setCurrentStatus('arrived');
        setEta('到着');
      }, 14000)
    );
    timers.push(setTimeout(() => setCurrentStatus('in_progress'), 18000));
    timers.push(setTimeout(() => setCurrentStatus('pro_marked_done'), 24000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-complete countdown
  useEffect(() => {
    if (currentStatus !== 'pro_marked_done') return;
    const timer = setInterval(() => {
      setConfirmTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStatus]);

  const handleAutoComplete = () => {
    router.replace({
      pathname: '/customer/booking/complete',
      params: {
        proName: params.proName,
        totalPrice: params.totalPrice,
        orderId: params.orderId,
        autoCompleted: 'true',
      },
    });
  };

  const handleConfirmComplete = () => {
    router.replace({
      pathname: '/customer/booking/complete',
      params: {
        proName: params.proName,
        totalPrice: params.totalPrice,
        orderId: params.orderId,
        autoCompleted: 'false',
      },
    });
  };

  const handleCallPro = async () => {
    if (!params.orderId || !params.proId) {
      Alert.alert('エラー', '注文情報が取得できません');
      return;
    }
    const session = await requestMaskedCall({
      orderId: params.orderId,
      calleeId: params.proId,
    });
    if (!session) {
      Alert.alert(
        '通話できません',
        'プロへの通話セッションを作成できませんでした。少し時間をおいて再度お試しください。',
      );
      return;
    }
    Alert.alert(
      'プロに発信',
      `${maskPhoneForDisplay(session.proxyNumber)} に発信します（実際の電話番号は表示されません）`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '発信',
          onPress: () => {
            Linking.openURL(`tel:${session.proxyNumber.replace(/[^\d+]/g, '')}`);
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    let message = '';
    if (['payment_authorized', 'requested'].includes(currentStatus)) {
      message = 'プロ承認前のため無料でキャンセルできます。';
    } else if (['accepted', 'on_the_way'].includes(currentStatus)) {
      message = `承認後のキャンセルは${CANCELLATION.AFTER_ACCEPTANCE_BEFORE_ARRIVAL.label}が発生します。`;
    } else if (['arrived', 'in_progress'].includes(currentStatus)) {
      message = `到着後のキャンセルは${CANCELLATION.AFTER_ARRIVAL.label}が発生します。`;
    }

    Alert.alert('キャンセル確認', message, [
      { text: '戻る', style: 'cancel' },
      {
        text: 'キャンセルする',
        style: 'destructive',
        onPress: () => router.dismissAll(),
      },
    ]);
  };

  const currentStepIndex = CUSTOMER_TRACKER_STEPS.findIndex(
    (step) => step.status === currentStatus
  );
  const confirmMin = Math.floor(confirmTimeout / 60);
  const confirmSec = confirmTimeout % 60;

  const showMap =
    currentStatus === 'accepted' ||
    currentStatus === 'on_the_way' ||
    currentStatus === 'arrived';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>予約状況</Text>
            <Text style={styles.subtitle}>{params.proName}</Text>
          </View>
          {params.proId && currentStatus !== 'completed' && (
            <TouchableOpacity style={styles.callBtn} onPress={handleCallPro}>
              <Ionicons name="call" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Live Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude:
                (proLocation.latitude + CUSTOMER_LOCATION.latitude) / 2,
              longitude:
                (proLocation.longitude + CUSTOMER_LOCATION.longitude) / 2,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            showsUserLocation={false}
          >
            {/* Customer marker */}
            <Marker coordinate={CUSTOMER_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.customerMarker}>
                <Ionicons name="location" size={18} color={Colors.primary} />
              </View>
            </Marker>

            {/* Pro marker */}
            {showMap && (
              <Marker
                coordinate={proLocation}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.proMovingMarker}>
                  <Ionicons name="car-sport" size={18} color={Colors.white} />
                </View>
              </Marker>
            )}

            {/* Driving route polyline */}
            {showMap && routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={Colors.primary}
                strokeWidth={4}
                lineDashPattern={[0]}
              />
            )}

            {/* Fallback straight line if route not yet loaded */}
            {showMap && routeCoords.length === 0 && (
              <Polyline
                coordinates={[proLocation, CUSTOMER_LOCATION]}
                strokeColor={Colors.primary}
                strokeWidth={3}
                lineDashPattern={[6, 4]}
              />
            )}

            {/* Work in progress / done marker */}
            {(currentStatus === 'in_progress' ||
              currentStatus === 'pro_marked_done') && (
              <Marker
                coordinate={CUSTOMER_LOCATION}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.workMarker}>
                  <Ionicons
                    name={
                      currentStatus === 'pro_marked_done'
                        ? 'checkmark-circle'
                        : 'construct'
                    }
                    size={22}
                    color={Colors.white}
                  />
                </View>
              </Marker>
            )}
          </MapView>

          {/* ETA overlay */}
          {showMap && (
            <View style={styles.etaOverlay}>
              <Text style={styles.etaLabel}>
                {currentStatus === 'arrived' ? 'プロ到着' : '到着予定'}
              </Text>
              <Text style={styles.etaValue}>{eta}</Text>
              {routeDistance !== '' && currentStatus !== 'arrived' && (
                <Text style={styles.etaDistance}>{routeDistance}</Text>
              )}
            </View>
          )}

          {/* Status overlay */}
          {!showMap && (
            <View style={styles.statusOverlay}>
              <Ionicons
                name={
                  currentStatus === 'in_progress'
                    ? 'construct'
                    : 'clipboard-outline'
                }
                size={28}
                color={Colors.primaryMedium}
              />
              <Text style={styles.statusOverlayText}>
                {currentStatus === 'in_progress'
                  ? '作業中...'
                  : '完了確認をお願いします'}
              </Text>
            </View>
          )}
        </View>

        {/* Status Tracker */}
        <View style={styles.tracker}>
          {CUSTOMER_TRACKER_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <View key={step.status} style={styles.trackerRow}>
                <View style={styles.trackerLeft}>
                  <View
                    style={[
                      styles.trackerDot,
                      isCompleted && styles.trackerDotCompleted,
                      isCurrent && styles.trackerDotCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={Colors.white}
                      />
                    ) : (
                      <Ionicons
                        name={step.icon as any}
                        size={12}
                        color={Colors.textMuted}
                      />
                    )}
                  </View>
                  {idx < CUSTOMER_TRACKER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.trackerLine,
                        isCompleted && styles.trackerLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.trackerLabel,
                    isCurrent && styles.trackerLabelCurrent,
                    isCompleted && !isCurrent && styles.trackerLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Pro Marked Done — confirm or auto-complete */}
        {currentStatus === 'pro_marked_done' && (
          <View style={styles.confirmCard}>
            <Ionicons
              name="clipboard-outline"
              size={28}
              color={Colors.primary}
            />
            <Text style={styles.confirmTitle}>
              プロが作業完了を報告しました
            </Text>
            <Text style={styles.confirmDesc}>
              作業内容を確認して完了ボタンを押してください。{'\n'}
              未確認の場合、{COMPLETION.CONFIRMATION_TIMEOUT_MIN}
              分後に自動完了します。
            </Text>
            <Text style={styles.confirmTimer}>
              自動完了まで {confirmMin}:
              {confirmSec.toString().padStart(2, '0')}
            </Text>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleConfirmComplete}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.white}
              />
              <Text style={styles.completeBtnText}>作業完了を確認</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>お支払い金額</Text>
            <Text style={styles.infoValue}>
              ¥{totalPrice.toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>決済方法</Text>
            <Text style={styles.infoValue}>
              {params.paymentMethod === 'online'
                ? 'オンライン決済'
                : '現金決済'}
            </Text>
          </View>
        </View>

        {/* 待機中・作業中に広告表示 */}
        {(currentStatus === 'on_the_way' || currentStatus === 'in_progress') && (
          <>
            <AdBanner placement="home_feed" style={{ marginTop: Spacing.md }} />
            <AdMobBanner size="BANNER" style={{ marginTop: Spacing.sm }} />
          </>
        )}

        {/* Cancel Button */}
        {currentStatus !== 'pro_marked_done' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>キャンセル</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.md, gap: Spacing.md,
  },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.success,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.success, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.primaryMedium,
    fontWeight: '600',
    marginTop: 2,
  },

  // Map
  mapContainer: {
    height: 240,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  proMovingMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  workMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  etaOverlay: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  etaLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  etaValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  etaDistance: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primaryFaint + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusOverlayText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primaryMedium,
  },

  // Tracker
  tracker: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  trackerLeft: { alignItems: 'center', width: 28 },
  trackerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  trackerDotCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  trackerDotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryPale,
    borderWidth: 3,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  trackerLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  trackerLineCompleted: { backgroundColor: Colors.primary },
  trackerLabel: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    paddingTop: 4,
  },
  trackerLabelCurrent: { color: Colors.primary, fontWeight: '700' },
  trackerLabelCompleted: { color: Colors.textSecondary },

  // Confirm
  confirmCard: {
    backgroundColor: Colors.primaryFaint,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryPale,
    marginBottom: Spacing.md,
  },
  confirmTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  confirmDesc: {
    fontSize: FontSize.sm,
    color: Colors.primaryMedium,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  confirmTimer: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.md,
    fontVariant: ['tabular-nums'],
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    width: '100%',
  },
  completeBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },

  // Info
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
  },
});
