import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import * as Location from 'expo-location';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { CANCELLATION, PAYMENT_METHOD, type PaymentMethod } from '@/constants/business-rules';
import { createPaymentIntent } from '@/lib/stripe';
import { createOrder, authorizePayment } from '@/lib/orders';
import { useAuth } from '../../_layout';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    proId: string;
    proName: string;
    menuIds: string;
    totalPrice: string;
  }>();
  const totalPrice = parseInt(params.totalPrice ?? '0', 10);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHOD.ONLINE);
  const [processing, setProcessing] = useState(false);

  const handleConfirmOrder = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }
    setProcessing(true);
    try {
      const loc = await Location.getLastKnownPositionAsync().catch(() => null);
      const location = {
        lat: loc?.coords.latitude ?? 35.6762,
        lng: loc?.coords.longitude ?? 139.6503,
      };

      const menuIds = params.menuIds ? params.menuIds.split(',').filter(Boolean) : [];
      const orderResult = await createOrder(user.id, menuIds, paymentMethod, totalPrice, location);
      if (!orderResult.success) {
        Alert.alert('エラー', orderResult.error);
        return;
      }
      const { orderId } = orderResult.data;

      let paymentIntentId: string | undefined;

      if (paymentMethod === PAYMENT_METHOD.ONLINE) {
        const pi = await createPaymentIntent({
          orderId,
          amount: totalPrice,
          paymentMethod,
          customerEmail: user.email ?? '',
        });

        if (!pi.clientSecret) {
          Alert.alert('エラー', '決済の初期化に失敗しました。再度お試しください。');
          return;
        }

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'Mobile Wash',
          paymentIntentClientSecret: pi.clientSecret,
          allowsDelayedPaymentMethods: false,
        });
        if (initError) {
          Alert.alert('決済エラー', initError.message);
          return;
        }

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          if (presentError.code !== 'Canceled') {
            Alert.alert('決済エラー', presentError.message);
          }
          return;
        }

        paymentIntentId = pi.paymentIntentId;
        await authorizePayment(orderId, paymentIntentId);
      } else {
        await authorizePayment(orderId);
      }

      router.push({
        pathname: '/customer/booking/matching',
        params: {
          proId: params.proId,
          proName: params.proName,
          totalPrice: params.totalPrice,
          paymentMethod,
          orderId,
          ...(paymentIntentId ? { paymentIntentId } : {}),
        },
      });
    } catch (e) {
      Alert.alert('エラー', (e as Error)?.message ?? '処理に失敗しました。再度お試しください。');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>お支払い</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>注文内容</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>プロ</Text>
            <Text style={styles.summaryValue}>{params.proName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>合計金額</Text>
            <Text style={styles.totalPrice}>¥{totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>決済方法</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === PAYMENT_METHOD.ONLINE && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod(PAYMENT_METHOD.ONLINE)}
          >
            <Ionicons
              name="card"
              size={22}
              color={paymentMethod === PAYMENT_METHOD.ONLINE ? Colors.primary : Colors.textMuted}
            />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentName,
                paymentMethod === PAYMENT_METHOD.ONLINE && styles.paymentNameActive,
              ]}>
                オンライン決済
              </Text>
              <Text style={styles.paymentDesc}>
                事前決済 — 完了確認後にプロへ支払い
              </Text>
            </View>
            <View style={[
              styles.radio,
              paymentMethod === PAYMENT_METHOD.ONLINE && styles.radioActive,
            ]}>
              {paymentMethod === PAYMENT_METHOD.ONLINE && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === PAYMENT_METHOD.CASH && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod(PAYMENT_METHOD.CASH)}
          >
            <Ionicons
              name="cash"
              size={22}
              color={paymentMethod === PAYMENT_METHOD.CASH ? Colors.primary : Colors.textMuted}
            />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentName,
                paymentMethod === PAYMENT_METHOD.CASH && styles.paymentNameActive,
              ]}>
                現金決済
              </Text>
              <Text style={styles.paymentDesc}>
                作業完了後にプロへ直接お支払い
              </Text>
            </View>
            <View style={[
              styles.radio,
              paymentMethod === PAYMENT_METHOD.CASH && styles.radioActive,
            ]}>
              {paymentMethod === PAYMENT_METHOD.CASH && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>キャンセルポリシー</Text>
          <View style={styles.policyRow}>
            <View style={[styles.policyDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.policyText}>
              プロ承認前：{CANCELLATION.BEFORE_ACCEPTANCE.label}
            </Text>
          </View>
          <View style={styles.policyRow}>
            <View style={[styles.policyDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.policyText}>
              承認後〜到着前：{CANCELLATION.AFTER_ACCEPTANCE_BEFORE_ARRIVAL.label}
            </Text>
          </View>
          <View style={styles.policyRow}>
            <View style={[styles.policyDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.policyText}>
              到着後：{CANCELLATION.AFTER_ARRIVAL.label}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomSummary}>
          <Text style={styles.bottomLabel}>お支払い金額</Text>
          <Text style={styles.bottomTotal}>¥{totalPrice.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, processing && styles.confirmBtnDisabled]}
          onPress={handleConfirmOrder}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>依頼を確定する</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: Spacing.lg, paddingBottom: 160 },
  card: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  cardTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  totalPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xs },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.borderLight,
    marginBottom: Spacing.sm, gap: Spacing.md,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaint },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  paymentNameActive: { color: Colors.primary },
  paymentDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  policyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  policyDot: { width: 8, height: 8, borderRadius: 4 },
  policyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing.lg, paddingBottom: Spacing.xxl,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
    shadowColor: Colors.shadowDark, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
  bottomSummary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bottomLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  bottomTotal: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  confirmBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
