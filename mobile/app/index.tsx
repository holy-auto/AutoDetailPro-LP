import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuth } from './_layout';

export default function Index() {
  const router = useRouter();
  const { session, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      // Guest mode — go straight to customer home
      router.replace('/customer');
    } else if (!role) {
      router.replace('/role-select');
    } else if (role === 'customer') {
      router.replace('/customer');
    } else if (role === 'pro') {
      router.replace('/pro');
    } else if (role === 'admin') {
      router.replace('/admin');
    }
  }, [session, role, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
