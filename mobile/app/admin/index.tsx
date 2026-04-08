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
import { useAuth } from '../_layout';
import { signOut } from '@/lib/auth';

const KPI_CARDS = [
  {
    label: '累計売上',
    value: '¥4,280,000',
    change: '+12.3%',
    positive: true,
    icon: 'trending-up',
  },
  {
    label: '今月売上',
    value: '¥892,000',
    change: '+8.7%',
    positive: true,
    icon: 'cash',
  },
  {
    label: '登録プロ数',
    value: '48',
    change: '+5',
    positive: true,
    icon: 'people',
  },
  {
    label: '稼働中プロ',
    value: '12',
    change: '',
    positive: true,
    icon: 'radio-button-on',
  },
  {
    label: '今月注文数',
    value: '156',
    change: '+23.1%',
    positive: true,
    icon: 'receipt',
  },
  {
    label: '平均評価',
    value: '4.8',
    change: '+0.1',
    positive: true,
    icon: 'star',
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
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>運営ダッシュボード</Text>
            <Text style={styles.subtitle}>Mobile Wash</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => signOut()}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {KPI_CARDS.map((kpi, idx) => (
            <View key={idx} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Ionicons
                  name={kpi.icon as any}
                  size={18}
                  color={Colors.primaryMedium}
                />
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              {kpi.change ? (
                <Text
                  style={[
                    styles.kpiChange,
                    { color: kpi.positive ? Colors.success : Colors.error },
                  ]}
                >
                  {kpi.change}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近の注文</Text>
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
                    style={[
                      styles.orderStatus,
                      { backgroundColor: status.bg },
                    ]}
                  >
                    <Text
                      style={[styles.orderStatusText, { color: status.color }]}
                    >
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
    color: Colors.primaryMedium,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
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
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  kpiValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  kpiChange: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
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
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
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
