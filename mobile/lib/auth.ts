import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { supabase, isSupabaseConfigured } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new AuthError(
      'Supabase が未設定のためログインできません。EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY を設定してください。',
      'NOT_CONFIGURED',
    );
  }
}

// Apple Sign In
export async function signInWithApple() {
  ensureConfigured();

  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new AuthError('Apple から identity token を取得できませんでした', 'NO_IDENTITY_TOKEN');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) throw new AuthError(error.message, 'SUPABASE_SIGNIN_FAILED');
  return data;
}

// Google Sign In (PKCE flow)
export async function signInWithGoogle() {
  ensureConfigured();

  const redirectUrl = AuthSession.makeRedirectUri({
    scheme: 'mobilewash',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw new AuthError(error.message, 'OAUTH_INIT_FAILED');
  if (!data?.url) throw new AuthError('OAuth URL を取得できませんでした', 'NO_OAUTH_URL');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new AuthError('Google Sign In was cancelled', 'CANCELLED');
  }
  if (result.type !== 'success' || !result.url) {
    throw new AuthError('Google サインインに失敗しました', 'OAUTH_RESULT_FAILED');
  }

  // Parse redirect URL — Supabase PKCE returns ?code=... ; legacy implicit returns #access_token=...
  const url = new URL(result.url);
  const params = new URLSearchParams(url.search);
  const hashParams = new URLSearchParams(
    url.hash?.startsWith('#') ? url.hash.substring(1) : url.hash ?? '',
  );

  const code = params.get('code') ?? hashParams.get('code');
  if (code) {
    const { data: exchanged, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw new AuthError(exchangeError.message, 'EXCHANGE_FAILED');
    return exchanged;
  }

  const accessToken =
    params.get('access_token') ?? hashParams.get('access_token');
  const refreshToken =
    params.get('refresh_token') ?? hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw new AuthError(sessionError.message, 'SET_SESSION_FAILED');
    return sessionData;
  }

  const oauthError =
    params.get('error_description') ??
    params.get('error') ??
    hashParams.get('error_description') ??
    hashParams.get('error');
  throw new AuthError(
    oauthError ?? 'リダイレクトURL からトークンを取得できませんでした',
    'NO_TOKEN_IN_REDIRECT',
  );
}

// Sign out
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
