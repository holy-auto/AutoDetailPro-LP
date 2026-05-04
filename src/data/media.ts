export type MediaPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "voicy"
  | "note"
  | "press";

export type SocialFeature = {
  platform: MediaPlatform;
  creatorName: string;
  creatorHandle?: string;
  href: string;
  caption: string;
  postedAt?: string;
  category?: "ペット" | "ワーママ" | "キャンプ" | "ライフスタイル" | "経営者" | "その他";
};

export type PressFeature = {
  outlet: string;
  href: string;
  title: string;
  publishedAt?: string;
};

export const SOCIAL_FEATURES: SocialFeature[] = [];

export const PRESS_FEATURES: PressFeature[] = [];
