import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase, isSupabaseConfigured } from './supabase';

function getDiagnostics() {
  const bundleId =
    Constants.expoConfig?.ios?.bundleIdentifier ??
    (Constants as unknown as { manifest2?: { extra?: { expoClient?: { ios?: { bundleIdentifier?: string } } } } })
      .manifest2?.extra?.expoClient?.ios?.bundleIdentifier ??
    'unknown';
  const supaUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supaHost = (() => {
    try {
      return supaUrl ? new URL(supaUrl).host : 'not-set';
    } catch {
      return 'invalid-url';
    }
  })();
  const isExpoGo = Constants.appOwnership === 'expo';
  return { bundleId, supaHost, isExpoGo };
}

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

  const diag = getDiagnostics();
  if (diag.isExpoGo) {
    throw new AuthError(
      [
        'Expo Go では Apple サインインを使えません。',
        'EAS development build または production build で実行してください。',
        '',
        '(Expo Go の bundle id は host.exp.Exponent のため、Supabase が拒否します)',
      ].join('\n'),
      'EXPO_GO_NOT_SUPPORTED',
    );
  }

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

  if (error) {
    if (__DEV__) {
      console.error('[auth] Apple signInWithIdToken error', {
        message: error.message,
        status: (error as { status?: number }).status,
        name: error.name,
        diag,
      });
    }
    throw new AuthError(translateAppleError(error.message, diag), 'SUPABASE_SIGNIN_FAILED');
  }
  return data;
}

function translateAppleError(
  message: string,
  diag: { bundleId: string; supaHost: string; isExpoGo: boolean },
): string {
  const m = message.toLowerCase();
  const tail = `\n\n[診断]\n  bundle id: ${diag.bundleId}\n  supabase: ${diag.supaHost}\n(原因: ${message})`;

  // Supabase が bundle ID を Apple provider の Authorized Client IDs に
  // 登録していないケース。最頻出。
  if (m.includes('audience') || m.includes('client_id') || m.includes('aud')) {
    return [
      'Apple identity token の audience が拒否されました。',
      '',
      `アプリの bundle id (${diag.bundleId}) を Supabase の`,
      `${diag.supaHost} プロジェクトの`,
      'Authentication > Providers > Apple > Authorized Client IDs',
      'に登録してください。',
      tail,
    ].join('\n');
  }
  if (m.includes('provider is not enabled') || m.includes('not enabled')) {
    return [
      `Supabase (${diag.supaHost}) 側で Apple プロバイダが有効化されていません。`,
      'Authentication > Providers > Apple を有効にしてください。',
      tail,
    ].join('\n');
  }
  if (m.includes('secret') || m.includes('jwt') || m.includes('signing')) {
    return [
      'Apple secret key が無効か期限切れです (6ヶ月で失効)。',
      'Apple Developer の .p8 から JWT を再生成し、Supabase Dashboard に登録してください。',
      tail,
    ].join('\n');
  }
  if (m.includes('nonce')) {
    return [
      'Apple nonce 検証に失敗しました。アプリを再起動して再度お試しください。',
      tail,
    ].join('\n');
  }
  return `Apple サインインで Supabase が認証を拒否しました。${tail}`;
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
