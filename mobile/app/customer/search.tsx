import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { useAuth } from '../_layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CATEGORY_CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / 3;

const CATEGORY_ICONS: Record<string, string> = {
  exterior: 'car-wash',
  interior: 'car-seat',
  coating: 'shield-check',
  polish: 'auto-fix',
  full_detail: 'star-circle',
  engine: 'engine',
};

const MOCK_RESULTS = [
  {
    id: '1',
    name: '田中 太郎',
    rating: 4.9,
    reviews: 127,
    distance: '0.8km',
    price: '¥3,000〜',
    categories: ['exterior', 'interior'],
    menus: [
      { name: '手洗い洗車', price: 3000 },
      { name: 'プレミアム洗車', price: 5000 },
      { name: '室内クリーニング', price: 4500 },
    ],
  },
  {
    id: '2',
    name: '佐藤 健一',
    rating: 4.8,
    reviews: 89,
    distance: '1.2km',
    price: '¥15,000〜',
    categories: ['coating', 'polish'],
    menus: [
      { name: 'ガラスコーティング', price: 15000 },
      { name: 'セラミックコート', price: 25000 },
      { name: '磨き・研磨', price: 10000 },
    ],
  },
  {
    id: '3',
    name: '鈴木 美咲',
    rating: 5.0,
    reviews: 64,
    distance: '2.1km',
    price: '¥25,000〜',
    categories: ['full_detail', 'coating', 'exterior'],
    menus: [
      { name: 'フルディテイルコース', price: 25000 },
      { name: 'プレミアムコート', price: 30000 },
    ],
  },
];

export default function SearchScreen() {
  const { requireAuth } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResults = MOCK_RESULTS.filter((pro) => {
    if (selectedCategory) {
      return pro.categories.includes(selectedCategory);
    }
    if (query) {
      return (
        pro.name.includes(query) ||
        pro.menus.some((m) => m.name.includes(query))
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="メニュー・プロ名で検索"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        {SERVICE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryCard,
              selectedCategory === cat.id && styles.categoryCardActive,
            ]}
            onPress={() =>
              setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
            }
          >
            <View
              style={[
                styles.categoryIconContainer,
                {
                  backgroundColor:
                    selectedCategory === cat.id
                      ? 'rgba(255,255,255,0.2)'
                      : cat.color + '20',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={CATEGORY_ICONS[cat.id] as any}
                size={24}
                color={selectedCategory === cat.id ? Colors.white : cat.color}
              />
            </View>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === cat.id && styles.categoryNameActive,
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredResults.length}件のプロが見つかりました
        </Text>
      </View>

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        renderItem={({ item: pro }) => (
          <TouchableOpacity style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultAvatar}>
                <Ionicons name="person" size={24} color={Colors.primaryMedium} />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{pro.name}</Text>
                <View style={styles.resultMeta}>
                  <Ionicons name="star" size={14} color={Colors.gold} />
                  <Text style={styles.resultRating}>
                    {pro.rating} ({pro.reviews}件)
                  </Text>
                  <Text style={styles.resultDivider}>|</Text>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.resultDistance}>{pro.distance}</Text>
                </View>
              </View>
              <Text style={styles.resultPrice}>{pro.price}</Text>
            </View>

            <View style={styles.menuList}>
              {pro.menus.map((menu, idx) => (
                <View key={idx} style={styles.menuItem}>
                  <Text style={styles.menuName}>{menu.name}</Text>
                  <Text style={styles.menuPrice}>¥{menu.price.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => requireAuth()}
            >
              <Ionicons name="car-sport" size={18} color={Colors.white} />
              <Text style={styles.callButtonText}>このプロを呼ぶ</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryCard: {
    width: CATEGORY_CARD_WIDTH,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: Colors.white,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  resultName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  resultRating: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  resultDivider: {
    color: Colors.textMuted,
  },
  resultDistance: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  resultPrice: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  menuList: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  menuPrice: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  callButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
