import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback, useMemo, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import SplashScreen from './splash';

type UserRole = 'customer' | 'pro' | 'admin' | null;

type AuthContextType = {
  session: Session | null;
  user: User | null;
  role: UserRole;
  isGuest: boolean;
  setRole: (role: UserRole) => void;
  loading: boolean;
  requireAuth: () => boolean;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  isGuest: true,
  setRole: () => {},
  loading: true,
  requireAuth: () => false,
});

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode: skip auth, go straight to guest customer
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    setRole(data?.role ?? null);
    setLoading(false);
  }

  // Route after login based on role
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '_auth';

    if (session && inAuthGroup) {
      if (!role) {
        router.replace('/role-select');
      } else if (role === 'customer') {
        router.replace('/customer');
      } else if (role === 'pro') {
        router.replace('/pro');
      } else if (role === 'admin') {
        router.replace('/admin');
      }
    }

    // Pro/Admin require login
    if (!session) {
      if (segments[0] === 'pro' || segments[0] === 'admin') {
        router.replace('/_auth/login');
      }
    }
  }, [session, role, segments, loading]);

  const handleSetRole = async (newRole: UserRole) => {
    if (!session?.user || !newRole) return;

    await supabase.from('profiles').upsert({
      id: session.user.id,
      role: newRole,
      full_name:
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        '',
      email: session.user.email,
      updated_at: new Date().toISOString(),
    });

    setRole(newRole);
  };

  // Returns true if user IS authenticated, false if redirected to login
  const requireAuth = useCallback((): boolean => {
    if (session) return true;
    router.push('/_auth/login');
    return false;
  }, [session, router]);

  // Memoize auth context value to prevent unnecessary consumer re-renders
  const authValue = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      isGuest: !session,
      setRole: handleSetRole,
      loading,
      requireAuth,
    }),
    [session, role, loading, requireAuth],
  );

  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAFCFB' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="_auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="role-select" />
        <Stack.Screen name="index" />
        <Stack.Screen name="customer" />
        <Stack.Screen name="pro" />
        <Stack.Screen name="admin" />
      </Stack>
    </AuthContext.Provider>
  );
}
