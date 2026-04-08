import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { useAuth } from '../_layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock nearby pros
const MOCK_PROS = [
  {
    id: '1',
    name: '田中 太郎',
    rating: 4.9,
    reviews: 127,
    distance: '0.8km',
    eta: '5分',
    speciality: '外装洗車',
    avatar: null,
    online: true,
  },
  {
    id: '2',
    name: '佐藤 健一',
    rating: 4.8,
    reviews: 89,
    distance: '1.2km',
    eta: '8分',
    speciality: 'コーティング',
    avatar: null,
    online: true,
  },
  {
    id: '3',
    name: '鈴木 美咲',
    rating: 5.0,
    reviews: 64,
    distance: '2.1km',
    eta: '12分',
    speciality: 'フルディテイル',
    avatar: null,
    online: true,
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  exterior: 'car-wash',
  interior: 'car-seat',
  coating: 'shield-check',
  polish: 'auto-fix',
  full_detail: 'star-circle',
  engine: 'engine',
};

export default function CustomerHome() {
  const router = useRouter();
  const { user, isGuest, requireAuth } = useAuth();
  const userName = isGuest
    ? 'ゲスト'
    : user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'ユーザー';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCallPro = () => {
    if (!requireAuth()) return;
    // TODO: Navigate to booking flow
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>こんにちは</Text>
            <Text style={styles.userName}>{userName} さん</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.textPrimary}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={48} color={Colors.primarySoft} />
            <Text style={styles.mapText}>周辺のプロを表示中...</Text>
            <Text style={styles.mapSubtext}>
              3名のプロがオンライン
            </Text>
          </View>

          {/* Current Location Pin */}
          <View style={styles.locationPin}>
            <Ionicons name="navigate" size={20} color={Colors.primary} />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サービスを選ぶ</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {SERVICE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )
                }
              >
                <MaterialCommunityIcons
                  name={CATEGORY_ICONS[cat.id] as any}
                  size={18}
                  color={
                    selectedCategory === cat.id
                      ? Colors.white
                      : Colors.primary
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Nearby Pros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>近くのプロ</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>すべて見る</Text>
            </TouchableOpacity>
          </View>

          {MOCK_PROS.map((pro) => (
            <TouchableOpacity key={pro.id} style={styles.proCard}>
              <View style={styles.proAvatar}>
                <Ionicons name="person" size={24} color={Colors.primaryMedium} />
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.proInfo}>
                <Text style={styles.proName}>{pro.name}</Text>
                <Text style={styles.proSpeciality}>{pro.speciality}</Text>
                <View style={styles.proMeta}>
                  <Ionicons name="star" size={14} color={Colors.gold} />
                  <Text style={styles.proRating}>
                    {pro.rating} ({pro.reviews})
                  </Text>
                  <Text style={styles.proDivider}>|</Text>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.proDistance}>{pro.distance}</Text>
                </View>
              </View>
              <View style={styles.proEta}>
                <Text style={styles.proEtaTime}>{pro.eta}</Text>
                <Text style={styles.proEtaLabel}>到着</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAB - Call Pro Button (Go style) */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={handleCallPro}>
        <Ionicons name="car-sport" size={24} color={Colors.white} />
        <Text style={styles.fabText}>プロを呼ぶ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },

  // Map
  mapContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryPale,
  },
  mapText: {
    fontSize: FontSize.md,
    color: Colors.primaryMedium,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  mapSubtext: {
    fontSize: FontSize.sm,
    color: Colors.primarySoft,
    marginTop: Spacing.xs,
  },
  locationPin: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Sections
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  // Categories
  categoryScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFaint,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },

  // Pro Cards
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  proAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  proInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  proName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  proSpeciality: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  proMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  proRating: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  proDivider: {
    color: Colors.textMuted,
    marginHorizontal: 2,
  },
  proDistance: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  proEta: {
    alignItems: 'center',
    backgroundColor: Colors.primaryFaint,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  proEtaTime: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.primary,
  },
  proEtaLabel: {
    fontSize: FontSize.xs,
    color: Colors.primaryMedium,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
