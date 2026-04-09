import { Platform } from 'react-native';
import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { ADMOB } from '@/constants/business-rules';

// =============================================
// AdMob Integration — Google Mobile Ads
// =============================================
// バナー / インタースティシャル / リワード動画
// テスト環境ではGoogle公式のテストIDを使用

// --- Ad Unit ID helpers ---

function getAdUnitId(type: 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'NATIVE'): string {
  const ids = ADMOB[type];
  return Platform.OS === 'ios' ? ids.ios : ids.android;
}

export const AdUnitIds = {
  banner: getAdUnitId('BANNER'),
  interstitial: getAdUnitId('INTERSTITIAL'),
  rewarded: getAdUnitId('REWARDED'),
  native: getAdUnitId('NATIVE'),
};

// --- Interstitial Ad ---

let _lastInterstitialTime = 0;
let _interstitialCount = 0;
let _interstitialAd: InterstitialAd | null = null;
let _interstitialLoaded = false;

/** インタースティシャル広告を事前ロード */
export function preloadInterstitial(): void {
  if (_interstitialAd) return;

  _interstitialAd = InterstitialAd.createForAdRequest(AdUnitIds.interstitial, {
    keywords: ['car wash', 'auto detailing', 'car care', 'coating'],
  });

  _interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    _interstitialLoaded = true;
  });

  _interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    _interstitialLoaded = false;
    _interstitialAd = null;
    // 次回用に事前ロード
    preloadInterstitial();
  });

  _interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
    _interstitialLoaded = false;
    _interstitialAd = null;
  });

  _interstitialAd.load();
}

/** インタースティシャル広告が表示可能か判定 */
export function canShowInterstitial(): boolean {
  if (!_interstitialLoaded) return false;

  const now = Date.now();
  const cooldownMs = ADMOB.RULES.INTERSTITIAL_COOLDOWN_SEC * 1000;
  if (now - _lastInterstitialTime < cooldownMs) return false;
  if (_interstitialCount >= ADMOB.RULES.MAX_INTERSTITIALS_PER_SESSION) return false;

  return true;
}

/**
 * インタースティシャル広告を表示
 * - クールダウン制限（120秒間隔）
 * - セッション回数制限（最大3回）
 * @returns 表示できたかどうか
 */
export function showInterstitial(): boolean {
  if (!canShowInterstitial()) return false;

  _interstitialAd?.show();
  _lastInterstitialTime = Date.now();
  _interstitialCount++;
  return true;
}

// --- Rewarded Ad ---

/**
 * リワード動画広告をロード→表示→報酬コールバック
 * @returns Promise<boolean> — ユーザーが最後まで視聴したらtrue
 */
export function showRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const rewardedAd = RewardedAd.createForAdRequest(AdUnitIds.rewarded, {
      keywords: ['car wash', 'auto detailing', 'car accessories'],
    });

    let earned = false;

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedAd.show();
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(earned);
    });

    rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
      resolve(false);
    });

    rewardedAd.load();
  });
}

// --- Session management ---

/** セッション開始時にカウンターをリセット */
export function resetAdSession(): void {
  _interstitialCount = 0;
  _lastInterstitialTime = 0;
}

/** サブスク会員はAdMob広告を非表示にするかチェック */
export function shouldHideAds(isSubscriber: boolean): boolean {
  return ADMOB.RULES.HIDE_ADS_FOR_SUBSCRIPTION && isSubscriber;
}
