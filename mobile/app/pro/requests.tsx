import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import {
  MATCHING,
  PAYMENT_METHOD,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from '@/constants/business-rules';
import { supabase } from '@/lib/supabase';
import { updateOrderStatus, proMarkDone } from '@/lib/orders';
import { useAuth } from '../_layout';

interface ProRequest {
  id: string;
  customer: string;
  service: string;
  price: number;
  distanceKm: number;
  address: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAtLabel: string;
  expiresAt: number;
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'たった今';
  if (mins < 60) return `${mins}分前`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.round(hours / 24)}日前`;
}

function CountdownBadge({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const urgent = remaining < 60;

  return (
    <View style={[countdownStyles.badge, urgent && countdownStyles.badgeUrgent]}>
      <Ionicons
        name="time-outline"
        size={14}
        color={urgent ? Colors.error : Colors.warning}
      />
      <Text style={[countdownStyles.text, urgent && countdownStyles.textUrgent]}>
        {min}:{sec.toString().padStart(2, '0')}
      </Text>
    </View>
  );
}

const countdownStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  badgeUrgent: { backgroundColor: Colors.error + '20' },
  text: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.warning, fontVariant: ['tabular-nums'] },
  textUrgent: { color: Colors.error },
});

const ACTIVE_STATUSES: OrderStatus[] = [
  'accepted',
  'on_the_way',
  'arrived',
  'in_progress',
  'pro_marked_done',
];

export default function RequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, status, created_at, accepted_at, total_amount, customer_total,
        address, distance_km, payment_method, pro_id,
        customer:customer_id(full_name),
        menus:order_menus(menu:menu_id(name))
      `)
      .or(`pro_id.eq.${user.id},status.in.(requested,requested_expanded)`)
      .in('status', ['requested', 'requested_expanded', ...ACTIVE_STATUSES])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const mapped: ProRequest[] = data.map((row: any) => {
      const firstMenu = row.menus?.[0]?.menu?.name ?? 'サービス';
      const createdAt = row.created_at;
      const expiresAt =
        new Date(createdAt).getTime() + MATCHING.ACCEPTANCE_TIMEOUT_SEC * 1000;
      return {
        id: row.id,
        customer: row.customer?.full_name ?? 'お客さま',
        service: firstMenu,
        price: row.customer_total ?? row.total_amount ?? 0,
        distanceKm: row.distance_km ?? 0,
        address: row.address ?? '',
        paymentMethod:
          row.payment_method === PAYMENT_METHOD.CASH ? '現金決済' : 'オンライン決済',
        status: row.status as OrderStatus,
        createdAtLabel: relativeTime(createdAt),
        expiresAt,
      };
    });

    setRequests(mapped);
    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Realtime subscription so pros see new requests without pulling to refresh
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`pro-requests-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadRequests();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadRequests]);

  const handleAccept = async (id: string) => {
    if (!user?.id) return;
    const result = await updateOrderStatus(id, 'accepted', {
      pro_id: user.id,
      accepted_at: new Date().toISOString(),
    });
    if (!result.success) {
      Alert.alert('エラー', result.error ?? '承認に失敗しました');
      return;
    }
    loadRequests();
  };

  const handleDecline = (id: string) => {
    Alert.alert('依頼を辞退', 'この依頼を辞退しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '辞退する',
        style: 'destructive',
        onPress: async () => {
          // Remove from local state; server logs the pro ignored it.
          // (Acceptance is optional — other pros can still take it.)
          setRequests((prev) => prev.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  const handleStartWork = async (id: string) => {
    const result = await updateOrderStatus(id, 'in_progress');
    if (!result.success) {
      Alert.alert('エラー', result.error ?? '状態更新に失敗しました');
      return;
    }
    loadRequests();
  };

  const handleMarkDone = (id: string) => {
    Alert.alert(
      '作業完了報告',
      'お客さまに完了報告を送信します。お客さまが確認するか、30分経過で自動完了になります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '完了報告を送信',
          onPress: async () => {
            const result = await proMarkDone(id);
            if (!result.success) {
              Alert.alert('エラー', result.error ?? '完了報告に失敗しました');
              return;
            }
            loadRequests();
          },
        },
      ]
    );
  };

  const pendingRequests = requests.filter(
    (r) => r.status === 'requested' || r.status === 'requested_expanded',
  );
  const activeRequests = requests.filter((r) => ACTIVE_STATUSES.includes(r.status));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadRequests();
            }}
          />
        }
      >
        <Text style={styles.title}>依頼管理</Text>

        {/* New Requests with countdown */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>新着依頼</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            </View>

            <View style={styles.timeoutNotice}>
              <Ionicons name="information-circle" size={16} color={Colors.warning} />
              <Text style={styles.timeoutText}>
                {MATCHING.ACCEPTANCE_TIMEOUT_SEC / 60}分以内に承認しないと自動キャンセルされます
              </Text>
            </View>

            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.newIndicator} />
                <View style={styles.requestHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestService}>{req.service}</Text>
                    <Text style={styles.requestCustomer}>{req.customer}</Text>
                  </View>
                  <View style={styles.requestRight}>
                    <Text style={styles.requestPrice}>¥{req.price.toLocaleString()}</Text>
                    <CountdownBadge expiresAt={req.expiresAt} />
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{req.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="navigate-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{req.distanceKm.toFixed(1)}km</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.detailText}>{req.paymentMethod}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(req.id)}>
                    <Text style={styles.declineButtonText}>辞退</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(req.id)}>
                    <Ionicons name="checkmark" size={20} color={Colors.white} />
                    <Text style={styles.acceptButtonText}>承認する</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Active Jobs */}
        {activeRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>進行中の作業</Text>

            {activeRequests.map((req) => {
              const statusInfo = ORDER_STATUS_COLORS[req.status];
              return (
                <View key={req.id} style={styles.activeCard}>
                  <View style={styles.requestHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requestService}>{req.service}</Text>
                      <Text style={styles.requestCustomer}>{req.customer}</Text>
                      <Text style={styles.activeAddress}>{req.address}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                        {ORDER_STATUS_LABELS[req.status]}
                      </Text>
                    </View>
                  </View>

                  {req.status === 'accepted' && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleStartWork(req.id)}>
                      <Ionicons name="play" size={18} color={Colors.white} />
                      <Text style={styles.actionBtnText}>作業開始</Text>
                    </TouchableOpacity>
                  )}

                  {req.status === 'in_progress' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                      onPress={() => handleMarkDone(req.id)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                      <Text style={styles.actionBtnText}>作業完了報告</Text>
                    </TouchableOpacity>
                  )}

                  {req.status === 'pro_marked_done' && (
                    <View style={styles.waitingCard}>
                      <Ionicons name="hourglass-outline" size={18} color={Colors.primaryMedium} />
                      <Text style={styles.waitingText}>
                        お客さまの完了確認を待っています（30分後に自動完了）
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{req.paymentMethod}</Text>
                    <Text style={styles.priceValue}>¥{req.price.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {pendingRequests.length === 0 && activeRequests.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>新着の依頼はありません</Text>
            <Text style={styles.emptySubtext}>GPSをONにして依頼を待ちましょう</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  badge: { backgroundColor: Colors.error, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white },
  timeoutNotice: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.warning + '15', padding: Spacing.md,
    borderRadius: BorderRadius.sm, marginBottom: Spacing.md,
  },
  timeoutText: { fontSize: FontSize.xs, color: Colors.warning, flex: 1 },
  requestCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, position: 'relative', overflow: 'hidden',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  newIndicator: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.primary },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  requestService: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  requestCustomer: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  requestRight: { alignItems: 'flex-end', gap: Spacing.sm },
  requestPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  requestDetails: { marginTop: Spacing.md, gap: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  declineButton: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  declineButtonText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  acceptButton: {
    flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary, gap: Spacing.sm,
  },
  acceptButtonText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  activeCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  activeAddress: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: BorderRadius.full },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  actionBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary, paddingVertical: 12,
    borderRadius: BorderRadius.md, marginTop: Spacing.md, gap: Spacing.sm,
  },
  actionBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  waitingCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryFaint, padding: Spacing.md,
    borderRadius: BorderRadius.sm, marginTop: Spacing.md,
  },
  waitingText: { fontSize: FontSize.sm, color: Colors.primaryMedium, flex: 1 },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.md, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  priceLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  priceValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl * 2, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textMuted },
});
