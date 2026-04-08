import { useState } from 'react';
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
import { LOYALTY } from '@/constants/business-rules';

// Mock loyalty data
const MOCK_LOYALTY = {
  totalPoints: 4850,
  lifetimePoints: 12300,
  tier: 'silver' as const,
  couponsCount: 2,
};

const MOCK_COUPONS = [
  { id: '1', code: 'WELCOME20', label: '初回20%OFF', type: 'percent', value: 20, expiresAt: '2026-05-31' },
  { id: '2', code: 'SPRING500', label: '春の500円引き', type: 'fixed', value: 500, expiresAt: '2026-04-30' },
];

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'プロフィール編集', route: null },
  { icon: 'card-outline', label: '決済方法', route: null },
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

  const currentTier = LOYALTY.TIERS.find((t) => t.id === MOCK_LOYALTY.tier) ?? LOYALTY.TIERS[0];
  const nextTier = LOYALTY.TIERS.find((t) => t.minPoints > MOCK_LOYALTY.lifetimePoints);

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

        {/* Loyalty & Points Card */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <View style={styles.loyaltyTierBadge}>
              <View style={[styles.tierDot, { backgroundColor: currentTier.color }]} />
              <Text style={styles.tierName}>{currentTier.name}</Text>
              {currentTier.discount > 0 && (
                <Text style={styles.tierDiscount}>{currentTier.discount}%OFF</Text>
              )}
            </View>
            {nextTier && (
              <Text style={styles.nextTierHint}>
                あと{(nextTier.minPoints - MOCK_LOYALTY.lifetimePoints).toLocaleString()}ptで{nextTier.name}
              </Text>
            )}
          </View>
          <View style={styles.pointsRow}>
            <View style={styles.pointsMain}>
              <Text style={styles.pointsValue}>{MOCK_LOYALTY.totalPoints.toLocaleString()}</Text>
              <Text style={styles.pointsUnit}>pt</Text>
            </View>
            <TouchableOpacity style={styles.pointsUseButton}>
              <Text style={styles.pointsUseText}>ポイントを使う</Text>
            </TouchableOpacity>
          </View>
          {nextTier && (
            <View style={styles.tierProgress}>
              <View style={styles.tierProgressBar}>
                <View
                  style={[
                    styles.tierProgressFill,
                    {
                      width: `${Math.min(100, (MOCK_LOYALTY.lifetimePoints / nextTier.minPoints) * 100)}%`,
                      backgroundColor: currentTier.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.tierProgressText}>
                {MOCK_LOYALTY.lifetimePoints.toLocaleString()} / {nextTier.minPoints.toLocaleString()} pt
              </Text>
            </View>
          )}
        </View>

        {/* Coupons Section */}
        <View style={styles.couponsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="ticket-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>クーポン</Text>
              <View style={styles.couponCountBadge}>
                <Text style={styles.couponCountText}>{MOCK_COUPONS.length}</Text>
              </View>
            </View>
          </View>
          {MOCK_COUPONS.map((coupon) => (
            <View key={coupon.id} style={styles.couponItem}>
              <View style={styles.couponLeft}>
                <Text style={styles.couponLabel}>{coupon.label}</Text>
                <Text style={styles.couponExpiry}>有効期限: {coupon.expiresAt}</Text>
              </View>
              <View style={styles.couponCode}>
                <Text style={styles.couponCodeText}>{coupon.code}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/customer/gift' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="gift-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionLabel}>ギフトを贈る</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/customer/subscription' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="repeat-outline" size={24} color="#22C55E" />
            </View>
            <Text style={styles.quickActionLabel}>定期コース</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/customer/booking/schedule' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="calendar-outline" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionLabel}>日時予約</Text>
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

        <Text style={styles.version}>Mobile Wash v1.0.0</Text>
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

  // Loyalty Card
  loyaltyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  loyaltyTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tierDiscount: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.success,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  nextTierHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  pointsUnit: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primaryMedium,
  },
  pointsUseButton: {
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
  },
  pointsUseText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  tierProgress: {
    marginTop: Spacing.md,
  },
  tierProgressBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tierProgressText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },

  // Coupons
  couponsSection: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  couponCountBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  couponCountText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  couponItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  couponLeft: {
    flex: 1,
  },
  couponLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  couponExpiry: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  couponCode: {
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  couponCodeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'monospace',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Stats
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
