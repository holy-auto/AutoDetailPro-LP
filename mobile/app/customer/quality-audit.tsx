import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { QUALITY_AUDIT } from '@/constants/business-rules';
import { submitAuditResponse } from '@/lib/quality-audit';

const SCORE_LABELS = ['', '悪い', 'やや不満', '普通', '良い', 'とても良い'];
const SCORE_COLORS = ['', '#EF4444', '#F59E0B', '#94A3B8', '#3B82F6', '#22C55E'];

export default function QualityAuditScreen() {
  const router = useRouter();
  const { auditId } = useLocalSearchParams<{ auditId: string }>();

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const allAnswered = QUALITY_AUDIT.CHECKLIST.every((item) => scores[item.id] !== undefined);

  const overallScore = (() => {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const item of QUALITY_AUDIT.CHECKLIST) {
      const score = scores[item.id];
      if (score !== undefined) {
        weightedSum += score * item.weight;
        totalWeight += item.weight;
      }
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  })();

  const handleScore = (itemId: string, score: number) => {
    setScores((prev) => ({ ...prev, [itemId]: score }));
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      Alert.alert('未回答の項目があります', 'すべての項目を評価してください。');
      return;
    }
    if (!auditId) {
      Alert.alert('エラー', '調査IDが見つかりません');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAuditResponse({
        auditId,
        scores,
        comment: comment || undefined,
      });
      if (!result.success) {
        Alert.alert('エラー', result.error ?? '送信に失敗しました');
        return;
      }
      setCouponCode(result.data!.couponCode);
      setCompleted(true);
    } catch {
      Alert.alert('エラー', '送信に失敗しました。再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completedContainer}>
          <View style={styles.completedIcon}>
            <Ionicons name="gift" size={48} color={Colors.success} />
          </View>
          <Text style={styles.completedTitle}>ご協力ありがとうございます！</Text>
          <Text style={styles.completedSub}>
            品質向上に役立てさせていただきます。
          </Text>

          <View style={styles.couponCard}>
            <View style={styles.couponBadge}>
              <Text style={styles.couponBadgeText}>
                {QUALITY_AUDIT.REWARD_COUPON.VALUE}%OFF
              </Text>
            </View>
            <Text style={styles.couponTitle}>お礼クーポン</Text>
            <Text style={styles.couponCode}>{couponCode}</Text>
            <Text style={styles.couponExpiry}>
              有効期限: {QUALITY_AUDIT.REWARD_COUPON.VALID_DAYS}日間
            </Text>
            <Text style={styles.couponNote}>
              次回のご利用時に自動適用されます
            </Text>
          </View>

          <View style={styles.scoreSummary}>
            <Text style={styles.scoreSummaryLabel}>あなたの評価</Text>
            <Text style={styles.scoreSummaryValue}>
              {overallScore.toFixed(1)} / {QUALITY_AUDIT.SCORE_SCALE}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>閉じる</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>品質チェック</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.introBadge}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.introBadgeText}>覆面調査</Text>
          </View>
          <Text style={styles.introTitle}>サービス品質チェック</Text>
          <Text style={styles.introSub}>
            お客様の率直なご意見がプロのサービス向上に繋がります。{'\n'}
            ご協力いただいた方に{QUALITY_AUDIT.REWARD_COUPON.VALUE}%OFFクーポンをプレゼント！
          </Text>
        </View>

        {/* Checklist */}
        {QUALITY_AUDIT.CHECKLIST.map((item, index) => {
          const selected = scores[item.id];
          return (
            <View key={item.id} style={styles.checkItem}>
              <View style={styles.checkItemHeader}>
                <Text style={styles.checkItemNumber}>{index + 1}</Text>
                <Text style={styles.checkItemLabel}>{item.label}</Text>
              </View>
              <View style={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.scoreButton,
                      selected === score && {
                        backgroundColor: SCORE_COLORS[score],
                        borderColor: SCORE_COLORS[score],
                      },
                    ]}
                    onPress={() => handleScore(item.id, score)}
                  >
                    <Text
                      style={[
                        styles.scoreButtonText,
                        selected === score && styles.scoreButtonTextSelected,
                      ]}
                    >
                      {score}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selected !== undefined && (
                <Text style={[styles.scoreLabel, { color: SCORE_COLORS[selected] }]}>
                  {SCORE_LABELS[selected]}
                </Text>
              )}
            </View>
          );
        })}

        {/* Progress */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(Object.keys(scores).length / QUALITY_AUDIT.CHECKLIST.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Object.keys(scores).length} / {QUALITY_AUDIT.CHECKLIST.length} 項目回答済み
        </Text>

        {/* Reward reminder */}
        <View style={styles.rewardReminder}>
          <Ionicons name="gift-outline" size={18} color={Colors.success} />
          <Text style={styles.rewardReminderText}>
            すべて回答すると{QUALITY_AUDIT.REWARD_COUPON.VALUE}%OFFクーポンがもらえます
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {allAnswered && (
          <View style={styles.previewScore}>
            <Text style={styles.previewScoreLabel}>総合評価</Text>
            <Text style={[
              styles.previewScoreValue,
              { color: overallScore >= 3.5 ? Colors.success : overallScore >= 2.5 ? Colors.warning : Colors.error },
            ]}>
              {overallScore.toFixed(1)}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.submitButton, !allAnswered && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!allAnswered || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={Colors.white} />
              <Text style={styles.submitButtonText}>回答を送信してクーポンをもらう</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: 200 },

  // Intro
  intro: { alignItems: 'center', marginBottom: Spacing.xl },
  introBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
  },
  introBadgeText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  introTitle: {
    fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.md,
  },
  introSub: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20,
  },

  // Check items
  checkItem: {
    backgroundColor: Colors.card, padding: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  checkItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  checkItemNumber: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, color: Colors.white,
    textAlign: 'center', lineHeight: 24,
    fontSize: FontSize.xs, fontWeight: '700',
    marginRight: Spacing.sm, overflow: 'hidden',
  },
  checkItemLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  scoreButton: {
    flex: 1, height: 44, borderRadius: BorderRadius.sm,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.white,
  },
  scoreButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textMuted },
  scoreButtonTextSelected: { color: Colors.white },
  scoreLabel: {
    fontSize: FontSize.xs, fontWeight: '600',
    textAlign: 'center', marginTop: 6,
  },

  // Progress
  progressBar: {
    height: 6, backgroundColor: Colors.borderLight,
    borderRadius: 3, marginTop: Spacing.lg, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 3,
  },
  progressText: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.xs,
  },

  // Reward
  rewardReminder: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', padding: Spacing.md,
    borderRadius: BorderRadius.md, marginTop: Spacing.md, gap: Spacing.sm,
  },
  rewardReminderText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '600', flex: 1 },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.lg, paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  previewScore: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  previewScoreLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  previewScoreValue: { fontSize: FontSize.xxl, fontWeight: '800' },
  submitButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary, paddingVertical: 16,
    borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },

  // Completed
  completedContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  completedIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  completedTitle: {
    fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary,
  },
  completedSub: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm,
  },
  couponCard: {
    width: '100%', backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg, padding: Spacing.xl,
    marginTop: Spacing.xl, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.success, borderStyle: 'dashed',
  },
  couponBadge: {
    backgroundColor: Colors.success,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: BorderRadius.full, marginBottom: Spacing.md,
  },
  couponBadgeText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  couponTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  couponCode: {
    fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary,
    letterSpacing: 2, marginTop: Spacing.sm,
  },
  couponExpiry: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm },
  couponNote: { fontSize: FontSize.sm, color: Colors.success, marginTop: Spacing.xs },
  scoreSummary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', backgroundColor: Colors.primaryFaint,
    padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.lg,
  },
  scoreSummaryLabel: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  scoreSummaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  doneButton: {
    backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 48,
    borderRadius: BorderRadius.md, marginTop: Spacing.xl,
  },
  doneButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
