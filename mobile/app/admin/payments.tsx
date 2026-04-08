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
import { PAYOUT_SCHEDULES, CASH_SETTLEMENT } from '@/constants/business-rules';

type Tab = 'overview' | 'payouts' | 'cash' | 'disputes';

const SUMMARY = {
  total: 892000,
  online: { captured: 624000, authorized: 45000, refunded: 12000 },
  cash: { collected: 268000, outstanding: 38000, invoiced: 15000 },
  fees: { stripe: 18400, instant_payout: 4680 },
};

const MOCK_PAYOUTS = [
  { id: '1', pro: '田中 太郎', amount: 18000, schedule: 'instant' as const, fee: 540, status: 'paid', date: '2026-04-07' },
  { id: '2', pro: '佐藤 健一', amount: 15000, schedule: 'weekly' as const, fee: 0, status: 'pending', date: '2026-04-07' },
  { id: '3', pro: '鈴木 美咲', amount: 25000, schedule: 'monthly' as const, fee: 0, status: 'pending', date: '2026-04-05' },
];

const MOCK_CASH_LEDGER = [
  { id: '1', pro: '佐藤 健一', cashAmount: 15000, cardBalance: 42000, offsetted: true, date: '2026-04-07' },
  { id: '2', pro: '木村 翔太', cashAmount: 8000, cardBalance: 0, offsetted: false, invoiced: true, overdue: false, date: '2026-04-05' },
  { id: '3', pro: '山本 剛', cashAmount: 12000, cardBalance: 0, offsetted: false, invoiced: true, overdue: true, date: '2026-03-28' },
];

const MOCK_DISPUTES = [
  { id: '1', customer: '渡辺 さくら', pro: '田中 太郎', service: '手洗い洗車', amount: 3000, reason: '作業の仕上がりに不満', status: 'open', date: '2026-04-07' },
  { id: '2', customer: '伊藤 翼', pro: '佐藤 健一', service: 'コーティング', amount: 15000, reason: '一部作業未実施', status: 'open', date: '2026-04-06' },
  { id: '3', customer: '松本 健', pro: '鈴木 美咲', service: 'フルディテイル', amount: 25000, reason: '品質不満', status: 'resolved', refundPercent: 30, date: '2026-04-03' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: '概要' },
  { id: 'payouts', label: '支払い' },
  { id: 'cash', label: '現金管理' },
  { id: 'disputes', label: 'クレーム' },
];

export default function AdminPaymentsScreen() {
  const [tab, setTab] = useState<Tab>('overview');

  const handleResolveDispute = (id: string, action: 'reject' | 'partial' | 'full') => {
    const labels = { reject: '返金却下', partial: '一部返金(10-50%)', full: '全額返金' };
    Alert.alert('審査結果', `${labels[action]}で処理しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '確定', onPress: () => {} },
    ]);
  };

  const handleSuspendPro = (proName: string) => {
    Alert.alert('受注停止', `${proName}の受注を停止しますか？現金決済も無効化されます。`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '停止する', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>今月総売上</Text>
              <Text style={styles.heroValue}>¥{SUMMARY.total.toLocaleString()}</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>オンライン確定</Text>
                <Text style={styles.statValue}>¥{SUMMARY.online.captured.toLocaleString()}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>オーソリ中</Text>
                <Text style={styles.statValue}>¥{SUMMARY.online.authorized.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>現金回収済</Text>
                <Text style={styles.statValue}>¥{SUMMARY.cash.collected.toLocaleString()}</Text>
              </View>
              <View style={[styles.statCard, SUMMARY.cash.outstanding > 0 && styles.statCardWarning]}>
                <Text style={styles.statLabel}>現金未収</Text>
                <Text style={[styles.statValue, { color: Colors.warning }]}>
                  ¥{SUMMARY.cash.outstanding.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>返金合計</Text>
                <Text style={[styles.statValue, { color: Colors.error }]}>
                  -¥{SUMMARY.online.refunded.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>手数料合計</Text>
                <Text style={styles.statValue}>
                  ¥{(SUMMARY.fees.stripe + SUMMARY.fees.instant_payout).toLocaleString()}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* PAYOUTS */}
        {tab === 'payouts' && (
          <>
            <View style={styles.scheduleRow}>
              {PAYOUT_SCHEDULES.map((s) => (
                <View key={s.id} style={styles.scheduleCard}>
                  <Text style={styles.scheduleName}>{s.name}</Text>
                  <Text style={styles.scheduleDesc}>{s.description}</Text>
                </View>
              ))}
            </View>

            {MOCK_PAYOUTS.map((payout) => (
              <View key={payout.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{payout.pro}</Text>
                  <Text style={styles.itemDate}>{payout.date}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemAmount}>¥{payout.amount.toLocaleString()}</Text>
                  <View style={styles.itemMeta}>
                    <View style={[styles.itemBadge, {
                      backgroundColor: payout.status === 'paid' ? Colors.success + '20' : Colors.warning + '20',
                    }]}>
                      <Text style={[styles.itemBadgeText, {
                        color: payout.status === 'paid' ? Colors.success : Colors.warning,
                      }]}>
                        {payout.status === 'paid' ? '支払済' : '未払い'}
                      </Text>
                    </View>
                    {payout.fee > 0 && (
                      <Text style={styles.feeText}>手数料¥{payout.fee}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* CASH MANAGEMENT */}
        {tab === 'cash' && (
          <>
            <View style={styles.cashInfo}>
              <Ionicons name="information-circle" size={18} color={Colors.info} />
              <Text style={styles.cashInfoText}>
                現金売上はカード売上から自動相殺。相殺不可の場合は請求書発行。
                期限内に未入金の場合は受注停止・現金決済無効化。
              </Text>
            </View>

            {MOCK_CASH_LEDGER.map((entry) => (
              <View key={entry.id} style={[styles.cashCard, entry.overdue && styles.cashCardOverdue]}>
                <View style={styles.cashHeader}>
                  <Text style={styles.cashPro}>{entry.pro}</Text>
                  {entry.overdue && (
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueBadgeText}>支払い遅延</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cashDetails}>
                  <View style={styles.cashRow}>
                    <Text style={styles.cashLabel}>現金売上</Text>
                    <Text style={styles.cashValue}>¥{entry.cashAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.cashRow}>
                    <Text style={styles.cashLabel}>カード残高</Text>
                    <Text style={styles.cashValue}>
                      ¥{entry.cardBalance.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.cashRow}>
                    <Text style={styles.cashLabel}>ステータス</Text>
                    <Text style={[styles.cashStatus, {
                      color: entry.offsetted ? Colors.success
                        : entry.overdue ? Colors.error
                        : Colors.warning,
                    }]}>
                      {entry.offsetted ? '相殺済み'
                        : entry.invoiced ? (entry.overdue ? '請求書発行済(遅延)' : '請求書発行済')
                        : '未処理'}
                    </Text>
                  </View>
                </View>

                {entry.overdue && (
                  <TouchableOpacity
                    style={styles.suspendBtn}
                    onPress={() => handleSuspendPro(entry.pro)}
                  >
                    <Ionicons name="ban" size={16} color={Colors.white} />
                    <Text style={styles.suspendBtnText}>受注停止 / 現金無効化</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {/* DISPUTES */}
        {tab === 'disputes' && (
          <>
            <View style={styles.disputeInfo}>
              <Text style={styles.disputeInfoText}>
                施工後24時間以内のクレーム申請を審査。作業未実施=100%、品質不満=10-50%返金。
              </Text>
            </View>

            {MOCK_DISPUTES.map((dispute) => (
              <View key={dispute.id} style={styles.disputeCard}>
                <View style={styles.disputeHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disputeService}>{dispute.service}</Text>
                    <Text style={styles.disputeParties}>
                      {dispute.customer} → {dispute.pro}
                    </Text>
                  </View>
                  <View style={[styles.disputeStatusBadge, {
                    backgroundColor: dispute.status === 'open' ? Colors.error + '20' : Colors.success + '20',
                  }]}>
                    <Text style={[styles.disputeStatusText, {
                      color: dispute.status === 'open' ? Colors.error : Colors.success,
                    }]}>
                      {dispute.status === 'open' ? '審査中' : '解決済'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.disputeReason}>{dispute.reason}</Text>
                <Text style={styles.disputeAmount}>対象金額: ¥{dispute.amount.toLocaleString()}</Text>

                {dispute.status === 'resolved' && (
                  <Text style={styles.disputeResolution}>
                    返金: {dispute.refundPercent}% (¥{Math.round(dispute.amount * (dispute.refundPercent ?? 0) / 100).toLocaleString()})
                  </Text>
                )}

                {dispute.status === 'open' && (
                  <View style={styles.disputeActions}>
                    <TouchableOpacity
                      style={styles.disputeRejectBtn}
                      onPress={() => handleResolveDispute(dispute.id, 'reject')}
                    >
                      <Text style={styles.disputeRejectText}>却下</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.disputePartialBtn}
                      onPress={() => handleResolveDispute(dispute.id, 'partial')}
                    >
                      <Text style={styles.disputePartialText}>一部返金</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.disputeFullBtn}
                      onPress={() => handleResolveDispute(dispute.id, 'full')}
                    >
                      <Text style={styles.disputeFullText}>全額返金</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.offWhite, borderRadius: BorderRadius.md,
    padding: 4, marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  // Overview
  heroCard: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  heroLabel: { fontSize: FontSize.sm, color: Colors.primaryPale },
  heroValue: { fontSize: 36, fontWeight: '800', color: Colors.white, marginTop: 4 },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: {
    flex: 1, backgroundColor: Colors.card, padding: Spacing.md, borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  statCardWarning: { borderWidth: 1, borderColor: Colors.warning },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },

  // Payouts
  scheduleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  scheduleCard: { flex: 1, backgroundColor: Colors.card, padding: Spacing.md, borderRadius: BorderRadius.md },
  scheduleName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  scheduleDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  itemCard: {
    flexDirection: 'row', backgroundColor: Colors.card, padding: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  itemDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  itemRight: { alignItems: 'flex-end' },
  itemAmount: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  itemBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  itemBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  feeText: { fontSize: FontSize.xs, color: Colors.gold },

  // Cash
  cashInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.info + '10', padding: Spacing.md,
    borderRadius: BorderRadius.sm, marginBottom: Spacing.md,
  },
  cashInfoText: { fontSize: FontSize.xs, color: Colors.info, flex: 1, lineHeight: 18 },
  cashCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  cashCardOverdue: { borderWidth: 1, borderColor: Colors.error },
  cashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cashPro: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  overdueBadge: { backgroundColor: Colors.error + '20', paddingVertical: 2, paddingHorizontal: 8, borderRadius: BorderRadius.full },
  overdueBadgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.error },
  cashDetails: { gap: 4 },
  cashRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cashLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  cashValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  cashStatus: { fontSize: FontSize.sm, fontWeight: '700' },
  suspendBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.error, paddingVertical: 10, borderRadius: BorderRadius.md,
    marginTop: Spacing.md, gap: Spacing.sm,
  },
  suspendBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },

  // Disputes
  disputeInfo: {
    backgroundColor: Colors.warning + '10', padding: Spacing.md,
    borderRadius: BorderRadius.sm, marginBottom: Spacing.md,
  },
  disputeInfoText: { fontSize: FontSize.xs, color: Colors.warning, lineHeight: 18 },
  disputeCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  disputeService: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  disputeParties: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  disputeStatusBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: BorderRadius.full },
  disputeStatusText: { fontSize: FontSize.xs, fontWeight: '600' },
  disputeReason: { fontSize: FontSize.sm, color: Colors.textPrimary, marginTop: Spacing.md },
  disputeAmount: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  disputeResolution: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.warning, marginTop: 4 },
  disputeActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  disputeRejectBtn: {
    flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  disputeRejectText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  disputePartialBtn: {
    flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md,
    backgroundColor: Colors.warning + '20', alignItems: 'center',
  },
  disputePartialText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.warning },
  disputeFullBtn: {
    flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md,
    backgroundColor: Colors.error + '20', alignItems: 'center',
  },
  disputeFullText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.error },
});
