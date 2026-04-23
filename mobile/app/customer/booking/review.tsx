import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { submitReview } from '@/lib/reviews';
import { useAuth } from '../../_layout';

type SubDim = 'punctuality' | 'technical' | 'courtesy';

const SUB_DIMENSIONS: Array<{ key: SubDim; label: string; icon: string }> = [
  { key: 'punctuality', label: '時間厳守', icon: 'time-outline' },
  { key: 'technical', label: '技術', icon: 'construct-outline' },
  { key: 'courtesy', label: '丁寧さ', icon: 'hand-right-outline' },
];

function StarRow({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <View style={styles.starsRowSmall}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} hitSlop={6}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? Colors.gold : Colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    proName: string;
    orderId: string;
    proId: string;
  }>();

  const [rating, setRating] = useState(0);
  const [sub, setSub] = useState<Record<SubDim, number>>({
    punctuality: 0,
    technical: 0,
    courtesy: 0,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('エラー', '総合評価を選択してください');
      return;
    }
    if (!user?.id || !params.orderId || !params.proId) {
      Alert.alert('エラー', 'ユーザー情報が取得できません');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitReview(
        params.orderId,
        user.id,
        params.proId,
        rating,
        comment || undefined,
        undefined,
        {
          punctuality: sub.punctuality || undefined,
          technical: sub.technical || undefined,
          courtesy: sub.courtesy || undefined,
        },
      );
      if (!result.success) {
        Alert.alert('エラー', result.error ?? 'レビュー投稿に失敗しました');
        return;
      }
      Alert.alert('ありがとうございます', 'レビューが投稿されました', [
        { text: 'OK', onPress: () => router.dismissAll() },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismissAll()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>レビュー</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.proName}>{params.proName}</Text>
        <Text style={styles.subtitle}>サービスはいかがでしたか？</Text>

        {/* Overall rating */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={44}
                color={star <= rating ? Colors.gold : Colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating === 0 && 'タップして総合評価'}
          {rating === 1 && '不満'}
          {rating === 2 && 'やや不満'}
          {rating === 3 && '普通'}
          {rating === 4 && '満足'}
          {rating === 5 && '大変満足'}
        </Text>

        {/* Multi-dimensional sub-ratings */}
        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>詳細評価（任意）</Text>
          {SUB_DIMENSIONS.map((dim) => (
            <View key={dim.key} style={styles.subRow}>
              <View style={styles.subLabelWrap}>
                <Ionicons name={dim.icon as any} size={18} color={Colors.primary} />
                <Text style={styles.subLabel}>{dim.label}</Text>
              </View>
              <StarRow
                value={sub[dim.key]}
                onChange={(v) => setSub((prev) => ({ ...prev, [dim.key]: v }))}
              />
            </View>
          ))}
        </View>

        {/* Comment */}
        <TextInput
          style={styles.commentInput}
          placeholder="コメントを入力（任意）"
          placeholderTextColor={Colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={1000}
        />

        <Text style={styles.note}>
          レビューは一方公開です（あなたのレビューはすぐに公開されます）
        </Text>

        <TouchableOpacity
          style={[styles.submitBtn, (rating === 0 || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>レビューを投稿</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.dismissAll()}
          disabled={submitting}
        >
          <Text style={styles.skipBtnText}>スキップ</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  content: {
    alignItems: 'center', padding: Spacing.lg, paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  proName: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  starsRow: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl,
  },
  starsRowSmall: {
    flexDirection: 'row', gap: 4,
  },
  ratingLabel: {
    fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600',
    marginTop: Spacing.md,
  },
  subSection: {
    width: '100%', marginTop: Spacing.xl,
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  subSectionTitle: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  subRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: Spacing.sm,
  },
  subLabelWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  subLabel: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  commentInput: {
    width: '100%', backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.lg,
    minHeight: 100,
  },
  note: {
    fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%', backgroundColor: Colors.primary, paddingVertical: 16,
    borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.lg,
    minHeight: 56, justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  skipBtn: { paddingVertical: Spacing.md, marginTop: Spacing.sm },
  skipBtnText: { fontSize: FontSize.md, color: Colors.textMuted },
});
