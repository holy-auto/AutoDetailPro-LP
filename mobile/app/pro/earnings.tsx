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
import { PAYOUT_SCHEDULES } from '@/constants/categories';

type Period = 'today' | 'week' | 'month';

const MOCK_DATA = {
  today: { earnings: 18000, jobs: 3, avg: 6000 },
  week: { earnings: 87000, jobs: 12, avg: 7250 },
  month: { earnings: 342000, jobs: 28, avg: 12214 },
};

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    customer: '山田 太郎',
    service: '手洗い洗車',
    amount: 3000,
    date: '2026-04-07 10:30',
    status: 'paid',
    payoutSchedule: 'instant',
  },
  {
    id: '2',
    customer: '高橋 花子',
    service: 'ガラスコーティング',
    amount: 15000,
    date: '2026-04-07 13:00',
    status: 'pending',
    payoutSchedule: 'weekly',
  },
  {
    id: '3',
    customer: '佐藤 一郎',
    service: 'プレミアム洗車',
    amount: 5000,
    date: '2026-04-06 15:00',
    status: 'paid',
    payoutSchedule: 'monthly',
  },
  {
    id: '4',
    customer: '田中 美咲',
    service: 'フルディテイルコース',
    amount: 25000,
    date: '2026-04-05 11:00',
    status: 'paid',
    payoutSchedule: 'weekly',
  },
];

export default function EarningsScreen() {
  const [period, setPeriod] = useState<Period>('month');
  const data = MOCK_DATA[period];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>売上管理</Text>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTab, period === p && styles.periodTabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  period === p && styles.periodTabTextActive,
                ]}
              >
                {p === 'today' ? '本日' : p === 'week' ? '今週' : '今月'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {period === 'today' ? '本日' : period === 'week' ? '今週' : '今月'}
            の売上
          </Text>
          <Text style={styles.summaryAmount}>
            ¥{data.earnings.toLocaleString()}
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{data.jobs}</Text>
              <Text style={styles.summaryStatLabel}>完了件数</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                ¥{data.avg.toLocaleString()}
              </Text>
              <Text style={styles.summaryStatLabel}>平均単価</Text>
            </View>
          </View>
        </View>

        {/* Payout Schedule Info */}
        <View style={styles.payoutSection}>
          <Text style={styles.sectionTitle}>振込スケジュール</Text>
          <View style={styles.payoutCards}>
            {PAYOUT_SCHEDULES.map((schedule) => (
              <View key={schedule.id} style={styles.payoutCard}>
                <Text style={styles.payoutName}>{schedule.name}</Text>
                <Text style={styles.payoutDesc}>{schedule.description}</Text>
                {schedule.fee > 0 && (
                  <Text style={styles.payoutFee}>手数料 +{schedule.fee}%</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>取引履歴</Text>
          {MOCK_TRANSACTIONS.map((tx) => {
            const schedule = PAYOUT_SCHEDULES.find(
              (s) => s.id === tx.payoutSchedule
            );
            return (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txInfo}>
                  <Text style={styles.txService}>{tx.service}</Text>
                  <Text style={styles.txCustomer}>{tx.customer}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>
                    ¥{tx.amount.toLocaleString()}
                  </Text>
                  <View style={styles.txMeta}>
                    <View
                      style={[
                        styles.txStatus,
                        {
                          backgroundColor:
                            tx.status === 'paid'
                              ? Colors.primaryFaint
                              : Colors.goldLight + '40',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.txStatusText,
                          {
                            color:
                              tx.status === 'paid'
                                ? Colors.primary
                                : Colors.gold,
                          },
                        ]}
                      >
                        {tx.status === 'paid' ? '入金済' : '未入金'}
                      </Text>
                    </View>
                    <Text style={styles.txSchedule}>{schedule?.name}</Text>
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
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  periodTabText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  periodTabTextActive: {
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.primaryPale,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  summaryStats: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  summaryStatLabel: {
    fontSize: FontSize.xs,
    color: Colors.primaryPale,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  payoutSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  payoutCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  payoutCard: {
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
  payoutName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  payoutDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  payoutFee: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.gold,
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  txCard: {
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
  txInfo: {
    flex: 1,
  },
  txService: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  txCustomer: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  txDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  txAmount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  txStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  txStatusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  txSchedule: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
