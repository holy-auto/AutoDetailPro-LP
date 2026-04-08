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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { SUBSCRIPTION, SERVICE_CATEGORIES } from '@/constants/business-rules';

const MOCK_MENUS = [
  { id: '1', name: '手洗い洗車', price: 3000, categoryId: 'exterior' },
  { id: '2', name: 'プレミアム洗車', price: 5000, categoryId: 'exterior' },
  { id: '3', name: 'ガラスコーティング', price: 15000, categoryId: 'coating' },
  { id: '4', name: '室内クリーニング', price: 4500, categoryId: 'interior' },
];

const CATEGORY_ICONS: Record<string, string> = {
  exterior: 'car-wash',
  interior: 'car-seat',
  coating: 'shield-check',
  polish: 'auto-fix',
  full_detail: 'star-circle',
  engine: 'engine',
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  const plan = SUBSCRIPTION.PLANS.find((p) => p.id === selectedPlan);
  const menu = MOCK_MENUS.find((m) => m.id === selectedMenu);
  const discountedPrice = menu && plan
    ? Math.round(menu.price * (1 - plan.discount / 100))
    : null;

  const handleSubscribe = () => {
    if (!plan || !menu) return;
    Alert.alert(
      '定期コースに申し込む',
      `${plan.name}（${menu.name}）\n${plan.intervalDays}日ごとに自動予約\n料金: ¥${discountedPrice!.toLocaleString()}/回`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '申し込む',
          onPress: () => {
            Alert.alert('申し込み完了', '定期コースが開始されました！', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>定期コース</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Ionicons name="repeat" size={36} color={Colors.success} />
          <Text style={styles.heroTitle}>お得な定期プラン</Text>
          <Text style={styles.heroSub}>
            定期的にプロの洗車を受けて{'\n'}常にキレイな車をキープ
          </Text>
          <View style={styles.autoMatchBadge}>
            <Ionicons name="flash-outline" size={14} color={Colors.primaryMedium} />
            <Text style={styles.autoMatchText}>
              毎回、距離・空き・評価から最適なプロを自動マッチング
            </Text>
          </View>
        </View>

        {/* Plan Selection */}
        <Text style={styles.sectionLabel}>プランを選択</Text>
        <View style={styles.planList}>
          {SUBSCRIPTION.PLANS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.planCard, selectedPlan === p.id && styles.planCardSelected]}
              onPress={() => setSelectedPlan(p.id)}
            >
              <View style={styles.planHeader}>
                <Text style={[
                  styles.planName,
                  selectedPlan === p.id && styles.planNameSelected,
                ]}>
                  {p.name}
                </Text>
                <View style={[
                  styles.planBadge,
                  selectedPlan === p.id && styles.planBadgeSelected,
                ]}>
                  <Text style={[
                    styles.planBadgeText,
                    selectedPlan === p.id && styles.planBadgeTextSelected,
                  ]}>
                    {p.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.planInterval}>
                {p.intervalDays}日ごとに自動予約
              </Text>
              <View style={styles.planRadio}>
                <View style={[
                  styles.radioOuter,
                  selectedPlan === p.id && styles.radioOuterSelected,
                ]}>
                  {selectedPlan === p.id && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu Selection */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>メニューを選択</Text>
        {MOCK_MENUS.map((m) => {
          const isSelected = selectedMenu === m.id;
          const discount = plan ? plan.discount : 0;
          const newPrice = Math.round(m.price * (1 - discount / 100));
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.menuCard, isSelected && styles.menuCardSelected]}
              onPress={() => setSelectedMenu(m.id)}
            >
              <MaterialCommunityIcons
                name={CATEGORY_ICONS[m.categoryId] as any}
                size={22}
                color={isSelected ? Colors.primary : Colors.textMuted}
              />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.menuName}>{m.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  {discount > 0 && (
                    <Text style={styles.menuOrigPrice}>¥{m.price.toLocaleString()}</Text>
                  )}
                  <Text style={[styles.menuPrice, isSelected && { color: Colors.primary }]}>
                    ¥{newPrice.toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primaryMedium} />
          <Text style={styles.infoText}>
            キャンセルは次回予約日の{SUBSCRIPTION.CANCEL_BEFORE_HOURS}時間前まで可能です。
            いつでもプランを変更・停止できます。
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {discountedPrice && plan && menu && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{plan.name} / {menu.name}</Text>
            <Text style={styles.summaryValue}>¥{discountedPrice.toLocaleString()}/回</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.subButton, (!selectedPlan || !selectedMenu) && styles.subButtonDisabled]}
          onPress={handleSubscribe}
          disabled={!selectedPlan || !selectedMenu}
        >
          <Ionicons name="repeat" size={20} color={Colors.white} />
          <Text style={styles.subButtonText}>定期コースに申し込む</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: 180 },

  // Hero
  hero: { alignItems: 'center', marginBottom: Spacing.xl },
  heroTitle: {
    fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.sm,
  },
  heroSub: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20,
  },
  autoMatchBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryFaint,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md, gap: 6,
  },
  autoMatchText: {
    fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '600',
  },

  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  // Plans
  planList: { gap: Spacing.sm, marginBottom: Spacing.sm },
  planCard: {
    backgroundColor: Colors.card,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center',
  },
  planCardSelected: {
    borderColor: Colors.success, backgroundColor: '#F0FDF4',
  },
  planHeader: { flex: 1 },
  planName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  planNameSelected: { color: Colors.success },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, marginTop: 4,
  },
  planBadgeSelected: { backgroundColor: Colors.success },
  planBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.success },
  planBadgeTextSelected: { color: Colors.white },
  planInterval: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    marginRight: Spacing.md,
  },
  planRadio: { marginLeft: 'auto' },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterSelected: { borderColor: Colors.success },
  radioInner: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success,
  },

  // Menu
  menuCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, padding: Spacing.md,
    borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
    borderWidth: 2, borderColor: 'transparent',
  },
  menuCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaint },
  menuName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  menuOrigPrice: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  menuPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  // Info
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.primaryFaint,
    padding: Spacing.md, borderRadius: BorderRadius.md,
    marginTop: Spacing.lg, gap: Spacing.sm,
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.primaryLight, lineHeight: 20 },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.lg, paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  subButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 16, borderRadius: BorderRadius.md, gap: Spacing.sm,
  },
  subButtonDisabled: { opacity: 0.4 },
  subButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
