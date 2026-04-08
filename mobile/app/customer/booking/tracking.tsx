import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import {
  CUSTOMER_TRACKER_STEPS,
  CANCELLATION,
  COMPLETION,
  ORDER_STATUS,
  type OrderStatus,
} from '@/constants/business-rules';

// Status progression for simulation
const STATUS_FLOW: OrderStatus[] = [
  'payment_authorized',
  'requested',
  'accepted',
  'on_the_way',
  'arrived',
  'in_progress',
  'pro_marked_done',
];

export default function TrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    proName: string;
    totalPrice: string;
    paymentMethod: string;
    orderId: string;
  }>();

  const totalPrice = parseInt(params.totalPrice ?? '0', 10);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('accepted');
  const [eta, setEta] = useState('5分');
  const [confirmTimeout, setConfirmTimeout] = useState(COMPLETION.CONFIRMATION_TIMEOUT_MIN * 60);

  // Simulate status progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => { setCurrentStatus('on_the_way'); setEta('3分'); }, 3000));
    timers.push(setTimeout(() => { setCurrentStatus('arrived'); setEta('到着'); }, 8000));
    timers.push(setTimeout(() => setCurrentStatus('in_progress'), 12000));
    timers.push(setTimeout(() => setCurrentStatus('pro_marked_done'), 18000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-complete countdown when pro marks done
  useEffect(() => {
    if (currentStatus !== 'pro_marked_done') return;
    const timer = setInterval(() => {
      setConfirmTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStatus]);

  const handleAutoComplete = () => {
    router.replace({
      pathname: '/customer/booking/complete',
      params: {
        proName: params.proName,
        totalPrice: params.totalPrice,
        orderId: params.orderId,
        autoCompleted: 'true',
      },
    });
  };

  const handleConfirmComplete = () => {
    router.replace({
      pathname: '/customer/booking/complete',
      params: {
        proName: params.proName,
        totalPrice: params.totalPrice,
        orderId: params.orderId,
        autoCompleted: 'false',
      },
    });
  };

  const handleCancel = () => {
    // Determine fee based on current status
    let message = '';
    if (['payment_authorized', 'requested'].includes(currentStatus)) {
      message = 'プロ承認前のため無料でキャンセルできます。';
    } else if (['accepted', 'on_the_way'].includes(currentStatus)) {
      message = `承認後のキャンセルは${CANCELLATION.AFTER_ACCEPTANCE_BEFORE_ARRIVAL.label}が発生します。`;
    } else if (['arrived', 'in_progress'].includes(currentStatus)) {
      message = `到着後のキャンセルは${CANCELLATION.AFTER_ARRIVAL.label}が発生します。`;
    }

    Alert.alert('キャンセル確認', message, [
      { text: '戻る', style: 'cancel' },
      {
        text: 'キャンセルする',
        style: 'destructive',
        onPress: () => router.dismissAll(),
      },
    ]);
  };

  const currentStepIndex = CUSTOMER_TRACKER_STEPS.findIndex(
    (step) => step.status === currentStatus
  );

  const confirmMin = Math.floor(confirmTimeout / 60);
  const confirmSec = confirmTimeout % 60;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>予約状況</Text>
          <Text style={styles.subtitle}>{params.proName}</Text>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="navigate" size={32} color={Colors.primarySoft} />
          <Text style={styles.mapText}>
            {currentStatus === 'on_the_way' && `到着まで約${eta}`}
            {currentStatus === 'arrived' && 'プロが到着しました'}
            {currentStatus === 'in_progress' && '作業中...'}
            {currentStatus === 'pro_marked_done' && '完了確認をお願いします'}
            {currentStatus === 'accepted' && 'プロが移動を開始します'}
          </Text>
        </View>

        {/* Status Tracker */}
        <View style={styles.tracker}>
          {CUSTOMER_TRACKER_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <View key={step.status} style={styles.trackerRow}>
                <View style={styles.trackerLeft}>
                  <View
                    style={[
                      styles.trackerDot,
                      isCompleted && styles.trackerDotCompleted,
                      isCurrent && styles.trackerDotCurrent,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={12} color={Colors.white} />
                    ) : (
                      <Ionicons
                        name={step.icon as any}
                        size={12}
                        color={Colors.textMuted}
                      />
                    )}
                  </View>
                  {idx < CUSTOMER_TRACKER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.trackerLine,
                        isCompleted && styles.trackerLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.trackerLabel,
                    isCurrent && styles.trackerLabelCurrent,
                    isCompleted && !isCurrent && styles.trackerLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Pro Marked Done — confirm or auto-complete */}
        {currentStatus === 'pro_marked_done' && (
          <View style={styles.confirmSection}>
            <View style={styles.confirmCard}>
              <Ionicons name="clipboard-outline" size={28} color={Colors.primary} />
              <Text style={styles.confirmTitle}>プロが作業完了を報告しました</Text>
              <Text style={styles.confirmDesc}>
                作業内容を確認して完了ボタンを押してください。
                {'\n'}未確認の場合、{COMPLETION.CONFIRMATION_TIMEOUT_MIN}分後に自動完了します。
              </Text>
              <Text style={styles.confirmTimer}>
                自動完了まで {confirmMin}:{confirmSec.toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={handleConfirmComplete}
              >
                <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
                <Text style={styles.completeBtnText}>作業完了を確認</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>お支払い金額</Text>
            <Text style={styles.infoValue}>¥{totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>決済方法</Text>
            <Text style={styles.infoValue}>
              {params.paymentMethod === 'online' ? 'オンライン決済' : '現金決済'}
            </Text>
          </View>
        </View>

        {/* Cancel Button */}
        {currentStatus !== 'pro_marked_done' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>キャンセル</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.md, color: Colors.primaryMedium, fontWeight: '600', marginTop: 2 },
  mapPlaceholder: {
    height: 160, backgroundColor: Colors.primaryFaint, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
    borderColor: Colors.primaryPale, marginBottom: Spacing.lg,
  },
  mapText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.primaryMedium, marginTop: Spacing.sm },
  // Tracker
  tracker: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 3,
  },
  trackerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  trackerLeft: { alignItems: 'center', width: 28 },
  trackerDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.borderLight,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  trackerDotCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  trackerDotCurrent: {
    backgroundColor: Colors.primary, borderColor: Colors.primaryPale, borderWidth: 3,
    width: 32, height: 32, borderRadius: 16,
  },
  trackerLine: {
    width: 2, height: 24, backgroundColor: Colors.border, marginVertical: 2,
  },
  trackerLineCompleted: { backgroundColor: Colors.primary },
  trackerLabel: {
    fontSize: FontSize.md, color: Colors.textMuted, paddingTop: 4,
  },
  trackerLabelCurrent: { color: Colors.primary, fontWeight: '700' },
  trackerLabelCompleted: { color: Colors.textSecondary },
  // Confirm
  confirmSection: { marginBottom: Spacing.md },
  confirmCard: {
    backgroundColor: Colors.primaryFaint, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, alignItems: 'center', borderWidth: 1,
    borderColor: Colors.primaryPale,
  },
  confirmTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary,
    marginTop: Spacing.sm, textAlign: 'center',
  },
  confirmDesc: {
    fontSize: FontSize.sm, color: Colors.primaryMedium, textAlign: 'center',
    marginTop: Spacing.sm, lineHeight: 20,
  },
  confirmTimer: {
    fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary,
    marginTop: Spacing.md, fontVariant: ['tabular-nums'],
  },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.success, paddingVertical: 14, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, marginTop: Spacing.md, gap: Spacing.sm, width: '100%',
  },
  completeBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
  // Info
  infoCard: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  cancelBtn: {
    alignItems: 'center', paddingVertical: Spacing.md,
  },
  cancelBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.error },
});
