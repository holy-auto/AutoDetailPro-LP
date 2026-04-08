import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { ORDER_STATUSES } from '@/constants/categories';

type Tab = 'active' | 'history';

const MOCK_ACTIVE_ORDERS = [
  {
    id: '1',
    proName: '田中 太郎',
    service: '手洗い洗車',
    status: 'arriving' as const,
    eta: '5分',
    price: 3000,
    date: '2026-04-07',
    paymentMethod: 'online',
  },
];

const MOCK_HISTORY = [
  {
    id: '2',
    proName: '佐藤 健一',
    service: 'ガラスコーティング',
    status: 'completed' as const,
    price: 15000,
    date: '2026-04-05',
    paymentMethod: 'online',
    reviewed: true,
    rating: 5,
  },
  {
    id: '3',
    proName: '鈴木 美咲',
    service: 'フルディテイルコース',
    status: 'completed' as const,
    price: 25000,
    date: '2026-04-01',
    paymentMethod: 'cash',
    reviewed: false,
    rating: null,
  },
];

const STATUS_STEPS = ['searching', 'accepted', 'arriving', 'in_progress', 'pending_confirm', 'completed'];

function getStatusIndex(status: string) {
  return STATUS_STEPS.indexOf(status);
}

export default function OrdersScreen() {
  const [tab, setTab] = useState<Tab>('active');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>予約管理</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            進行中
          </Text>
          {MOCK_ACTIVE_ORDERS.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{MOCK_ACTIVE_ORDERS.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            履歴
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'active' ? (
          MOCK_ACTIVE_ORDERS.length > 0 ? (
            MOCK_ACTIVE_ORDERS.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderService}>{order.service}</Text>
                    <Text style={styles.orderPro}>{order.proName}</Text>
                  </View>
                  <View style={styles.orderEta}>
                    <Text style={styles.orderEtaTime}>{order.eta}</Text>
                    <Text style={styles.orderEtaLabel}>到着予定</Text>
                  </View>
                </View>

                {/* Status Tracker */}
                <View style={styles.tracker}>
                  {ORDER_STATUSES.map((step, idx) => {
                    const currentIdx = getStatusIndex(order.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <View key={step.id} style={styles.trackerStep}>
                        <View
                          style={[
                            styles.trackerDot,
                            isCompleted && styles.trackerDotCompleted,
                            isCurrent && styles.trackerDotCurrent,
                          ]}
                        >
                          {isCompleted && (
                            <Ionicons name="checkmark" size={10} color={Colors.white} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.trackerLabel,
                            isCurrent && styles.trackerLabelCurrent,
                          ]}
                          numberOfLines={1}
                        >
                          {step.label}
                        </Text>
                        {idx < ORDER_STATUSES.length - 1 && (
                          <View
                            style={[
                              styles.trackerLine,
                              isCompleted && styles.trackerLineCompleted,
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderPrice}>
                    ¥{order.price.toLocaleString()}
                  </Text>
                  <Text style={styles.orderPayment}>
                    {order.paymentMethod === 'online' ? 'オンライン決済' : '現金決済'}
                  </Text>
                </View>

                {order.status === 'pending_confirm' && (
                  <TouchableOpacity style={styles.confirmButton}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                    <Text style={styles.confirmButtonText}>作業完了を確認</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>進行中の予約はありません</Text>
            </View>
          )
        ) : (
          MOCK_HISTORY.map((order) => (
            <View key={order.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.orderService}>{order.service}</Text>
                  <Text style={styles.orderPro}>{order.proName}</Text>
                  <Text style={styles.historyDate}>{order.date}</Text>
                </View>
                <Text style={styles.historyPrice}>
                  ¥{order.price.toLocaleString()}
                </Text>
              </View>

              {order.reviewed ? (
                <View style={styles.reviewDone}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={16}
                        color={s <= (order.rating ?? 0) ? Colors.gold : Colors.border}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDoneText}>レビュー済み</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.reviewButton}>
                  <Ionicons name="star-outline" size={18} color={Colors.primary} />
                  <Text style={styles.reviewButtonText}>レビューを書く</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
  },
  orderCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderService: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderPro: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderEta: {
    alignItems: 'center',
    backgroundColor: Colors.primaryFaint,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  orderEtaTime: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  orderEtaLabel: {
    fontSize: FontSize.xs,
    color: Colors.primaryMedium,
  },
  tracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  trackerStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  trackerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerDotCompleted: {
    backgroundColor: Colors.primary,
  },
  trackerDotCurrent: {
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.primaryPale,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  trackerLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  trackerLabelCurrent: {
    color: Colors.primary,
    fontWeight: '700',
  },
  trackerLine: {
    position: 'absolute',
    top: 10,
    left: '60%',
    right: '-40%',
    height: 2,
    backgroundColor: Colors.border,
    zIndex: -1,
  },
  trackerLineCompleted: {
    backgroundColor: Colors.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  orderPrice: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderPayment: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  confirmButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  historyPrice: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  reviewDone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDoneText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  reviewButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
