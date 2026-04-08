import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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
      },
    })
  : (new Proxy({} as any, {
      get: (_target, prop) => {
        // Return no-op stubs so the app doesn't crash in demo mode
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({
              data: { subscription: { unsubscribe: () => {} } },
            }),
            signInWithIdToken: async () => ({ data: null, error: { message: 'Demo mode' } }),
            signOut: async () => {},
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
