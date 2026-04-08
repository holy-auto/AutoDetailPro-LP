import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

type RequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed';

interface Request {
  id: string;
  customer: string;
  service: string;
  price: number;
  distance: string;
  address: string;
  paymentMethod: string;
  status: RequestStatus;
  createdAt: string;
}

const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    customer: '山田 太郎',
    service: '手洗い洗車',
    price: 3000,
    distance: '0.8km',
    address: '東京都渋谷区神南1-2-3',
    paymentMethod: 'オンライン決済',
    status: 'pending',
    createdAt: 'たった今',
  },
  {
    id: '2',
    customer: '高橋 花子',
    service: 'ガラスコーティング',
    price: 15000,
    distance: '1.5km',
    address: '東京都港区六本木4-5-6',
    paymentMethod: '現金決済',
    status: 'pending',
    createdAt: '2分前',
  },
  {
    id: '3',
    customer: '田中 一郎',
    service: 'フルディテイルコース',
    price: 25000,
    distance: '3.2km',
    address: '東京都世田谷区下北沢7-8-9',
    paymentMethod: 'オンライン決済',
    status: 'accepted',
    createdAt: '15分前',
  },
];

export default function RequestsScreen() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const handleAccept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' as const } : r))
    );
  };

  const handleDecline = (id: string) => {
    Alert.alert('依頼を辞退', 'この依頼を辞退しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '辞退する',
        style: 'destructive',
        onPress: () =>
          setRequests((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  };

  const handleStartWork = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'in_progress' as const } : r
      )
    );
  };

  const handleComplete = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'completed' as const } : r
      )
    );
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeRequests = requests.filter(
    (r) => r.status === 'accepted' || r.status === 'in_progress'
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>依頼管理</Text>

        {/* New Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>新着依頼</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            </View>

            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.newIndicator} />
                <View style={styles.requestHeader}>
                  <View>
                    <Text style={styles.requestService}>{req.service}</Text>
                    <Text style={styles.requestCustomer}>{req.customer}</Text>
                  </View>
                  <Text style={styles.requestPrice}>
                    ¥{req.price.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.detailText}>{req.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="navigate-outline"
                      size={16}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.detailText}>{req.distance}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={Colors.textMuted}
                    />
                    <Text style={styles.detailText}>{req.paymentMethod}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDecline(req.id)}
                  >
                    <Text style={styles.declineButtonText}>辞退</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(req.id)}
                  >
                    <Ionicons name="checkmark" size={20} color={Colors.white} />
                    <Text style={styles.acceptButtonText}>承認する</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.requestTime}>{req.createdAt}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Active Jobs */}
        {activeRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>進行中の作業</Text>

            {activeRequests.map((req) => (
              <View key={req.id} style={styles.activeCard}>
                <View style={styles.requestHeader}>
                  <View>
                    <Text style={styles.requestService}>{req.service}</Text>
                    <Text style={styles.requestCustomer}>{req.customer}</Text>
                    <Text style={styles.activeAddress}>{req.address}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          req.status === 'in_progress'
                            ? Colors.goldLight + '40'
                            : Colors.primaryFaint,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color:
                            req.status === 'in_progress'
                              ? Colors.gold
                              : Colors.primary,
                        },
                      ]}
                    >
                      {req.status === 'in_progress' ? '作業中' : '承認済み'}
                    </Text>
                  </View>
                </View>

                {req.status === 'accepted' && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartWork(req.id)}
                  >
                    <Ionicons name="play" size={18} color={Colors.white} />
                    <Text style={styles.startButtonText}>作業開始</Text>
                  </TouchableOpacity>
                )}

                {req.status === 'in_progress' && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleComplete(req.id)}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.white}
                    />
                    <Text style={styles.completeButtonText}>作業完了報告</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {pendingRequests.length === 0 && activeRequests.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyText}>新着の依頼はありません</Text>
            <Text style={styles.emptySubtext}>
              GPSをONにして依頼を待ちましょう
            </Text>
          </View>
        )}
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
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  requestCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  newIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestService: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  requestCustomer: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  requestPrice: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  requestDetails: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    gap: Spacing.sm,
  },
  acceptButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  requestTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'right',
  },
  activeCard: {
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
  activeAddress: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  startButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  completeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  completeButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
