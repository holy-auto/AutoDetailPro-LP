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
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { PRO_BOOST } from '@/constants/business-rules';
import { useAuth } from '../_layout';

export default function BoostScreen() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<{
    id: string;
    expiresAt: string;
  } | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPlan || !user?.id) return;

    const plan = PRO_BOOST.PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    Alert.alert(
      'ブースト購入確認',
      `${plan.name}（¥${plan.price.toLocaleString()}）を購入しますか？\n\nお客さまへの表示が${plan.duration_days}日間優先されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '購入する',
          onPress: async () => {
            setPurchasing(true);
            try {
              // TODO: Call Supabase Edge Function to create Stripe PaymentIntent
              // and activate boost on pro_profiles
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + plan.duration_days);
              setActivePlan({ id: plan.id, expiresAt: expiresAt.toISOString() });
              Alert.alert('購入完了', `${plan.name}が有効になりました！`);
            } catch {
              Alert.alert('エラー', '購入に失敗しました。再度お試しください。');
            } finally {
              setPurchasing(false);
            }
          },
        },
      ],
    );
  };

  const daysRemaining = activePlan
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activePlan.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>優先表示ブースト</Text>
          <Text style={styles.subtitle}>
            お客さまの検索結果で上位に表示されます
          </Text>
        </View>

        {/* Active Boost Status */}
        {activePlan && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <Ionicons name="rocket" size={24} color={PRO_BOOST.BADGE_COLOR} />
              <Text style={styles.activeTitle}>ブースト有効中</Text>
            </View>
            <Text style={styles.activeRemaining}>
              残り {daysRemaining}日
            </Text>
            <View style={styles.activeBar}>
              <View
                style={[
                  styles.activeBarFill,
                  {
                    width: `${Math.min(100, (daysRemaining / 30) * 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>仕組み</Text>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="arrow-up-circle" size={20} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>検索結果で上位表示</Text>
              <Text style={styles.featureDesc}>
                お客さまがプロを探す際に優先的に表示されます
              </Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="pricetag" size={20} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>「{PRO_BOOST.BADGE_TEXT}」バッジ</Text>
              <Text style={styles.featureDesc}>
                プロフィールに優先バッジが付き、信頼性がアップ
              </Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name="notifications" size={20} color={Colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>依頼数UP</Text>
              <Text style={styles.featureDesc}>
                上位表示により依頼獲得のチャンスが増えます
              </Text>
            </View>
          </View>
        </View>

        {/* Plans */}
        <Text style={styles.sectionTitle}>プランを選ぶ</Text>
        {PRO_BOOST.PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isActive = activePlan?.id === plan.id;
          const dailyPrice = Math.round(plan.price / plan.duration_days);

          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
                isActive && styles.planCardActive,
              ]}
              onPress={() => !isActive && setSelectedPlan(plan.id)}
              disabled={isActive}
            >
              {/* Badge label */}
              {plan.label && (
                <View
                  style={[
                    styles.planBadge,
                    {
                      backgroundColor:
                        plan.label === '人気No.1'
                          ? PRO_BOOST.BADGE_COLOR
                          : Colors.primarySoft,
                    },
                  ]}
                >
                  <Text style={styles.planBadgeText}>{plan.label}</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View>
                  <Text
                    style={[
                      styles.planName,
                      isSelected && styles.planNameSelected,
                    ]}
                  >
                    {plan.name}
                  </Text>
                  <Text style={styles.planDaily}>
                    1日あたり ¥{dailyPrice.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.planPriceWrap}>
                  <Text
                    style={[
                      styles.planPrice,
                      isSelected && styles.planPriceSelected,
                    ]}
                  >
                    ¥{plan.price.toLocaleString()}
                  </Text>
                  <Text style={styles.planPeriod}>
                    / {plan.duration_days}日
                  </Text>
                </View>
              </View>

              {isActive && (
                <View style={styles.activePlanTag}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.activePlanTagText}>利用中</Text>
                </View>
              )}

              {/* Selection indicator */}
              <View
                style={[
                  styles.planRadio,
                  isSelected && styles.planRadioSelected,
                ]}
              >
                {isSelected && <View style={styles.planRadioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Purchase Button */}
        <TouchableOpacity
          style={[
            styles.purchaseBtn,
            (!selectedPlan || purchasing) && styles.purchaseBtnDisabled,
          ]}
          onPress={handlePurchase}
          disabled={!selectedPlan || purchasing}
        >
          <Ionicons name="rocket" size={22} color={Colors.white} />
          <Text style={styles.purchaseBtnText}>
            {purchasing ? '処理中...' : 'ブーストを購入'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          購入後のキャンセル・返金はできません。{'\n'}
          ブースト期間中も通常のランキングスコアは併用されます。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Active
  activeCard: {
    backgroundColor: PRO_BOOST.BADGE_COLOR + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: PRO_BOOST.BADGE_COLOR + '40',
    marginBottom: Spacing.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activeTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: PRO_BOOST.BADGE_COLOR,
  },
  activeRemaining: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  activeBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  activeBarFill: {
    height: '100%',
    backgroundColor: PRO_BOOST.BADGE_COLOR,
    borderRadius: 3,
  },

  // How it works
  howItWorks: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Plans
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  planCardActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '08',
    opacity: 0.7,
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  planBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planNameSelected: { color: Colors.primary },
  planDaily: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  planPriceWrap: { alignItems: 'flex-end' },
  planPrice: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  planPriceSelected: { color: Colors.primary },
  planPeriod: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  activePlanTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  activePlanTagText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  planRadio: {
    position: 'absolute',
    left: Spacing.lg,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'none', // hidden — using border highlight instead
  },
  planRadioSelected: {
    borderColor: Colors.primary,
  },
  planRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  // Purchase
  purchaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  purchaseBtnDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  purchaseBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
});
