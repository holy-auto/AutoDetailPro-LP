import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SERVICE_CATEGORIES } from '@/constants/categories';

const CATEGORY_ICONS: Record<string, string> = {
  exterior: 'car-wash',
  interior: 'car-seat',
  coating: 'shield-check',
  polish: 'auto-fix',
  full_detail: 'star-circle',
  engine: 'engine',
};

const CATEGORY_STATS: Record<string, { pros: number; orders: number; revenue: number }> = {
  exterior: { pros: 28, orders: 89, revenue: 267000 },
  interior: { pros: 22, orders: 45, revenue: 202500 },
  coating: { pros: 15, orders: 28, revenue: 420000 },
  polish: { pros: 12, orders: 18, revenue: 180000 },
  full_detail: { pros: 8, orders: 12, revenue: 300000 },
  engine: { pros: 6, orders: 8, revenue: 64000 },
};

export default function AdminCategoriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>カテゴリ管理</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>追加</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          運営が定義するサービスカテゴリ — プロはこれに沿ってメニュー作成
        </Text>

        {SERVICE_CATEGORIES.map((cat) => {
          const stats = CATEGORY_STATS[cat.id];
          return (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: cat.color + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={CATEGORY_ICONS[cat.id] as any}
                    size={28}
                    color={cat.color}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryDesc}>{cat.description}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textMuted}
                />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{stats.pros}</Text>
                  <Text style={styles.statLabel}>登録プロ</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{stats.orders}</Text>
                  <Text style={styles.statLabel}>今月注文</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    ¥{(stats.revenue / 10000).toFixed(0)}万
                  </Text>
                  <Text style={styles.statLabel}>売上</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  categoryName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
});
