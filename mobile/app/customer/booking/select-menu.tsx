import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';

const CATEGORY_ICONS: Record<string, string> = {
  exterior: 'car-wash',
  interior: 'car-seat',
  coating: 'shield-check',
  polish: 'auto-fix',
  full_detail: 'star-circle',
  engine: 'engine',
};

// Mock: pro's available menus
const MOCK_PRO_MENUS = [
  { id: '1', name: '手洗い洗車', price: 3000, duration: '30分', categoryId: 'exterior' },
  { id: '2', name: 'プレミアム洗車', price: 5000, duration: '45分', categoryId: 'exterior' },
  { id: '3', name: 'ガラスコーティング', price: 15000, duration: '120分', categoryId: 'coating' },
  { id: '4', name: '室内クリーニング', price: 4500, duration: '40分', categoryId: 'interior' },
];

export default function SelectMenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ proId: string; proName: string }>();
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  const toggleMenu = (id: string) => {
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectedItems = MOCK_PRO_MENUS.filter((m) => selectedMenus.includes(m.id));
  const totalPrice = selectedItems.reduce((sum, m) => sum + m.price, 0);
  const totalDuration = selectedItems.reduce(
    (sum, m) => sum + parseInt(m.duration, 10),
    0
  );

  const handleNext = () => {
    router.push({
      pathname: '/customer/booking/payment',
      params: {
        proId: params.proId ?? '1',
        proName: params.proName ?? '田中 太郎',
        menuIds: selectedMenus.join(','),
        totalPrice: totalPrice.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>メニューを選択</Text>
          <Text style={styles.headerSub}>{params.proName ?? '田中 太郎'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {MOCK_PRO_MENUS.map((menu) => {
          const selected = selectedMenus.includes(menu.id);
          return (
            <TouchableOpacity
              key={menu.id}
              style={[styles.menuCard, selected && styles.menuCardSelected]}
              onPress={() => toggleMenu(menu.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons
                  name={CATEGORY_ICONS[menu.categoryId] as any}
                  size={22}
                  color={selected ? Colors.primary : Colors.textMuted}
                />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{menu.name}</Text>
                <Text style={styles.menuDuration}>{menu.duration}</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={[styles.menuPrice, selected && styles.menuPriceSelected]}>
                  ¥{menu.price.toLocaleString()}
                </Text>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && (
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Summary */}
      {selectedMenus.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryItems}>
              {selectedItems.length}件選択 / 約{totalDuration}分
            </Text>
            <Text style={styles.summaryTotal}>
              ¥{totalPrice.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>決済へ進む</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  content: { padding: Spacing.lg, paddingBottom: 140 },
  menuCard: {
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
  menuCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  menuLeft: { marginRight: Spacing.md },
  menuInfo: { flex: 1 },
  menuName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  menuDuration: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  menuRight: { alignItems: 'flex-end', gap: Spacing.sm },
  menuPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  menuPriceSelected: { color: Colors.primary },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  summaryInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryItems: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryTotal: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  nextButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary, paddingVertical: 16,
    borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  nextButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
