import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { signInWithApple, signInWithGoogle, AuthError } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  const handleError = (error: unknown, provider: 'Apple' | 'Google') => {
    // User-cancelled flows: silently ignore.
    if (error && typeof error === 'object') {
      const e = error as { code?: string; message?: string };
      if (
        e.code === 'ERR_REQUEST_CANCELED' ||
        e.code === 'CANCELLED' ||
        e.message === 'Google Sign In was cancelled'
      ) {
        return;
      }
    }

    const message =
      error instanceof AuthError
        ? error.message
        : error instanceof Error
          ? error.message
          : `${provider} サインインに失敗しました。再度お試しください。`;

    if (__DEV__) {
      console.error(`[auth] ${provider} sign-in failed`, error);
    }
    Alert.alert(`${provider} サインインエラー`, message);
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading('apple');
      await signInWithApple();
    } catch (error) {
      handleError(error, 'Apple');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google');
      await signInWithGoogle();
    } catch (error) {
      handleError(error, 'Google');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="car-sport" size={48} color={Colors.white} />
          </View>
        </View>

        <Text style={styles.appName}>Mobile Wash</Text>
        <Text style={styles.tagline}>プレミアムカーディテイリング{'\n'}あなたの元へ</Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.signInHeader}>
          <View>
            <Text style={styles.signInTitle}>はじめる</Text>
            <Text style={styles.signInSubtitle}>
              アカウントでサインインしてください
            </Text>
          </View>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.back()}
          >
            <Text style={styles.skipButtonText}>あとで</Text>
          </TouchableOpacity>
        </View>

        {!isSupabaseConfigured && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={18} color="#8a6d00" />
            <Text style={styles.warningText}>
              Supabase 環境変数が未設定です。EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY を設定してください。
            </Text>
          </View>
        )}

        <View style={styles.buttonGroup}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.authButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={loading !== null || !isSupabaseConfigured}
              activeOpacity={0.8}
            >
              {loading === 'apple' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color={Colors.white} />
                  <Text style={[styles.authButtonText, styles.appleButtonText]}>
                    Appleでサインイン
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading !== null || !isSupabaseConfigured}
            activeOpacity={0.8}
          >
            {loading === 'google' ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={[styles.authButtonText, styles.googleButtonText]}>
                  Googleでサインイン
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          サインインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: Colors.primaryPale,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 26,
  },
  bottomSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  signInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  signInTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signInSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipButtonText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  buttonGroup: {
    gap: Spacing.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FFF8DC',
    borderColor: '#E0C97A',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#8a6d00',
    lineHeight: 18,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  authButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  appleButtonText: {
    color: Colors.white,
  },
  googleButtonText: {
    color: Colors.textPrimary,
  },
  terms: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
