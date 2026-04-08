import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { useAuth } from '../_layout';
import { signOut } from '@/lib/auth';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'プロフィール編集', route: null },
  { icon: 'card-outline', label: '決済方法', route: null },
  { icon: 'location-outline', label: '保存済み住所', route: null },
  { icon: 'notifications-outline', label: '通知設定', route: null },
  { icon: 'help-circle-outline', label: 'ヘルプ・お問い合わせ', route: null },
  { icon: 'document-text-outline', label: '利用規約', route: null },
  { icon: 'shield-outline', label: 'プライバシーポリシー', route: null },
] as const;

export default function ProfileScreen() {
  const { user, isGuest, requireAuth } = useAuth();
  const router = useRouter();
  const userName = isGuest
    ? 'ゲスト'
    : user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'ユーザー';
  const email = isGuest ? '未ログイン' : (user?.email ?? '');

  const handleSignOut = () => {
    if (isGuest) {
      requireAuth();
      return;
    }
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>マイページ</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.primaryMedium} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>利用回数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>平均評価</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>¥43k</Text>
            <Text style={styles.statLabel}>累計利用額</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem}>
              <Ionicons
                name={item.icon as any}
                size={22}
                color={Colors.textSecondary}
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Login / Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons
            name={isGuest ? 'log-in-outline' : 'log-out-outline'}
            size={22}
            color={isGuest ? Colors.primary : Colors.error}
          />
          <Text style={[styles.logoutText, isGuest && { color: Colors.primary }]}>
            {isGuest ? 'ログイン / 会員登録' : 'ログアウト'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>Auto Detail Pro v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
