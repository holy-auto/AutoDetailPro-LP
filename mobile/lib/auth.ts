import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// Apple Sign In
export async function signInWithApple() {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign In failed: no identity token');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) throw error;
  return data;
}

// Google Sign In
export async function signInWithGoogle() {
  const redirectUrl = AuthSession.makeRedirectUri({
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned');

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUrl
  );

  if (result.type === 'success') {
    const url = new URL(result.url);
    const params = new URLSearchParams(
      url.hash ? url.hash.substring(1) : url.search.substring(1)
    );

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

      if (sessionError) throw sessionError;
      return sessionData;
    }
  }

  throw new Error('Google Sign In was cancelled');
}

// Sign out
// =============================================
// Phone / SMS OTP authentication
// =============================================
// Uses Supabase Auth phone provider. Configure in Supabase Studio →
// Authentication → Providers → Phone (Twilio/MessageBird/Vonage).
//
// Japanese numbers must be sent in E.164: 09012345678 → +819012345678

/** Convert local-formatted JP phone to E.164. Returns null if invalid. */
export function normalizeJpPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  // Already +81…
  if (raw.trim().startsWith('+')) return raw.trim();
  // Local 0-prefixed (most common): 09012345678 → +819012345678
  if (digits.startsWith('0') && digits.length >= 10) {
    return `+81${digits.slice(1)}`;
  }
  // Bare with no leading 0
  if (digits.length >= 9 && digits.length <= 11) {
    return `+81${digits}`;
  }
  return null;
}

/** Send a 6-digit OTP code to the given JP phone via Supabase Auth. */
export async function sendPhoneOtp(rawPhone: string): Promise<{ ok: boolean; error?: string }> {
  const phone = normalizeJpPhone(rawPhone);
  if (!phone) return { ok: false, error: '電話番号の形式が正しくありません' };

  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Verify the 6-digit code returned by Supabase Auth and create/sign-in session. */
export async function verifyPhoneOtp(
  rawPhone: string,
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const phone = normalizeJpPhone(rawPhone);
  if (!phone) return { ok: false, error: '電話番号の形式が正しくありません' };

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: token.trim(),
    type: 'sms',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user role
export async function getUserRole(): Promise<'customer' | 'pro' | 'admin' | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role ?? 'customer';
}
