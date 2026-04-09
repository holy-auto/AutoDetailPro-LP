import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/colors';
import type { AdPlacement } from '@/constants/business-rules';

// =============================================
// AdBanner — 広告バナーコンポーネント
// =============================================
// 使い方: <AdBanner placement="home_top" />
// ホーム画面上部、検索画面、注文完了後など各所に配置可能

type Ad = {
  id: string;
  ad_type: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  cta_text?: string;
  advertiser_type: string;
};

type Props = {
  placement: AdPlacement;
  style?: any;
};

// デモ広告データ
const DEMO_ADS: Record<string, Ad[]> = {
  home_top: [
    {
      id: 'demo-1',
      ad_type: 'banner',
      title: '春の洗車キャンペーン',
      description: '今だけ全メニュー20%OFF！花粉・黄砂を徹底除去',
      image_url: null as any,
      link_url: null as any,
      cta_text: '詳しく見る',
      advertiser_type: 'admin',
    },
  ],
  home_feed: [
    {
      id: 'demo-2',
      ad_type: 'pro_promotion',
      title: 'プロ洗車師 田中さんのコーティング',
      description: '★4.9 / 施工実績200件超のベテラン。ガラスコーティング専門',
      image_url: null as any,
      link_url: null as any,
      cta_text: '予約する',
      advertiser_type: 'pro',
    },
  ],
  search_top: [
    {
      id: 'demo-3',
      ad_type: 'sponsored',
      title: 'カーコーティング専門店 GLOSSY',
      description: '出張コーティング承ります。新車のような輝きを',
      image_url: null as any,
      link_url: null as any,
      cta_text: 'もっと見る',
      advertiser_type: 'external',
    },
  ],
  order_complete: [
    {
      id: 'demo-4',
      ad_type: 'banner',
      title: '次回も使える10%OFFクーポン',
      description: 'アプリ限定クーポンを今すぐGET',
      image_url: null as any,
      link_url: null as any,
      cta_text: 'クーポンを見る',
      advertiser_type: 'admin',
    },
  ],
  pro_list: [],
};

export default function AdBanner({ placement, style }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // デモモード：ローカルデータ使用
    const demoAds = DEMO_ADS[placement] ?? [];
    setAds(demoAds);
  }, [placement]);

  if (dismissed || ads.length === 0) return null;

  const ad = ads[currentIndex % ads.length];

  const handlePress = () => {
    // トラッキング（デモではスキップ）
    if (ad.link_url) {
      Linking.openURL(ad.link_url);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const isProAd = ad.advertiser_type === 'pro';
  const isSponsored = ad.advertiser_type === 'external';

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.banner,
          isProAd && styles.bannerPro,
          isSponsored && styles.bannerSponsored,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* ラベル */}
        <View style={styles.labelRow}>
          <View style={[
            styles.label,
            isProAd && styles.labelPro,
            isSponsored && styles.labelSponsored,
          ]}>
            <Text style={[
              styles.labelText,
              isProAd && styles.labelTextPro,
              isSponsored && styles.labelTextSponsored,
            ]}>
              {isProAd ? 'プロのおすすめ' : isSponsored ? 'スポンサー' : 'おすすめ'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 画像（ある場合） */}
        {ad.image_url && (
          <Image
            source={{ uri: ad.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* テキスト */}
        <View style={styles.textArea}>
          <Text style={styles.title} numberOfLines={1}>{ad.title}</Text>
          {ad.description && (
            <Text style={styles.description} numberOfLines={2}>{ad.description}</Text>
          )}
        </View>

        {/* CTA */}
        {ad.cta_text && (
          <View style={[
            styles.ctaButton,
            isProAd && styles.ctaButtonPro,
          ]}>
            <Text style={[
              styles.ctaText,
              isProAd && styles.ctaTextPro,
            ]}>
              {ad.cta_text}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isProAd ? Colors.primary : Colors.primaryMedium}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: Spacing.lg, marginVertical: Spacing.sm },
  banner: {
    backgroundColor: Colors.primaryFaint,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryPale,
  },
  bannerPro: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  bannerSponsored: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  // Label
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    backgroundColor: Colors.primaryMedium,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelPro: { backgroundColor: '#F59E0B' },
  labelSponsored: { backgroundColor: Colors.success },
  labelText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  labelTextPro: {},
  labelTextSponsored: {},

  // Image
  image: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.sm,
    marginVertical: Spacing.sm,
  },

  // Text
  textArea: { marginBottom: Spacing.xs },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 2,
    marginTop: Spacing.xs,
  },
  ctaButtonPro: {},
  ctaText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primaryMedium,
  },
  ctaTextPro: { color: Colors.primary },
});
