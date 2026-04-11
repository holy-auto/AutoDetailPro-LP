import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import { showRewardedAd, shouldHideAds } from '@/lib/admob';
import { ADMOB } from '@/constants/business-rules';

// =============================================
// RewardedAdButton — リワード動画広告ボタン
// =============================================
// 動画視聴 → クーポン獲得のUI
// 使い方: <RewardedAdButton onRewardEarned={(amount) => {...}} />

type Props = {
  onRewardEarned: (amount: number) => void;
  isSubscriber?: boolean;
  style?: any;
};

export default function RewardedAdButton({
  onRewardEarned,
  isSubscriber = false,
  style,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [earned, setEarned] = useState(false);

  if (shouldHideAds(isSubscriber)) return null;
  if (earned) {
    return (
      <View style={[styles.container, styles.earnedContainer, style]}>
        <View style={styles.earnedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.earnedText}>
            ¥{ADMOB.RULES.REWARDED_COUPON_AMOUNT}クーポン獲得済み！
          </Text>
        </View>
      </View>
    );
  }

  const handlePress = async () => {
    setLoading(true);
    try {
      const success = await showRewardedAd();
      if (success) {
        setEarned(true);
        onRewardEarned(ADMOB.RULES.REWARDED_COUPON_AMOUNT);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Ionicons name="play-circle" size={24} color={Colors.white} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.buttonTitle}>
                動画を見て¥{ADMOB.RULES.REWARDED_COUPON_AMOUNT}OFFクーポンGET
              </Text>
              <Text style={styles.buttonSub}>
                短い動画を視聴するだけ（約15-30秒）
              </Text>
            </View>
            <Ionicons name="gift-outline" size={22} color="#FCD34D" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  earnedContainer: {},
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  earnedText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.success,
  },
});
