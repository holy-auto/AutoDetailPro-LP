import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { MATCHING } from '@/constants/business-rules';
import { useAuth } from '../_layout';
import {
  getCurrentLocation,
  DEFAULT_LOCATION,
  type Coords,
} from '@/lib/location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 280;

// Mock nearby pros with coordinates
const MOCK_PROS = [
  {
    id: '1',
    name: '田中 太郎',
    rating: 4.9,
    reviews: 127,
    distance: '0.8km',
    eta: '5分',
    speciality: '外装洗車',
    latitude: 35.6842,
    longitude: 139.7645,
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
    latitude: 35.6795,
    longitude: 139.7710,
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
    latitude: 35.6762,
    longitude: 139.7580,
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
  const mapRef = useRef<MapView>(null);
  const userName = isGuest
    ? 'ゲスト'
    : user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split('@')[0] ||
      'ユーザー';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coords>(DEFAULT_LOCATION);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const coords = await getCurrentLocation();
      setUserLocation(coords);
      setLoadingLocation(false);
    })();
  }, []);

  const handleCallPro = () => {
    if (!requireAuth()) return;
    router.push('/customer/booking/select-menu');
  };

  const handleRecenter = () => {
    mapRef.current?.animateToRegion(
      {
        ...userLocation,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      500
    );
  };

  const handleProMarkerPress = (proId: string) => {
    setSelectedProId(selectedProId === proId ? null : proId);
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

        {/* Map */}
        <View style={styles.mapContainer}>
          {loadingLocation ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.mapLoadingText}>位置情報を取得中...</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                ...userLocation,
                latitudeDelta: 0.025,
                longitudeDelta: 0.025,
              }}
              showsUserLocation
              showsMyLocationButton={false}
              mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              {/* 15km matching radius circle */}
              <Circle
                center={userLocation}
                radius={MATCHING.BASE_RADIUS_KM * 1000}
                strokeColor={Colors.primarySoft + '40'}
                fillColor={Colors.primaryFaint + '20'}
                strokeWidth={1}
              />

              {/* Pro markers */}
              {MOCK_PROS.map((pro) => (
                <Marker
                  key={pro.id}
                  coordinate={{
                    latitude: pro.latitude,
                    longitude: pro.longitude,
                  }}
                  onPress={() => handleProMarkerPress(pro.id)}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View
                    style={[
                      styles.proMarker,
                      selectedProId === pro.id && styles.proMarkerSelected,
                    ]}
                  >
                    <Ionicons
                      name="construct"
                      size={16}
                      color={
                        selectedProId === pro.id
                          ? Colors.white
                          : Colors.primary
                      }
                    />
                  </View>
                </Marker>
              ))}
            </MapView>
          )}

          {/* Recenter button */}
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={handleRecenter}
          >
            <Ionicons name="navigate" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* Online count badge */}
          <View style={styles.onlineCountBadge}>
            <View style={styles.onlinePulse} />
            <Text style={styles.onlineCountText}>
              {MOCK_PROS.length}名のプロがオンライン
            </Text>
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
                    selectedCategory === cat.id ? Colors.white : Colors.primary
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
            <TouchableOpacity
              key={pro.id}
              style={[
                styles.proCard,
                selectedProId === pro.id && styles.proCardSelected,
              ]}
              onPress={() => {
                setSelectedProId(pro.id);
                mapRef.current?.animateToRegion(
                  {
                    latitude: pro.latitude,
                    longitude: pro.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  500
                );
              }}
            >
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
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleCallPro}
      >
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
    height: MAP_HEIGHT,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLoading: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  mapLoadingText: {
    fontSize: FontSize.sm,
    color: Colors.primaryMedium,
    marginTop: Spacing.sm,
  },
  recenterButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  onlineCountBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 6,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineCountText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Pro Markers
  proMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  proMarkerSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    transform: [{ scale: 1.2 }],
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
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  proCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
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
