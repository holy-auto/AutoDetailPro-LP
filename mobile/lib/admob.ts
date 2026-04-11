import { ADMOB } from '@/constants/business-rules';

// =============================================
// AdMob Integration — Google Mobile Ads (スタブ版)
// =============================================
// react-native-google-mobile-ads がインストールされるまでのスタブ実装。
// API はそのまま維持し、実際の広告表示はスキップする。
// パッケージ導入後、このファイルを実装版に差し替える。

let _interstitialCount = 0;
let _lastInterstitialTime = 0;

/** インタースティシャル広告を事前ロード（スタブ: 何もしない） */
export function preloadInterstitial(): void {}

/** インタースティシャル広告が表示可能か判定 */
export function canShowInterstitial(): boolean {
  return false;
}

/** インタースティシャル広告を表示（スタブ: 常にfalse） */
export function showInterstitial(): boolean {
  return false;
}

/** リワード動画広告（スタブ: 常にfalse） */
export function showRewardedAd(): Promise<boolean> {
  return Promise.resolve(false);
}

/** セッション開始時にカウンターをリセット */
export function resetAdSession(): void {
  _interstitialCount = 0;
  _lastInterstitialTime = 0;
}

/** サブスク会員はAdMob広告を非表示にするかチェック */
export function shouldHideAds(isSubscriber: boolean): boolean {
  return ADMOB.RULES.HIDE_ADS_FOR_SUBSCRIPTION && isSubscriber;
}
