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
import { useRouter, useSegments } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { signInWithApple, signInWithGoogle } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  const handleAppleSignIn = async () => {
    try {
      setLoading('apple');
      await signInWithApple();
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('エラー', 'Apple サインインに失敗しました。再度お試しください。');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google');
      await signInWithGoogle();
    } catch (error: any) {
      if (error.message !== 'Google Sign In was cancelled') {
        Alert.alert('エラー', 'Google サインインに失敗しました。再度お試しください。');
      }
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

        <View style={styles.buttonGroup}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.authButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={loading !== null}
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
            disabled={loading !== null}
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

          <TouchableOpacity
            style={[styles.authButton, styles.phoneButton]}
            onPress={() => router.push('/_auth/phone')}
            disabled={loading !== null}
            activeOpacity={0.8}
          >
            <Ionicons name="phone-portrait" size={20} color={Colors.primary} />
            <Text style={[styles.authButtonText, styles.phoneButtonText]}>
              電話番号でサインイン
            </Text>
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
  phoneButton: {
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  phoneButtonText: {
    color: Colors.primary,
  },
  terms: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
