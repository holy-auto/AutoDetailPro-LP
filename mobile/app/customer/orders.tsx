import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { ORDER_STATUSES } from '@/constants/categories';

type Tab = 'active' | 'history';

type OrderItem = {
  id: string;
  proName: string;
  service: string;
  status: string;
  price: number;
  date: string;
  paymentMethod: string;
  eta?: string;
  reviewed?: boolean;
  rating?: number | null;
  address?: string;
  menus?: string[];
  proPhone?: string;
  proRating?: number;
  startedAt?: string;
  completedAt?: string;
};

const MOCK_ACTIVE_ORDERS: OrderItem[] = [
  {
    id: '1',
    proName: '田中 太郎',
    service: '手洗い洗車',
    status: 'arriving',
    eta: '5分',
    price: 3000,
    date: '2026-04-07',
    paymentMethod: 'online',
    address: '東京都渋谷区神南1-2-3',
    menus: ['手洗い洗車'],
    proPhone: '090-1234-5678',
    proRating: 4.9,
  },
];

const MOCK_HISTORY: OrderItem[] = [
  {
    id: '2',
    proName: '佐藤 健一',
    service: 'ガラスコーティング',
    status: 'completed',
    price: 15000,
    date: '2026-04-05',
    paymentMethod: 'online',
    reviewed: true,
    rating: 5,
    address: '東京都港区六本木4-5-6',
    menus: ['ガラスコーティング', 'プレミアム洗車'],
    proRating: 4.8,
    startedAt: '14:00',
    completedAt: '16:05',
  },
  {
    id: '3',
    proName: '鈴木 美咲',
    service: 'フルディテイルコース',
    status: 'completed',
    price: 25000,
    date: '2026-04-01',
    paymentMethod: 'cash',
    reviewed: false,
    rating: null,
    address: '東京都新宿区西新宿7-8-9',
    menus: ['フルディテイルコース'],
    proRating: 5.0,
    startedAt: '10:00',
    completedAt: '13:30',
  },
];

const STATUS_STEPS = ['searching', 'accepted', 'arriving', 'in_progress', 'pending_confirm', 'completed'];

function getStatusIndex(status: string) {
  return STATUS_STEPS.indexOf(status);
}

export default function OrdersScreen() {
  const [tab, setTab] = useState<Tab>('active');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

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
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => setSelectedOrder(order)}
                activeOpacity={0.7}
              >
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
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>進行中の予約はありません</Text>
            </View>
          )
        ) : (
          MOCK_HISTORY.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.historyCard}
              onPress={() => setSelectedOrder(order)}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <SafeAreaView style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>予約詳細</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={28} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.detailContent}>
              {/* Status badge */}
              <View style={styles.detailStatusRow}>
                <View style={[
                  styles.detailStatusBadge,
                  selectedOrder.status === 'completed'
                    ? { backgroundColor: '#DCFCE7' }
                    : { backgroundColor: Colors.primaryFaint },
                ]}>
                  <Text style={[
                    styles.detailStatusText,
                    selectedOrder.status === 'completed'
                      ? { color: '#22C55E' }
                      : { color: Colors.primary },
                  ]}>
                    {selectedOrder.status === 'completed' ? '完了' : '進行中'}
                  </Text>
                </View>
                <Text style={styles.detailDate}>{selectedOrder.date}</Text>
              </View>

              {/* Service info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionLabel}>サービス内容</Text>
                <Text style={styles.detailServiceName}>{selectedOrder.service}</Text>
                {selectedOrder.menus && selectedOrder.menus.length > 0 && (
                  <View style={styles.detailMenuList}>
                    {selectedOrder.menus.map((menu, i) => (
                      <View key={i} style={styles.detailMenuItem}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                        <Text style={styles.detailMenuText}>{menu}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Pro info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionLabel}>担当プロ</Text>
                <View style={styles.detailProCard}>
                  <View style={styles.detailProAvatar}>
                    <Ionicons name="person" size={24} color={Colors.primaryMedium} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailProName}>{selectedOrder.proName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="star" size={14} color={Colors.gold} />
                      <Text style={styles.detailProRating}>{selectedOrder.proRating ?? '-'}</Text>
                    </View>
                  </View>
                  {selectedOrder.proPhone && (
                    <TouchableOpacity style={styles.detailCallButton}>
                      <Ionicons name="call-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Location */}
              {selectedOrder.address && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionLabel}>場所</Text>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
                    <Text style={styles.detailInfoText}>{selectedOrder.address}</Text>
                  </View>
                </View>
              )}

              {/* Time */}
              {(selectedOrder.startedAt || selectedOrder.completedAt) && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionLabel}>作業時間</Text>
                  <View style={styles.detailTimeRow}>
                    {selectedOrder.startedAt && (
                      <View style={styles.detailTimeItem}>
                        <Text style={styles.detailTimeLabel}>開始</Text>
                        <Text style={styles.detailTimeValue}>{selectedOrder.startedAt}</Text>
                      </View>
                    )}
                    {selectedOrder.startedAt && selectedOrder.completedAt && (
                      <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                    )}
                    {selectedOrder.completedAt && (
                      <View style={styles.detailTimeItem}>
                        <Text style={styles.detailTimeLabel}>完了</Text>
                        <Text style={styles.detailTimeValue}>{selectedOrder.completedAt}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Payment */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionLabel}>お支払い</Text>
                <View style={styles.detailPaymentRow}>
                  <Text style={styles.detailPaymentMethod}>
                    {selectedOrder.paymentMethod === 'online' ? 'オンライン決済' : '現金決済'}
                  </Text>
                  <Text style={styles.detailPaymentAmount}>
                    ¥{selectedOrder.price.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Review section for completed orders */}
              {selectedOrder.status === 'completed' && !selectedOrder.reviewed && (
                <TouchableOpacity style={styles.detailReviewButton}>
                  <Ionicons name="star-outline" size={20} color={Colors.white} />
                  <Text style={styles.detailReviewButtonText}>レビューを書く</Text>
                </TouchableOpacity>
              )}

              {selectedOrder.reviewed && (
                <View style={styles.detailReviewDone}>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={20}
                        color={s <= (selectedOrder.rating ?? 0) ? Colors.gold : Colors.border}
                      />
                    ))}
                  </View>
                  <Text style={styles.detailReviewDoneText}>レビュー済み</Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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

  // Detail Modal
  detailContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  detailStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  detailStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  detailStatusText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  detailDate: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  detailSection: {
    marginBottom: Spacing.lg,
  },
  detailSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  detailServiceName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailMenuList: {
    marginTop: Spacing.sm,
    gap: 6,
  },
  detailMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailMenuText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailProCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailProAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailProName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailProRating: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  detailCallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailInfoText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  detailTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  detailTimeItem: {
    alignItems: 'center',
  },
  detailTimeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  detailTimeValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailPaymentMethod: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailPaymentAmount: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  detailReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  detailReviewButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  detailReviewDone: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  detailReviewDoneText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
