import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

const QUICK_TAGS = [
  '丁寧な仕上がり',
  '時間通り',
  '親切な対応',
  'ピカピカ',
  'また頼みたい',
];

export default function ReviewScreen() {
  const router = useRouter();
  const { orderId, proName } = useLocalSearchParams<{
    orderId: string;
    proName: string;
  }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const buildFinalComment = (): string => {
    const parts: string[] = [];
    if (comment.trim()) {
      parts.push(comment.trim());
    }
    if (selectedTags.length > 0) {
      parts.push(selectedTags.map((t) => `#${t}`).join(' '));
    }
    return parts.join('\n');
  };

  const handleSubmit = () => {
    if (rating === 0) return;

    setSubmitting(true);

    // Demo mode: simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  // --- Thank you screen ---
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.thankYouContainer}>
          <View style={styles.confettiIcon}>
            <Ionicons name="sparkles" size={48} color={Colors.warning} />
          </View>

          <Text style={styles.thankYouTitle}>ありがとうございます！</Text>
          <Text style={styles.thankYouSub}>
            {proName ? `${proName}さん` : 'プロ'}へのレビューが送信されました
          </Text>

          <View style={styles.pointsBadge}>
            <Ionicons name="diamond" size={20} color={Colors.white} />
            <Text style={styles.pointsBadgeText}>50ポイント獲得</Text>
          </View>

          <View style={styles.reviewSummary}>
            <View style={styles.summaryStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color="#F59E0B"
                />
              ))}
            </View>
            {buildFinalComment() ? (
              <Text style={styles.summaryComment} numberOfLines={3}>
                {buildFinalComment()}
              </Text>
            ) : null}
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

  // --- Main review form ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>レビュー</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pro name */}
        {proName ? (
          <Text style={styles.proName}>{proName}さんはいかがでしたか？</Text>
        ) : (
          <Text style={styles.proName}>サービスはいかがでしたか？</Text>
        )}

        {/* Star rating */}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
              style={styles.starTouchable}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color="#F59E0B"
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {rating === 1
              ? '残念'
              : rating === 2
                ? 'やや不満'
                : rating === 3
                  ? '普通'
                  : rating === 4
                    ? '良い'
                    : '最高！'}
          </Text>
        )}

        {/* Quick tags */}
        <Text style={styles.sectionLabel}>クイックタグ</Text>
        <View style={styles.tagsContainer}>
          {QUICK_TAGS.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagBadge, selected && styles.tagBadgeSelected]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagBadgeText,
                    selected && styles.tagBadgeTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comment */}
        <Text style={styles.sectionLabel}>コメント（任意）</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.commentInput}
            placeholder="コメントを入力（任意）"
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={(text) => setComment(text.slice(0, 300))}
            maxLength={300}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={Colors.white} />
              <Text style={styles.submitButtonText}>レビューを送信</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Content
  content: { padding: Spacing.lg, paddingBottom: 200 },

  proName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // Stars
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  starTouchable: {
    padding: Spacing.xs,
  },
  ratingLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Tags
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tagBadge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: Colors.primaryFaint,
  },
  tagBadgeSelected: {
    backgroundColor: Colors.primaryMedium,
    borderColor: Colors.primaryMedium,
  },
  tagBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primaryMedium,
  },
  tagBadgeTextSelected: {
    color: Colors.white,
  },

  // Comment
  inputWrapper: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  commentInput: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryMedium,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },

  // Thank-you screen
  thankYouContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  confettiIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  thankYouTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  thankYouSub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  pointsBadgeText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
  },
  reviewSummary: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryStars: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  summaryComment: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  doneButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
