import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdUnitIds, shouldHideAds } from '@/lib/admob';
import { Spacing } from '@/constants/colors';

// =============================================
// AdMobBanner — Google AdMob バナー広告
// =============================================
// 使い方: <AdMobBanner size="BANNER" />
// ホーム画面下部やフィード内に配置

type Props = {
  size?: keyof typeof BannerAdSize;
  isSubscriber?: boolean;
  style?: any;
};

export default function AdMobBanner({
  size = 'ANCHORED_ADAPTIVE_BANNER',
  isSubscriber = false,
  style,
}: Props) {
  const [failed, setFailed] = useState(false);

  // サブスク会員は非表示
  if (shouldHideAds(isSubscriber)) return null;
  if (failed) return null;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={AdUnitIds.banner}
        size={BannerAdSize[size]}
        requestOptions={{
          keywords: ['car wash', 'auto detailing', 'car care', 'coating'],
        }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
});
