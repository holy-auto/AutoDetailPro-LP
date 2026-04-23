import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { sendPhoneOtp, verifyPhoneOtp } from '@/lib/auth';

type Step = 'phone' | 'code';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendingIn, setResendingIn] = useState(0);

  const handleSendCode = async () => {
    if (loading) return;
    setLoading(true);
    const res = await sendPhoneOtp(phone);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('エラー', res.error ?? 'SMS の送信に失敗しました');
      return;
    }
    setStep('code');
    // Start a 60s resend cooldown
    let remaining = 60;
    setResendingIn(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      setResendingIn(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
  };

  const handleVerify = async () => {
    if (loading) return;
    if (code.length !== 6) {
      Alert.alert('エラー', '6桁のコードを入力してください');
      return;
    }
    setLoading(true);
    const res = await verifyPhoneOtp(phone, code);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('エラー', res.error ?? 'コードが正しくありません');
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (step === 'code' ? setStep('phone') : router.back())}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>電話番号でサインイン</Text>
          <View style={{ width: 24 }} />
        </View>

        {step === 'phone' ? (
          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>電話番号を入力</Text>
            <Text style={styles.subtitle}>SMS で6桁の認証コードをお送りします</Text>

            <View style={styles.inputRow}>
              <Text style={styles.countryCode}>+81</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="09012345678"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                maxLength={13}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, (!phone || loading) && styles.primaryBtnDisabled]}
              onPress={handleSendCode}
              disabled={!phone || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>コードを送信</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              SMS の送受信にキャリア通信料がかかる場合があります
            </Text>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubble-ellipses" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>認証コードを入力</Text>
            <Text style={styles.subtitle}>{phone} に SMS を送信しました</Text>

            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textAlign="center"
            />

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (code.length !== 6 || loading) && styles.primaryBtnDisabled,
              ]}
              onPress={handleVerify}
              disabled={code.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>サインイン</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleSendCode}
              disabled={resendingIn > 0 || loading}
            >
              <Text style={[styles.resendText, resendingIn > 0 && { color: Colors.textMuted }]}>
                {resendingIn > 0
                  ? `コードを再送信 (${resendingIn}秒後)`
                  : 'コードを再送信'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  body: {
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl,
    alignItems: 'center', gap: Spacing.md,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: {
    fontSize: FontSize.md, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  countryCode: {
    fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1, paddingVertical: 14, fontSize: FontSize.lg, color: Colors.textPrimary,
  },
  codeInput: {
    width: '100%', borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md, fontSize: 28, letterSpacing: 8,
  },
  primaryBtn: {
    width: '100%', backgroundColor: Colors.primary,
    paddingVertical: 16, borderRadius: BorderRadius.md,
    alignItems: 'center', marginTop: Spacing.md,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  resendBtn: { paddingVertical: Spacing.md, marginTop: Spacing.sm },
  resendText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  disclaimer: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.md,
  },
});
