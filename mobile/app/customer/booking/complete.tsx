import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { COMPLETION } from '@/constants/business-rules';
import { showInterstitial, preloadInterstitial } from '@/lib/admob';
import AdBanner from '@/components/AdBanner';
import RewardedAdButton from '@/components/RewardedAdButton';
import { saveCoupon } from '@/lib/coupons';
import { useAuth } from '../../_layout';

export default function CompleteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    proName: string;
    proId: string;
    totalPrice: string;
    orderId: string;
    autoCompleted: string;
  }>();

  const totalPrice = parseInt(params.totalPrice ?? '0', 10);
  const isAutoCompleted = params.autoCompleted === 'true';

  // サービス完了後にインタースティシャル広告を表示
  useEffect(() => {
    preloadInterstitial();
    // 少し間を置いてから表示（完了画面を見せてから）
    const timer = setTimeout(() => {
      showInterstitial();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRewardEarned = async (amount: number) => {
    if (!user?.id) return;
    await saveCoupon({
      customerId: user.id,
      amount,
      source: 'rewarded_ad',
      type: 'fixed',
    });
  };

  const handleReview = () => {
    router.replace({
      pathname: '/customer/booking/review',
      params: {
        proName: params.proName,
        orderId: params.orderId,
        proId: params.proId,
      },
    });
  };

  const handleDispute = () => {
    // Navigate to dispute/claim form
    router.dismissAll();
  };

  const handleDone = () => {
    router.dismissAll();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-done" size={56} color={Colors.white} />
        </View>

        <Text style={styles.title}>
          {isAutoCompleted ? '自動完了しました' : 'サービス完了！'}
        </Text>

        {isAutoCompleted && (
          <Text style={styles.autoNote}>
            {COMPLETION.CONFIRMATION_TIMEOUT_MIN}分以内に確認がなかったため自動完了しました
          </Text>
        )}

        <Text style={styles.proName}>{params.proName}</Text>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>お支払い金額</Text>
            <Text style={styles.summaryValue}>¥{totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ステータス</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>決済完了</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.reviewBtn} onPress={handleReview}>
            <Ionicons name="star" size={20} color={Colors.white} />
            <Text style={styles.reviewBtnText}>レビューを書く</Text>
          </TouchableOpacity>

          {/* リワード広告 — 動画視聴でクーポンGET */}
          <RewardedAdButton onRewardEarned={handleRewardEarned} />

          {/* パートナー広告 — 完了画面用 */}
          <AdBanner placement="order_complete" />

          <TouchableOpacity style={styles.disputeBtn} onPress={handleDispute}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.disputeBtnText}>
              問題を報告（{COMPLETION.DISPUTE_WINDOW_HOURS}時間以内）
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>ホームに戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.success,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center',
  },
  autoNote: {
    fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center',
    marginTop: Spacing.xs,
  },
  proName: {
    fontSize: FontSize.lg, color: Colors.primary, fontWeight: '600', marginTop: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    width: '100%', marginTop: Spacing.xl,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  statusBadge: {
    backgroundColor: Colors.success + '20', paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.success },
  actions: { width: '100%', marginTop: Spacing.xl, gap: Spacing.md },
  reviewBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  reviewBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  disputeBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.error, paddingVertical: 12,
    borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  disputeBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.error },
  doneBtn: { alignItems: 'center', paddingVertical: Spacing.md },
  doneBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textMuted },
});
