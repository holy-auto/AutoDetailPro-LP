import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Get the currently authenticated user's ID.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Verify the current user has admin role.
 * Returns the admin's user ID if verified, null otherwise.
 */
export async function verifyAdmin(): Promise<string | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'admin' ? userId : null;
}

/** Supabase が未設定（デモモード）かどうか */
export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: Platform.OS !== 'web' ? ExpoSecureStoreAdapter : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : (new Proxy({} as any, {
      get: (_target, prop) => {
        // Return no-op stubs so the app doesn't crash in demo mode
        if (prop === 'auth') {
          const demoError = { message: 'Supabase が未設定です (デモモード)' };
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({
              data: { subscription: { unsubscribe: () => {} } },
            }),
            signInWithIdToken: async () => ({ data: null, error: demoError }),
            signInWithOAuth: async () => ({ data: null, error: demoError }),
            exchangeCodeForSession: async () => ({ data: null, error: demoError }),
            setSession: async () => ({ data: null, error: demoError }),
            signOut: async () => ({ error: null }),
          };
        }
        if (prop === 'from') {
          return () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: [], error: null }), in: () => ({ data: [], error: null }), data: [], error: null }),
            update: () => ({ eq: async () => ({ error: null }) }),
            upsert: async () => ({ error: null }),
            insert: async () => ({ error: null }),
          });
        }
        if (prop === 'functions') {
          return { invoke: async () => ({ data: null, error: null }) };
        }
        if (prop === 'channel') {
          return () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) });
        }
        if (prop === 'removeChannel') {
          return () => {};
        }
        return () => {};
      },
    }) as unknown as SupabaseClient);
