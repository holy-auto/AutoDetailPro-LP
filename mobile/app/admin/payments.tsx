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

type PayoutTab = 'all' | 'instant' | 'weekly' | 'monthly';

const SUMMARY = {
  total: 892000,
  instant: { amount: 156000, count: 12, fee: 4680 },
  weekly: { amount: 425000, count: 34 },
  monthly: { amount: 311000, count: 22 },
};

const MOCK_PAYMENTS = [
  { id: '1', pro: '田中 太郎', amount: 3000, schedule: 'instant' as const, fee: 90, status: 'paid', date: '2026-04-07' },
  { id: '2', pro: '佐藤 健一', amount: 15000, schedule: 'weekly' as const, fee: 0, status: 'pending', date: '2026-04-07' },
  { id: '3', pro: '鈴木 美咲', amount: 25000, schedule: 'monthly' as const, fee: 0, status: 'pending', date: '2026-04-05' },
  { id: '4', pro: '田中 太郎', amount: 5000, schedule: 'instant' as const, fee: 150, status: 'paid', date: '2026-04-06' },
  { id: '5', pro: '木村 翔太', amount: 8000, schedule: 'weekly' as const, fee: 0, status: 'pending', date: '2026-04-04' },
];

const TAB_LABELS: Record<PayoutTab, string> = {
  all: 'すべて',
  instant: '即日払い',
  weekly: '週払い',
  monthly: '月払い',
};

export default function AdminPaymentsScreen() {
  const [tab, setTab] = useState<PayoutTab>('all');

  const filtered =
    tab === 'all'
      ? MOCK_PAYMENTS
      : MOCK_PAYMENTS.filter((p) => p.schedule === tab);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>決済管理</Text>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.primary }]}>
            <Text style={styles.summaryLabel}>今月合計</Text>
            <Text style={styles.summaryValue}>
              ¥{SUMMARY.total.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>即日払い</Text>
            <Text style={styles.miniValue}>
              ¥{SUMMARY.instant.amount.toLocaleString()}
            </Text>
            <Text style={styles.miniCount}>{SUMMARY.instant.count}件</Text>
            <Text style={styles.miniFee}>
              手数料: ¥{SUMMARY.instant.fee.toLocaleString()}
            </Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>週払い</Text>
            <Text style={styles.miniValue}>
              ¥{SUMMARY.weekly.amount.toLocaleString()}
            </Text>
            <Text style={styles.miniCount}>{SUMMARY.weekly.count}件</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.miniLabel}>月払い</Text>
            <Text style={styles.miniValue}>
              ¥{SUMMARY.monthly.amount.toLocaleString()}
            </Text>
            <Text style={styles.miniCount}>{SUMMARY.monthly.count}件</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabs}>
          {(Object.keys(TAB_LABELS) as PayoutTab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {TAB_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment List */}
        {filtered.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentPro}>{payment.pro}</Text>
              <Text style={styles.paymentDate}>{payment.date}</Text>
            </View>
            <View style={styles.paymentRight}>
              <Text style={styles.paymentAmount}>
                ¥{payment.amount.toLocaleString()}
              </Text>
              <View style={styles.paymentMeta}>
                <View
                  style={[
                    styles.paymentStatus,
                    {
                      backgroundColor:
                        payment.status === 'paid'
                          ? Colors.success + '20'
                          : Colors.warning + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      {
                        color:
                          payment.status === 'paid'
                            ? Colors.success
                            : Colors.warning,
                      },
                    ]}
                  >
                    {payment.status === 'paid' ? '支払済' : '未払い'}
                  </Text>
                </View>
                {payment.fee > 0 && (
                  <Text style={styles.paymentFee}>
                    手数料 ¥{payment.fee}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
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
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.primaryPale,
  },
  summaryValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 4,
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  miniLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  miniValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  miniCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  miniFee: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: '600',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
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
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  paymentCard: {
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
  paymentInfo: {
    flex: 1,
  },
  paymentPro: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  paymentStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  paymentStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  paymentFee: {
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
});
