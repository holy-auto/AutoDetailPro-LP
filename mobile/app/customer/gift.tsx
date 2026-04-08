import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { GIFT } from '@/constants/business-rules';

const GIFT_AMOUNTS = [3000, 5000, 10000, 15000, 20000, 30000];

export default function GiftScreen() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const canSend = recipientName.trim() && recipientEmail.trim() && selectedAmount;

  const handleSend = () => {
    if (!canSend) return;
    Alert.alert(
      'ギフトを送信',
      `${recipientName}さんに¥${selectedAmount!.toLocaleString()}分のギフトを送りますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '送信する',
          onPress: () => {
            Alert.alert('送信完了', 'ギフトが正常に送信されました！', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ギフトを贈る</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="gift" size={40} color="#F59E0B" />
          </View>
          <Text style={styles.heroTitle}>洗車ギフト</Text>
          <Text style={styles.heroSub}>
            大切な方にプロの洗車をプレゼント{'\n'}
            有効期限: {GIFT.EXPIRY_DAYS}日間
          </Text>
        </View>

        {/* Recipient */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>贈り先</Text>
          <TextInput
            style={styles.input}
            placeholder="お名前"
            value={recipientName}
            onChangeText={setRecipientName}
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            value={recipientEmail}
            onChangeText={setRecipientEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>金額を選択</Text>
          <View style={styles.amountGrid}>
            {GIFT_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountCard,
                  selectedAmount === amount && styles.amountCardSelected,
                ]}
                onPress={() => setSelectedAmount(amount)}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === amount && styles.amountTextSelected,
                  ]}
                >
                  ¥{amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            メッセージ（任意・{GIFT.MESSAGE_MAX_LENGTH}文字以内）
          </Text>
          <TextInput
            style={styles.messageInput}
            placeholder="いつもありがとう！ピカピカの車を楽しんでね"
            value={message}
            onChangeText={(t) => setMessage(t.slice(0, GIFT.MESSAGE_MAX_LENGTH))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.charCount}>
            {message.length}/{GIFT.MESSAGE_MAX_LENGTH}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {selectedAmount && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>合計金額</Text>
            <Text style={styles.summaryValue}>¥{selectedAmount.toLocaleString()}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons name="gift" size={20} color={Colors.white} />
          <Text style={styles.sendButtonText}>ギフトを購入・送信</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: 180 },

  // Hero
  hero: { alignItems: 'center', marginBottom: Spacing.xl },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  heroSub: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20,
  },

  // Section
  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 14, paddingHorizontal: Spacing.md,
    fontSize: FontSize.md, color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  // Amounts
  amountGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amountCard: {
    width: '31%', backgroundColor: Colors.card,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center',
  },
  amountCardSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryFaint,
  },
  amountText: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary,
  },
  amountTextSelected: { color: Colors.primary },

  // Message
  messageInput: {
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md, color: Colors.textPrimary,
    minHeight: 100,
  },
  charCount: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textAlign: 'right', marginTop: 4,
  },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  sendButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 16, borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
