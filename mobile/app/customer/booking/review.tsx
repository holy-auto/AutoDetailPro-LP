import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { REVIEW } from '@/constants/business-rules';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ proName: string; orderId: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('エラー', '評価を選択してください');
      return;
    }
    // In production: save to Supabase
    Alert.alert('ありがとうございます', 'レビューが投稿されました', [
      { text: 'OK', onPress: () => router.dismissAll() },
    ]);
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

      <View style={styles.content}>
        <Text style={styles.proName}>{params.proName}</Text>
        <Text style={styles.subtitle}>サービスはいかがでしたか？</Text>

        {/* Star Rating */}
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
          {rating === 0 && 'タップして評価'}
          {rating === 1 && '不満'}
          {rating === 2 && 'やや不満'}
          {rating === 3 && '普通'}
          {rating === 4 && '満足'}
          {rating === 5 && '大変満足'}
        </Text>

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
        />

        <Text style={styles.note}>
          レビューは一方公開です（あなたのレビューはすぐに公開されます）
        </Text>

        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitBtnText}>レビューを投稿</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.dismissAll()}
        >
          <Text style={styles.skipBtnText}>スキップ</Text>
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
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1, alignItems: 'center', padding: Spacing.lg, paddingTop: Spacing.xxl },
  proName: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  starsRow: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl,
  },
  ratingLabel: {
    fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '600',
    marginTop: Spacing.md,
  },
  commentInput: {
    width: '100%', backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.xl,
    minHeight: 100,
  },
  note: {
    fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%', backgroundColor: Colors.primary, paddingVertical: 16,
    borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.xl,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  skipBtn: { paddingVertical: Spacing.md, marginTop: Spacing.sm },
  skipBtnText: { fontSize: FontSize.md, color: Colors.textMuted },
});
