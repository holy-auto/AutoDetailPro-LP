import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { useAuth } from '../_layout';
import { supabase } from '@/lib/supabase';

// =============================================
// KYC Gate Screen
// =============================================
// Pros without an approved KYC verification land here. Once they
// complete the (real) KYC flow, the root layout's gate routes them
// back to /pro automatically. This is a minimal placeholder — the
// full document upload / selfie capture flow lives elsewhere.

const STATUS_COPY: Record<string, { title: string; body: string; cta: string }> = {
  missing: {
    title: '本人確認が必要です',
    body: 'プロとして接客するには、運転免許証等の本人確認書類の提出が必要です。所要時間は5分程度です。',
    cta: '本人確認を始める',
  },
  pending: {
    title: '審査中です',
    body: '本人確認書類を確認しています。通常24時間以内に審査が完了します。',
    cta: 'もう一度確認する',
  },
  resubmit: {
    title: '再提出が必要です',
    body: '提出いただいた書類に不備がありました。再度ご提出ください。',
    cta: '再提出する',
  },
  rejected: {
    title: '審査が承認されませんでした',
    body: 'お問い合わせフォームより詳細をご確認ください。',
    cta: 'お問い合わせ',
  },
};

export default function KycGateScreen() {
  const router = useRouter();
  const { kycStatus } = useAuth();
  const status = kycStatus ?? 'missing';
  const copy = STATUS_COPY[status] ?? STATUS_COPY.missing;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>

        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{copy.cta}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleSignOut}>
          <Text style={styles.secondaryBtnText}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl, gap: Spacing.lg,
  },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl, fontWeight: '800',
    color: Colors.textPrimary, textAlign: 'center',
  },
  body: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16, paddingHorizontal: 32,
    borderRadius: BorderRadius.md,
    alignSelf: 'stretch', alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.white,
  },
  secondaryBtn: { paddingVertical: Spacing.sm },
  secondaryBtnText: {
    fontSize: FontSize.sm, color: Colors.textMuted,
  },
});
