// =============================================
// Mobile Wash — Business Rules & Constants
// =============================================

// --- Matching ---
export const MATCHING = {
  BASE_RADIUS_KM: 15,
  EXPANDED_RADIUS_KM: 30,
  ACCEPTANCE_TIMEOUT_SEC: 300, // 5分
  ASK_EXPAND_ON_NO_MATCH: true,
} as const;

// --- Order Statuses (full state machine) ---
export const ORDER_STATUS = {
  // 作成中
  DRAFT: 'draft',
  // 決済
  PAYMENT_AUTHORIZED: 'payment_authorized',
  // マッチング
  REQUESTED: 'requested',
  REQUESTED_EXPANDED: 'requested_expanded',
  // プロ承認
  ACCEPTED: 'accepted',
  // 移動
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  // 作業
  IN_PROGRESS: 'in_progress',
  PRO_MARKED_DONE: 'pro_marked_done',
  // 完了
  COMPLETED: 'completed',
  AUTO_COMPLETED: 'auto_completed',
  // レビュー
  REVIEW_OPEN: 'review_open',
  // クレーム・返金
  DISPUTE_OPEN: 'dispute_open',
  PARTIALLY_REFUNDED: 'partially_refunded',
  FULLY_REFUNDED: 'fully_refunded',
  DISPUTE_REJECTED: 'dispute_rejected',
  // キャンセル
  CANCELLED: 'cancelled',
  CANCELLED_WITH_FEE_30_50: 'cancelled_with_fee_30_50',
  CANCELLED_WITH_FEE_100: 'cancelled_with_fee_100',
  AUTO_CANCELLED_NO_RESPONSE: 'auto_cancelled_no_response',
  AUTO_CANCELLED_NO_PRO: 'auto_cancelled_no_pro',
  // 終了
  CLOSED: 'closed',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Human-readable labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'メニュー選択中',
  payment_authorized: '決済完了',
  requested: 'プロ検索中',
  requested_expanded: '範囲拡大検索中',
  accepted: 'プロ承認済み',
  on_the_way: 'プロ移動中',
  arrived: 'プロ到着',
  in_progress: '作業中',
  pro_marked_done: '完了報告済み',
  completed: '完了',
  auto_completed: '自動完了',
  review_open: 'レビュー受付中',
  dispute_open: 'クレーム審査中',
  partially_refunded: '一部返金済み',
  fully_refunded: '全額返金済み',
  dispute_rejected: '返金却下',
  cancelled: 'キャンセル',
  cancelled_with_fee_30_50: 'キャンセル(手数料30-50%)',
  cancelled_with_fee_100: 'キャンセル(手数料100%)',
  auto_cancelled_no_response: '自動キャンセル(応答なし)',
  auto_cancelled_no_pro: '自動キャンセル(プロ不在)',
  closed: '終了',
};

// Status color mapping
export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { color: string; bg: string }
> = {
  draft: { color: '#94A3B8', bg: '#F1F5F9' },
  payment_authorized: { color: '#3B82F6', bg: '#EFF6FF' },
  requested: { color: '#3B82F6', bg: '#EFF6FF' },
  requested_expanded: { color: '#8B5CF6', bg: '#F5F3FF' },
  accepted: { color: '#1E3A5F', bg: '#DBEAFE' },
  on_the_way: { color: '#F59E0B', bg: '#FEF3C7' },
  arrived: { color: '#F59E0B', bg: '#FEF3C7' },
  in_progress: { color: '#D4A574', bg: '#FDF2E6' },
  pro_marked_done: { color: '#22C55E', bg: '#DCFCE7' },
  completed: { color: '#22C55E', bg: '#DCFCE7' },
  auto_completed: { color: '#22C55E', bg: '#DCFCE7' },
  review_open: { color: '#8B5CF6', bg: '#F5F3FF' },
  dispute_open: { color: '#EF4444', bg: '#FEE2E2' },
  partially_refunded: { color: '#F59E0B', bg: '#FEF3C7' },
  fully_refunded: { color: '#EF4444', bg: '#FEE2E2' },
  dispute_rejected: { color: '#94A3B8', bg: '#F1F5F9' },
  cancelled: { color: '#94A3B8', bg: '#F1F5F9' },
  cancelled_with_fee_30_50: { color: '#EF4444', bg: '#FEE2E2' },
  cancelled_with_fee_100: { color: '#EF4444', bg: '#FEE2E2' },
  auto_cancelled_no_response: { color: '#94A3B8', bg: '#F1F5F9' },
  auto_cancelled_no_pro: { color: '#94A3B8', bg: '#F1F5F9' },
  closed: { color: '#94A3B8', bg: '#F1F5F9' },
};

// Customer-facing tracker steps
export const CUSTOMER_TRACKER_STEPS = [
  { status: 'payment_authorized', label: '決済完了', icon: 'card' },
  { status: 'requested', label: 'プロ検索中', icon: 'search' },
  { status: 'accepted', label: '承認', icon: 'checkmark-circle' },
  { status: 'on_the_way', label: '移動中', icon: 'car' },
  { status: 'arrived', label: '到着', icon: 'location' },
  { status: 'in_progress', label: '作業中', icon: 'construct' },
  { status: 'pro_marked_done', label: '完了確認', icon: 'clipboard-check' },
  { status: 'completed', label: '完了', icon: 'checkmark-done' },
] as const;

// --- Cancellation Policy ---
export const CANCELLATION = {
  // プロ承認前：無料
  BEFORE_ACCEPTANCE: { fee_percent: 0, label: '無料キャンセル' },
  // 承認後〜到着前：30-50%
  AFTER_ACCEPTANCE_BEFORE_ARRIVAL: {
    fee_percent_min: 30,
    fee_percent_max: 50,
    default_percent: 30,
    label: 'キャンセル料 30〜50%',
  },
  // 到着後：100%
  AFTER_ARRIVAL: { fee_percent: 100, label: 'キャンセル料 100%' },
} as const;

// --- Completion ---
export const COMPLETION = {
  CONFIRMATION_TIMEOUT_MIN: 30, // 30分で自動完了
  DISPUTE_WINDOW_HOURS: 24, // 施工後24時間以内にクレーム申請
} as const;

// --- Refund Policy ---
export const REFUND = {
  WORK_NOT_PERFORMED: { percent: 100, label: '作業未実施 — 全額返金' },
  QUALITY_COMPLAINT: {
    percent_min: 10,
    percent_max: 50,
    label: '品質不満 — 10〜50%返金',
  },
  DEFAULT_REJECT: { label: '基本的に返金不可' },
} as const;

// --- Platform Fee (決済手数料) ---
export const PLATFORM_FEE = {
  CUSTOMER_PERCENT: 5,  // お客様負担 5%
  PRO_PERCENT: 5,       // プロ負担 5%
  TOTAL_PERCENT: 10,    // 合計 10%
} as const;

// --- Payment ---
export const PAYMENT_METHOD = {
  ONLINE: 'online',
  CASH: 'cash',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_STATUS = {
  // Online payment statuses
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  PARTIAL_CAPTURE: 'partial_capture',
  FULL_CAPTURE: 'full_capture',
  CANCELED: 'canceled',
  REFUND_PARTIAL: 'refund_partial',
  REFUND_FULL: 'refund_full',
  // Cash statuses
  UNPAID: 'unpaid',
  CASH_COLLECTED: 'cash_collected',
  // Payout statuses
  PAYOUT_PENDING: 'payout_pending',
  PAYOUT_INSTANT: 'payout_instant',
  PAYOUT_WEEKLY: 'payout_weekly',
  PAYOUT_MONTHLY: 'payout_monthly',
  PAID_OUT: 'paid_out',
  ADJUSTMENT_NEGATIVE: 'adjustment_negative',
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// --- Payout Schedules ---
export const PAYOUT_SCHEDULES = [
  { id: 'instant', name: '即日払い', fee_percent: 3, description: '+3%手数料 / 即日振込' },
  { id: 'weekly', name: '週払い', fee_percent: 0, description: '毎週月曜振込' },
  { id: 'monthly', name: '月払い', fee_percent: 0, description: '毎月1日振込' },
] as const;

export type PayoutSchedule = (typeof PAYOUT_SCHEDULES)[number]['id'];

// --- Cash Settlement ---
export const CASH_SETTLEMENT = {
  // 現金売上はカード売上から自動相殺
  OFFSET_FROM_CARD_EARNINGS: true,
  // 相殺できない場合は請求書発行
  INVOICE_IF_NO_OFFSET: true,
  // 支払い期限（日）
  INVOICE_DUE_DAYS: 14,
  // 未払い時のペナルティ
  PENALTY_ON_OVERDUE: {
    SUSPEND_ORDERS: true,
    DISABLE_CASH: true,
    SEND_REMINDER: true,
  },
} as const;

// --- Business Hours ---
export const BUSINESS_HOURS = {
  OPEN_HOUR: 8,   // 08:00
  CLOSE_HOUR: 20, // 20:00
  TIMEZONE: 'Asia/Tokyo',
  // 営業時間外のトグルONを禁止
  BLOCK_OUTSIDE_HOURS: true,
  // 営業終了時に自動OFF
  AUTO_OFF_AT_CLOSE: true,
} as const;

// --- Service Categories ---
export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'exterior', name: '外装洗車', icon: 'car-wash', description: '手洗い洗車・ワックスがけ', color: '#3B82F6' },
  { id: 'interior', name: '内装クリーニング', icon: 'car-seat', description: 'シート・ダッシュボード・フロアマット', color: '#8B5CF6' },
  { id: 'coating', name: 'コーティング', icon: 'shield-check', description: 'ガラスコーティング・セラミック', color: '#F59E0B' },
  { id: 'polish', name: '磨き・研磨', icon: 'auto-fix', description: '傷消し・ポリッシュ・鏡面仕上げ', color: '#EC4899' },
  { id: 'full_detail', name: 'フルディテイル', icon: 'star-circle', description: '外装＋内装＋コーティングのフルコース', color: '#1E3A5F' },
  { id: 'engine', name: 'エンジンルーム', icon: 'engine', description: 'エンジンルーム洗浄・美装', color: '#EF4444' },
];

// --- Review ---
export const REVIEW = {
  ONE_SIDED: true, // 一方レビュー（片方だけでも公開）
  MIN_RATING: 1,
  MAX_RATING: 5,
} as const;

// --- Pro Ranking & Rating Policy ---
export const PRO_RANKING = {
  // 新人優先表示（登録後N日以内）
  NEWCOMER_BOOST_DAYS: 30,
  NEWCOMER_BOOST_WEIGHT: 50,  // ランキングスコアに+50加算

  // 評価基準
  RATING_GOOD_THRESHOLD: 4.0,        // 基準ライン（4.0以上は問題なし）
  RATING_WARNING_THRESHOLD: 3.5,     // 警告ライン（3.5未満で改善プラン発動）
  MIN_REVIEWS_FOR_EVALUATION: 5,     // 評価対象になる最低レビュー数

  // 改善プラン
  IMPROVEMENT_PLAN: {
    EVALUATION_PERIOD_DAYS: 30,      // 改善期間（30日）
    TARGET_RATING: 3.8,              // 改善目標（3.8以上に回復）
    MIN_ORDERS_DURING_PLAN: 5,       // 改善期間中の最低受注数
    MAX_EXTENSIONS: 1,               // 延長回数上限
    RESTRICTIONS: {
      HIDE_FROM_PRIORITY: true,      // 優先表示から除外
      SHOW_IMPROVEMENT_BADGE: true,  // 改善中バッジ表示
    },
  },

  // 強制退会
  FORCED_REMOVAL: {
    TRIGGER_ON_PLAN_FAILURE: true,   // 改善プラン失敗で発動
    RATING_FLOOR: 2.0,               // 即時退会ライン（2.0未満）
    COOLDOWN_DAYS: 90,               // 再登録禁止期間
  },

  // スコア計算ウェイト（合計100）
  SCORE_WEIGHTS: {
    RATING: 40,           // 評価スコア（5段階→0-40点）
    DISTANCE: 25,         // 距離の近さ（近いほど高得点）
    RESPONSE_RATE: 15,    // 応答率
    COMPLETION_RATE: 10,  // 完了率
    NEWCOMER_BONUS: 10,   // 新人ボーナス枠（新人以外は0）
  },
} as const;

// --- Pro Boost (有料優先表示) ---
export const PRO_BOOST = {
  PLANS: [
    {
      id: 'boost_3d',
      name: '3日間ブースト',
      duration_days: 3,
      price: 980,
      boost_weight: 30,
      label: 'お試し',
    },
    {
      id: 'boost_7d',
      name: '1週間ブースト',
      duration_days: 7,
      price: 1980,
      boost_weight: 30,
      badge: '人気',
      label: '人気No.1',
    },
    {
      id: 'boost_30d',
      name: '1ヶ月ブースト',
      duration_days: 30,
      price: 5980,
      boost_weight: 30,
      label: 'お得',
    },
  ],
  // ブースト中のUI
  BADGE_TEXT: '優先',
  BADGE_COLOR: '#F59E0B',
  // 同時ブースト制限
  MAX_CONCURRENT_BOOSTS: 1,
} as const;

export type BoostPlanId = (typeof PRO_BOOST.PLANS)[number]['id'];

// 改善プランのステータス
export const IMPROVEMENT_STATUS = {
  ACTIVE: 'active',
  PASSED: 'passed',
  FAILED: 'failed',
  EXTENDED: 'extended',
} as const;

export type ImprovementStatus =
  (typeof IMPROVEMENT_STATUS)[keyof typeof IMPROVEMENT_STATUS];

// --- Loyalty & Points ---
export const LOYALTY = {
  POINTS_PER_YEN: 0.01,          // ¥100 = 1pt
  POINTS_TO_YEN: 100,            // 1pt = ¥100 還元
  WELCOME_BONUS: 500,            // 新規登録500pt
  REFERRAL_BONUS: 300,           // 紹介ボーナス300pt
  REVIEW_BONUS: 50,              // レビュー投稿50pt
  TIERS: [
    { id: 'bronze', name: 'ブロンズ', minPoints: 0, discount: 0, color: '#CD7F32' },
    { id: 'silver', name: 'シルバー', minPoints: 3000, discount: 3, color: '#C0C0C0' },
    { id: 'gold', name: 'ゴールド', minPoints: 10000, discount: 5, color: '#FFD700' },
    { id: 'platinum', name: 'プラチナ', minPoints: 30000, discount: 8, color: '#E5E4E2' },
  ],
} as const;

export type LoyaltyTier = (typeof LOYALTY.TIERS)[number]['id'];

// --- Coupons ---
export const COUPON_TYPES = {
  PERCENT: 'percent',
  FIXED: 'fixed',
  FREE_SERVICE: 'free_service',
} as const;

export type CouponType = (typeof COUPON_TYPES)[keyof typeof COUPON_TYPES];

// --- Gift ---
export const GIFT = {
  MIN_AMOUNT: 3000,
  MAX_AMOUNT: 100000,
  EXPIRY_DAYS: 90,               // ギフト有効期限90日
  MESSAGE_MAX_LENGTH: 200,
} as const;

// --- Subscription (定期依頼) ---
export const SUBSCRIPTION = {
  PLANS: [
    { id: 'weekly', name: '週1回コース', intervalDays: 7, discount: 15, label: '15%OFF' },
    { id: 'bi_weekly', name: '隔週コース', intervalDays: 14, discount: 10, label: '10%OFF' },
    { id: 'monthly', name: '月1回コース', intervalDays: 30, discount: 5, label: '5%OFF' },
    { id: 'bi_monthly', name: '隔月コース', intervalDays: 60, discount: 3, label: '3%OFF' },
  ],
  // キャンセルは次回予約日の48時間前まで
  CANCEL_BEFORE_HOURS: 48,
  // 最低継続回数
  MIN_COMMITMENT: 1,
} as const;

export type SubscriptionPlanId = (typeof SUBSCRIPTION.PLANS)[number]['id'];

// --- Quality Audit (覆面調査) ---
export const QUALITY_AUDIT = {
  // 抜き打ち選出確率（完了注文の何%に調査依頼するか）
  SELECTION_RATE: 0.15,           // 15%の注文で依頼
  // 調査依頼の有効期限
  EXPIRY_HOURS: 48,               // 48時間以内に回答
  // 報酬クーポン
  REWARD_COUPON: {
    TYPE: 'percent' as const,
    VALUE: 10,                     // 10%OFF
    VALID_DAYS: 30,                // 30日間有効
  },
  // チェック項目
  CHECKLIST: [
    { id: 'punctuality', label: '時間通りに到着したか', category: 'service', weight: 15 },
    { id: 'greeting', label: '挨拶・身だしなみは適切か', category: 'manner', weight: 10 },
    { id: 'explanation', label: '作業内容の説明があったか', category: 'communication', weight: 10 },
    { id: 'quality_exterior', label: '外装の仕上がりは満足か', category: 'quality', weight: 20 },
    { id: 'quality_interior', label: '内装の仕上がりは満足か', category: 'quality', weight: 15 },
    { id: 'care_vehicle', label: '車を丁寧に扱っていたか', category: 'quality', weight: 10 },
    { id: 'cleanup', label: '作業後の清掃は行われたか', category: 'quality', weight: 10 },
    { id: 'overall', label: '全体的な満足度', category: 'overall', weight: 10 },
  ],
  // スコア算出
  SCORE_SCALE: 5,                  // 各項目1-5で回答
  PASSING_SCORE: 3.5,              // 合格ライン
  // 改善プラン発動条件
  TRIGGER_IMPROVEMENT_BELOW: 3.0,  // この平均以下で改善プラン検討
  // 連続低スコアでのアクション
  CONSECUTIVE_LOW_THRESHOLD: 2,    // 2回連続低スコアで改善プラン自動発動
} as const;

export type AuditChecklistItem = (typeof QUALITY_AUDIT.CHECKLIST)[number];
export type AuditChecklistId = AuditChecklistItem['id'];

// --- Chat ---
export const CHAT = {
  MAX_MESSAGE_LENGTH: 500,
  // NGワード（個人情報交換防止）
  NG_PATTERNS: [
    /\d{3}[-\s]?\d{4}[-\s]?\d{4}/,    // 電話番号
    /[\w.-]+@[\w.-]+\.\w+/,             // メールアドレス
    /line\.me|LINE ID|ライン/i,          // LINE
    /instagram|insta|インスタ/i,         // Instagram
    /twitter|ツイッター/i,               // Twitter/X
  ],
  NG_WARNING: 'サービス外での連絡先交換は禁止されています。',
  // 自動クローズ（注文完了24時間後）
  AUTO_CLOSE_HOURS: 24,
} as const;

// --- KYC (本人確認) ---
export const KYC = {
  DOCUMENT_TYPES: [
    { id: 'drivers_license', name: '運転免許証', requiresBack: true },
    { id: 'my_number', name: 'マイナンバーカード', requiresBack: false },
    { id: 'passport', name: 'パスポート', requiresBack: false },
    { id: 'residence_card', name: '在留カード', requiresBack: true },
  ],
  // セルフィー撮影の指示
  SELFIE_INSTRUCTIONS: '正面を向いて、顔全体が明るく写るように撮影してください。',
  // 審査タイムアウト（営業日）
  REVIEW_DEADLINE_DAYS: 3,
} as const;

export type KYCDocumentType = (typeof KYC.DOCUMENT_TYPES)[number]['id'];

// --- Work Photos (施工写真) ---
export const WORK_PHOTOS = {
  MAX_PHOTOS_PER_ORDER: 10,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/heic'],
} as const;

// --- Push Notifications ---
export const PUSH_NOTIFICATIONS = {
  TYPES: {
    ORDER_STATUS: 'order_status',
    CHAT_MESSAGE: 'chat_message',
    QUALITY_AUDIT: 'quality_audit_request',
    AUDIT_REWARD: 'audit_reward',
    COUPON_ISSUED: 'coupon_issued',
    IMPROVEMENT_PLAN: 'improvement_plan_started',
    REVIEW_REQUEST: 'review_request',
    MATCH_REQUEST: 'match_request',
    SUBSCRIPTION_ORDER: 'subscription_order',
  },
} as const;

// --- Ads (広告) ---
export const ADS = {
  // 広告タイプ
  TYPES: {
    PRO_PROMOTION: 'pro_promotion',     // プロの自己宣伝（メニュー・キャンペーン）
    BANNER: 'banner',                    // 外部広告バナー
    SPONSORED: 'sponsored',              // スポンサード（カー用品店等）
    IN_FEED: 'in_feed',                  // フィード内ネイティブ広告
  },
  // 掲載プラン（プロ向け自己宣伝）
  PRO_AD_PLANS: [
    { id: 'ad_3d', name: '3日間掲載', duration_days: 3, price: 1500, label: 'お試し' },
    { id: 'ad_7d', name: '1週間掲載', duration_days: 7, price: 2980, label: '人気No.1' },
    { id: 'ad_30d', name: '1ヶ月掲載', duration_days: 30, price: 9800, label: 'お得' },
  ],
  // 表示位置
  PLACEMENTS: {
    HOME_TOP: 'home_top',               // ホーム画面上部バナー
    HOME_FEED: 'home_feed',             // ホームフィード内
    SEARCH_TOP: 'search_top',           // 検索画面上部
    ORDER_COMPLETE: 'order_complete',   // 注文完了後
    PRO_LIST: 'pro_list',               // プロ一覧内
  },
  // バナーサイズ
  BANNER_SIZES: {
    FULL_WIDTH: { width: 375, height: 100 },
    HALF_WIDTH: { width: 180, height: 120 },
    SQUARE: { width: 150, height: 150 },
  },
  // 配信設定
  MAX_ADS_PER_SCREEN: 2,               // 1画面に最大2つ
  MIN_INTERVAL_BETWEEN_ADS: 3,         // フィードで広告間に最低3アイテム
  // クリック単価（外部広告）
  CPC_MIN: 30,                          // ¥30〜
  CPM_MIN: 300,                         // ¥300/1000表示〜
  // 審査
  REVIEW_REQUIRED: true,                // 管理者審査必須
  MAX_TEXT_LENGTH: 100,                 // 広告テキスト100文字以内
  MAX_IMAGE_SIZE_MB: 5,
} as const;

export type AdType = (typeof ADS.TYPES)[keyof typeof ADS.TYPES];
export type AdPlacement = (typeof ADS.PLACEMENTS)[keyof typeof ADS.PLACEMENTS];
export type ProAdPlanId = (typeof ADS.PRO_AD_PLANS)[number]['id'];

// --- Scheduled Booking (先日程予約) ---
export const SCHEDULED_BOOKING = {
  MIN_ADVANCE_HOURS: 2,          // 最低2時間先
  MAX_ADVANCE_DAYS: 30,          // 最大30日先
  TIME_SLOTS: [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  ],
} as const;

// --- Vehicle Management (車両管理) ---
export const VEHICLE = {
  SIZES: [
    { id: 'kei', name: '軽自動車', priceMultiplier: 0.8, icon: 'car-sport' },
    { id: 'compact', name: 'コンパクト', priceMultiplier: 1.0, icon: 'car' },
    { id: 'sedan', name: 'セダン', priceMultiplier: 1.0, icon: 'car' },
    { id: 'suv', name: 'SUV / クロスオーバー', priceMultiplier: 1.3, icon: 'car' },
    { id: 'minivan', name: 'ミニバン', priceMultiplier: 1.4, icon: 'bus' },
    { id: 'wagon', name: 'ワゴン', priceMultiplier: 1.2, icon: 'car' },
    { id: 'truck', name: 'トラック / ピックアップ', priceMultiplier: 1.5, icon: 'car' },
    { id: 'luxury', name: '高級車', priceMultiplier: 1.8, icon: 'car-sport' },
  ],
  COLORS: [
    '白', '黒', 'シルバー', 'グレー', '赤', '青', '緑', '黄', 'ブラウン', 'その他',
  ],
  MAX_VEHICLES_PER_USER: 5,
} as const;

export type VehicleSize = (typeof VEHICLE.SIZES)[number]['id'];

// --- Estimate / Quote (見積もり) ---
export const ESTIMATE = {
  DIRT_LEVELS: [
    { id: 'light', name: '軽度（普段の汚れ）', priceMultiplier: 1.0 },
    { id: 'moderate', name: '中度（1ヶ月放置）', priceMultiplier: 1.15 },
    { id: 'heavy', name: '重度（泥・鳥糞・樹液）', priceMultiplier: 1.3 },
    { id: 'extreme', name: '極度（長期放置・苔）', priceMultiplier: 1.5 },
  ],
  // 見積もりの有効期限
  VALIDITY_HOURS: 24,
} as const;

export type DirtLevel = (typeof ESTIMATE.DIRT_LEVELS)[number]['id'];

// --- GPS Tracking (リアルタイム追跡) ---
export const GPS_TRACKING = {
  UPDATE_INTERVAL_SEC: 10,       // 10秒ごとに位置更新
  ARRIVAL_THRESHOLD_METERS: 100, // 100m以内で「到着」判定
  SHOW_ETA: true,                // 到着予測時間を表示
} as const;

// --- Weather Integration (天気連携) ---
export const WEATHER = {
  // 雨天時の対応
  RAIN_THRESHOLD_MM: 1,          // 1mm以上で雨判定
  AUTO_SUGGEST_CANCEL: true,     // 雨予報時にキャンセル提案
  ADVANCE_CHECK_HOURS: 3,        // 予約の3時間前に天気チェック
  // 天気API
  CHECK_INTERVAL_MIN: 30,        // 30分ごとに天気更新
} as const;

// --- Referral Program (紹介プログラム) ---
export const REFERRAL = {
  REFERRER_REWARD: 500,          // 紹介者: 500pt
  REFEREE_REWARD: 500,           // 被紹介者: 500pt
  REFEREE_COUPON: {
    TYPE: 'fixed' as const,
    VALUE: 1000,                  // ¥1,000OFF初回クーポン
    VALID_DAYS: 30,
  },
  MAX_REFERRALS_PER_USER: 50,    // 1人最大50人まで
  CODE_LENGTH: 8,                // 紹介コード8文字
} as const;

// --- Favorite Pro (お気に入りプロ + 指名料) ---
export const FAVORITE_PRO = {
  NOMINATION_FEE: 500,           // 指名料 ¥500
  MAX_FAVORITES: 10,             // 最大10人まで
} as const;

// --- Corporate Account (法人アカウント) ---
export const CORPORATE = {
  MIN_VEHICLES: 3,               // 法人は最低3台から
  DISCOUNT_TIERS: [
    { minVehicles: 3, discount: 5, label: '5%OFF' },
    { minVehicles: 10, discount: 10, label: '10%OFF' },
    { minVehicles: 30, discount: 15, label: '15%OFF' },
    { minVehicles: 50, discount: 20, label: '20%OFF' },
  ],
  BILLING_CYCLES: ['monthly', 'quarterly'] as const,
  INVOICE_DUE_DAYS: 30,
} as const;

// --- Group Booking (グループ予約) ---
export const GROUP_BOOKING = {
  MIN_VEHICLES: 2,
  MAX_VEHICLES: 20,
  // グループ割引
  DISCOUNTS: [
    { minCount: 2, discount: 5, label: '2台以上 5%OFF' },
    { minCount: 5, discount: 10, label: '5台以上 10%OFF' },
    { minCount: 10, discount: 15, label: '10台以上 15%OFF' },
  ],
} as const;

// --- Pro Skill Badges (スキルバッジ) ---
export const SKILL_BADGES = {
  BADGES: [
    { id: 'coating_master', name: 'コーティングマスター', icon: 'shield-checkmark', color: '#F59E0B', requirement: 'コーティング50件以上' },
    { id: 'speed_pro', name: 'スピードプロ', icon: 'flash', color: '#3B82F6', requirement: '平均作業時間が上位10%' },
    { id: 'five_star', name: '★5常連', icon: 'star', color: '#FFD700', requirement: '直近50件の平均★4.8以上' },
    { id: 'repeat_magnet', name: 'リピートマグネット', icon: 'heart', color: '#EC4899', requirement: 'リピート率60%以上' },
    { id: 'early_bird', name: 'アーリーバード', icon: 'sunny', color: '#F97316', requirement: '早朝予約の完了100件以上' },
    { id: 'veteran', name: 'ベテラン', icon: 'trophy', color: '#8B5CF6', requirement: '累計施工500件以上' },
  ],
} as const;

export type SkillBadgeId = (typeof SKILL_BADGES.BADGES)[number]['id'];

// --- Area Expansion Request (エリア拡大リクエスト) ---
export const AREA_REQUEST = {
  THRESHOLD_TO_NOTIFY_ADMIN: 10, // 同エリア10件以上で管理者通知
  REQUEST_COOLDOWN_DAYS: 30,     // 同ユーザーから同エリアへの再リクエストは30日後
} as const;

// --- i18n (多言語) ---
export const I18N = {
  DEFAULT_LOCALE: 'ja',
  SUPPORTED_LOCALES: ['ja', 'en'] as const,
} as const;

export type Locale = (typeof I18N.SUPPORTED_LOCALES)[number];
