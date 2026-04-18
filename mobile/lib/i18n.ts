import { NativeModules, Platform } from 'react-native';
import { I18N, type Locale } from '@/constants/business-rules';

// =============================================
// i18n (多言語対応) — Simple translation system
// =============================================
// No external library. Module-level locale variable,
// translation lookup, and currency formatting.

// --- Device locale auto-detection ---

function detectLocale(): Locale {
  try {
    let raw: string | undefined;
    if (Platform.OS === 'ios') {
      const s = NativeModules.SettingsManager?.settings;
      raw = s?.AppleLocale ?? s?.AppleLanguages?.[0];
    } else {
      raw = NativeModules.I18nManager?.localeIdentifier;
    }
    const lang = raw?.split(/[-_]/)[0]?.toLowerCase();
    if ((I18N.SUPPORTED_LOCALES as readonly string[]).includes(lang ?? '')) {
      return lang as Locale;
    }
  } catch {}
  return I18N.DEFAULT_LOCALE;
}

// --- Current locale (module-level state) ---

let currentLocale: Locale = detectLocale();

// --- Translations ---

export const translations: Record<Locale, Record<string, string>> = {
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.search': '検索',
    'nav.booking': '予約',
    'nav.mypage': 'マイページ',
    'nav.notifications': 'お知らせ',
    'nav.settings': '設定',
    'nav.chat': 'チャット',
    'nav.favorites': 'お気に入り',

    // Actions
    'action.book': '予約する',
    'action.cancel': 'キャンセル',
    'action.submit': '送信',
    'action.close': '閉じる',
    'action.confirm': '確認する',
    'action.save': '保存',
    'action.delete': '削除',
    'action.edit': '編集',
    'action.back': '戻る',
    'action.next': '次へ',
    'action.done': '完了',
    'action.retry': '再試行',
    'action.login': 'ログイン',
    'action.logout': 'ログアウト',
    'action.signup': '新規登録',
    'action.search': '検索する',

    // Order statuses
    'status.draft': 'メニュー選択中',
    'status.payment_authorized': '決済完了',
    'status.requested': 'プロ検索中',
    'status.accepted': 'プロ承認済み',
    'status.on_the_way': 'プロ移動中',
    'status.arrived': 'プロ到着',
    'status.in_progress': '作業中',
    'status.completed': '完了',
    'status.cancelled': 'キャンセル',
    'status.dispute_open': 'クレーム審査中',

    // Review labels
    'review.title': 'レビュー',
    'review.write': 'レビューを書く',
    'review.rating': '評価',
    'review.comment': 'コメント',
    'review.submit': 'レビューを投稿',
    'review.average': '平均評価',
    'review.count': '件のレビュー',

    // Common messages
    'msg.loading': '読み込み中...',
    'msg.error': 'エラーが発生しました',
    'msg.success': '完了しました',
    'msg.no_results': '結果が見つかりませんでした',
    'msg.confirm_cancel': 'キャンセルしてもよろしいですか？',
    'msg.network_error': 'ネットワークエラーが発生しました',
    'msg.session_expired': 'セッションが期限切れです。再ログインしてください',
    'msg.required_field': 'この項目は必須です',
    'msg.saved': '保存しました',
    'msg.deleted': '削除しました',
  },

  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.booking': 'Booking',
    'nav.mypage': 'My Page',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.chat': 'Chat',
    'nav.favorites': 'Favorites',

    // Actions
    'action.book': 'Book Now',
    'action.cancel': 'Cancel',
    'action.submit': 'Submit',
    'action.close': 'Close',
    'action.confirm': 'Confirm',
    'action.save': 'Save',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.done': 'Done',
    'action.retry': 'Retry',
    'action.login': 'Log In',
    'action.logout': 'Log Out',
    'action.signup': 'Sign Up',
    'action.search': 'Search',

    // Order statuses
    'status.draft': 'Selecting Menu',
    'status.payment_authorized': 'Payment Authorized',
    'status.requested': 'Searching for Pro',
    'status.accepted': 'Pro Accepted',
    'status.on_the_way': 'Pro On the Way',
    'status.arrived': 'Pro Arrived',
    'status.in_progress': 'In Progress',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'status.dispute_open': 'Dispute Under Review',

    // Review labels
    'review.title': 'Reviews',
    'review.write': 'Write a Review',
    'review.rating': 'Rating',
    'review.comment': 'Comment',
    'review.submit': 'Submit Review',
    'review.average': 'Average Rating',
    'review.count': 'reviews',

    // Common messages
    'msg.loading': 'Loading...',
    'msg.error': 'An error occurred',
    'msg.success': 'Completed successfully',
    'msg.no_results': 'No results found',
    'msg.confirm_cancel': 'Are you sure you want to cancel?',
    'msg.network_error': 'A network error occurred',
    'msg.session_expired': 'Session expired. Please log in again.',
    'msg.required_field': 'This field is required',
    'msg.saved': 'Saved',
    'msg.deleted': 'Deleted',
  },
};

// --- Public API ---

/**
 * Get the translated string for the given key using the current locale.
 * Returns the key itself if no translation is found.
 */
export function t(key: string): string {
  return translations[currentLocale]?.[key] ?? translations.ja[key] ?? key;
}

/**
 * Set the active locale.
 */
export function setLocale(locale: Locale): void {
  if (I18N.SUPPORTED_LOCALES.includes(locale)) {
    currentLocale = locale;
  }
}

/**
 * Get the currently active locale.
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Format a numeric amount as currency based on locale.
 * - 'ja' → ¥3,000
 * - 'en' → $30.00
 */
export function formatCurrency(amount: number, locale?: Locale): string {
  const loc = locale ?? currentLocale;

  if (loc === 'en') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Default: Japanese Yen
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount);
}
