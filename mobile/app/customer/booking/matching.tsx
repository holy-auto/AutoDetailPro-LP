import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { MATCHING } from '@/constants/business-rules';

export default function MatchingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    proId: string;
    proName: string;
    totalPrice: string;
    paymentMethod: string;
    orderId: string;
  }>();

  const [status, setStatus] = useState<'searching' | 'expanded' | 'accepted' | 'no_match'>('searching');
  const [countdown, setCountdown] = useState<number>(MATCHING.ACCEPTANCE_TIMEOUT_SEC);
  const [radius, setRadius] = useState<number>(MATCHING.BASE_RADIUS_KM);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (status !== 'searching' && status !== 'expanded') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (status === 'searching') {
            handleNoMatchInRange();
          } else {
            setStatus('no_match');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Simulate pro accepting after some time
  useEffect(() => {
    const acceptTimeout = setTimeout(() => {
      if (status === 'searching' || status === 'expanded') {
        setStatus('accepted');
        setTimeout(() => {
          router.replace({
            pathname: '/customer/booking/tracking',
            params: {
              proName: params.proName ?? '田中 太郎',
              totalPrice: params.totalPrice,
              paymentMethod: params.paymentMethod,
              orderId: params.orderId,
            },
          });
        }, 1500);
      }
    }, 5000);

    return () => clearTimeout(acceptTimeout);
  }, [status]);

  const handleNoMatchInRange = () => {
    Alert.alert(
      '周辺にプロが見つかりません',
      `現在${MATCHING.BASE_RADIUS_KM}km圏内に対応可能なプロがいません。\n検索範囲を${MATCHING.EXPANDED_RADIUS_KM}kmに拡大しますか？`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
          onPress: () => {
            setStatus('no_match');
          },
        },
        {
          text: '拡大する',
          onPress: () => {
            setStatus('expanded');
            setRadius(MATCHING.EXPANDED_RADIUS_KM);
            setCountdown(MATCHING.ACCEPTANCE_TIMEOUT_SEC);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert('依頼をキャンセル', 'プロ承認前のため無料でキャンセルできます。', [
      { text: '戻る', style: 'cancel' },
      {
        text: 'キャンセルする',
        style: 'destructive',
        onPress: () => router.dismissAll(),
      },
    ]);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === 'accepted' ? (
          <View style={styles.acceptedContainer}>
            <View style={styles.acceptedCircle}>
              <Ionicons name="checkmark" size={64} color={Colors.white} />
            </View>
            <Text style={styles.acceptedTitle}>プロが承認しました！</Text>
            <Text style={styles.acceptedName}>{params.proName}</Text>
            <Text style={styles.acceptedSub}>まもなく移動を開始します</Text>
          </View>
        ) : status === 'no_match' ? (
          <View style={styles.noMatchContainer}>
            <Ionicons name="sad-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.noMatchTitle}>
              対応可能なプロが見つかりませんでした
            </Text>
            <Text style={styles.noMatchSub}>
              時間帯を変えて再度お試しください
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.dismissAll()}
            >
              <Text style={styles.retryButtonText}>ホームに戻る</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Searching Animation */}
            <View style={styles.searchContainer}>
              <Animated.View
                style={[
                  styles.pulseCircle3,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.pulseCircle2,
                  {
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.5],
                          outputRange: [1, 1.3],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.searchCenter}>
                <Ionicons name="search" size={36} color={Colors.white} />
              </View>
            </View>

            <Text style={styles.searchTitle}>
              {status === 'expanded' ? '範囲拡大検索中...' : 'プロを検索中...'}
            </Text>
            <Text style={styles.searchRadius}>検索範囲: {radius}km</Text>

            {/* Countdown */}
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>受付猶予時間</Text>
              <Text style={styles.countdownTime}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(countdown / MATCHING.ACCEPTANCE_TIMEOUT_SEC) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>キャンセル（無料）</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  // Searching
  searchContainer: { justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  pulseCircle3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primaryFaint, opacity: 0.3,
  },
  pulseCircle2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.primaryPale, opacity: 0.5,
  },
  searchCenter: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  searchTitle: {
    fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.lg,
  },
  searchRadius: {
    fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs,
  },
  countdownContainer: { alignItems: 'center', marginTop: Spacing.xxl },
  countdownLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  countdownTime: {
    fontSize: 48, fontWeight: '800', color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    width: 200, height: 4, backgroundColor: Colors.borderLight, borderRadius: 2,
    marginTop: Spacing.sm, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  cancelButton: {
    marginTop: Spacing.xxl, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
  },
  cancelText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textMuted },
  // Accepted
  acceptedContainer: { alignItems: 'center' },
  acceptedCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.success,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg,
  },
  acceptedTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  acceptedName: { fontSize: FontSize.lg, color: Colors.primary, fontWeight: '600', marginTop: Spacing.sm },
  acceptedSub: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  // No Match
  noMatchContainer: { alignItems: 'center', gap: Spacing.md },
  noMatchTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  noMatchSub: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center' },
  retryButton: {
    backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md, marginTop: Spacing.md,
  },
  retryButtonText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
