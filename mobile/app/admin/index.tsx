import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

const today = new Date();
const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

const STAT_CARDS = [
  {
    label: '本日の注文数',
    value: '24',
    icon: 'receipt' as const,
    color: Colors.primaryMedium,
    bg: Colors.primaryFaint,
  },
  {
    label: '売上',
    value: '¥387,200',
    icon: 'trending-up' as const,
    color: Colors.success,
    bg: Colors.success + '15',
  },
  {
    label: 'アクティブプロ',
    value: '18',
    icon: 'people' as const,
    color: Colors.warning,
    bg: Colors.warning + '15',
  },
  {
    label: '新規登録',
    value: '5',
    icon: 'person-add' as const,
    color: Colors.info,
    bg: Colors.info + '15',
  },
];

const ACTION_ITEMS = [
  {
    label: 'KYC審査待ち',
    count: 7,
    icon: 'shield-checkmark' as const,
    color: Colors.warning,
  },
  {
    label: 'フラグ付きチャット',
    count: 3,
    icon: 'flag' as const,
    color: Colors.error,
  },
  {
    label: '改善プラン対象',
    count: 2,
    icon: 'alert-circle' as const,
    color: '#F59E0B',
  },
  {
    label: 'クレーム対応中',
    count: 1,
    icon: 'warning' as const,
    color: Colors.error,
  },
];

const RECENT_ORDERS = [
  {
    id: '1',
    customer: '山田 太郎',
    pro: '田中 太郎',
    service: '手洗い洗車',
    amount: 3000,
    status: 'in_progress',
    time: '10分前',
  },
  {
    id: '2',
    customer: '高橋 花子',
    pro: '佐藤 健一',
    service: 'コーティング',
    amount: 15000,
    status: 'completed',
    time: '30分前',
  },
  {
    id: '3',
    customer: '田中 一郎',
    pro: '鈴木 美咲',
    service: 'フルディテイル',
    amount: 25000,
    status: 'accepted',
    time: '1時間前',
  },
  {
    id: '4',
    customer: '佐々木 健',
    pro: '木村 翔太',
    service: '内装クリーニング',
    amount: 8000,
    status: 'arriving',
    time: '1時間半前',
  },
  {
    id: '5',
    customer: '中村 美咲',
    pro: '渡辺 大輔',
    service: '手洗い洗車',
    amount: 3500,
    status: 'completed',
    time: '2時間前',
  },
];

const STATUS_LABELS: Record<string, { text: string; color: string; bg: string }> = {
  searching: { text: '検索中', color: Colors.info, bg: Colors.info + '20' },
  accepted: { text: '承認済', color: Colors.primary, bg: Colors.primaryFaint },
  arriving: { text: '移動中', color: Colors.warning, bg: Colors.warning + '20' },
  in_progress: { text: '作業中', color: Colors.gold, bg: Colors.goldLight + '40' },
  pending_confirm: { text: '確認待', color: Colors.warning, bg: Colors.warning + '20' },
  completed: { text: '完了', color: Colors.success, bg: Colors.success + '20' },
};

export default function AdminDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>管理者ダッシュボード</Text>
            <Text style={styles.subtitle}>{formattedDate}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="notifications" size={20} color={Colors.primary} />
            <View style={styles.notifDot} />
          </View>
        </View>

        {/* Stat Cards Row */}
        <View style={styles.statGrid}>
          {STAT_CARDS.map((card, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={18} color={card.color} />
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>要対応アイテム</Text>
          <View style={styles.actionGrid}>
            {ACTION_ITEMS.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.actionCard}>
                <View style={styles.actionCardTop}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                  <View style={[styles.actionCountBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.actionCountText}>{item.count}件</Text>
                  </View>
                </View>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>直近の注文</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>すべて見る</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ORDERS.map((order) => {
            const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.completed;
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderService}>{order.service}</Text>
                  <Text style={styles.orderParties}>
                    {order.customer} → {order.pro}
                  </Text>
                  <Text style={styles.orderTime}>{order.time}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>
                    ¥{order.amount.toLocaleString()}
                  </Text>
                  <View
                    style={[styles.orderStatus, { backgroundColor: status.bg }]}
                  >
                    <Text style={[styles.orderStatusText, { color: status.color }]}>
                      {status.text}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerBadge: {
    position: 'relative',
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },

  // Stat cards
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
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
    alignItems: 'center',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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

  // Action items
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
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
  actionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionCountBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  actionCountText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Orders
  orderCard: {
    flexDirection: 'row',
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
  orderInfo: {
    flex: 1,
  },
  orderService: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  orderParties: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  orderRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  orderAmount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  orderStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
