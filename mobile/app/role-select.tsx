import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { useAuth } from './_layout';

const ROLES = [
  {
    role: 'customer' as const,
    title: 'お客さまとして利用',
    subtitle: 'プロを呼んでカーディテイリングを依頼',
    icon: 'car-sport' as const,
    color: Colors.primaryLight,
  },
  {
    role: 'pro' as const,
    title: 'プロとして登録',
    subtitle: '技術者としてサービスを提供・収益を得る',
    icon: 'construct' as const,
    color: Colors.gold,
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { setRole } = useAuth();

  const handleSelectRole = async (role: 'customer' | 'pro') => {
    await setRole(role);
    if (role === 'customer') {
      router.replace('/customer');
    } else {
      router.replace('/pro');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ようこそ</Text>
          <Text style={styles.subtitle}>
            どちらの利用方法で{'\n'}始めますか？
          </Text>
        </View>

        <View style={styles.roleList}>
          {ROLES.map((item) => (
            <TouchableOpacity
              key={item.role}
              style={styles.roleCard}
              activeOpacity={0.7}
              onPress={() => handleSelectRole(item.role)}
            >
              <View style={[styles.roleIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={36} color={Colors.white} />
              </View>
              <Text style={styles.roleTitle}>{item.title}</Text>
              <Text style={styles.roleSubtitle}>{item.subtitle}</Text>
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>選択する</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Colors.primary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.xl,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 30,
  },
  roleList: {
    gap: Spacing.md,
  },
  roleCard: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  roleTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  selectButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
});
