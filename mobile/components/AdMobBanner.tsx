import { View } from 'react-native';
import { shouldHideAds } from '@/lib/admob';

// =============================================
// AdMobBanner — スタブ版
// =============================================
// react-native-google-mobile-ads 導入後に実装版に差し替え。
// 現在は何も表示しない。

type Props = {
  size?: string;
  isSubscriber?: boolean;
  style?: any;
};

export default function AdMobBanner({
  isSubscriber = false,
}: Props) {
  if (shouldHideAds(isSubscriber)) return null;
  // スタブ: AdMob SDK導入まで何も表示しない
  return null;
}
