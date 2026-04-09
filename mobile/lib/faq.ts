// =============================================
// FAQ データ & 検索 (FAQ Data & Search)
// =============================================
// Static FAQ content with category filtering and
// simple text-based search across questions and answers.

// --- Types ---

type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

type FAQCategory = {
  id: string;
  name: string;
  icon: string;
};

// --- Categories ---

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'usage', name: '利用方法', icon: 'help-circle' },
  { id: 'pricing', name: '料金', icon: 'cash' },
  { id: 'cancellation', name: 'キャンセル', icon: 'close-circle' },
  { id: 'payment', name: '支払い', icon: 'card' },
  { id: 'pro', name: 'プロについて', icon: 'person' },
  { id: 'trouble', name: 'トラブル', icon: 'warning' },
];

// --- FAQ Data ---

export const FAQ_DATA: FAQItem[] = [
  // 利用方法 (usage)
  {
    id: 'usage-1',
    category: 'usage',
    question: 'サービスの利用方法を教えてください',
    answer: 'アプリを開き、車両サイズとメニューを選択して予約してください。近くのプロが自動でマッチングされ、ご指定の場所まで出張いたします。',
  },
  {
    id: 'usage-2',
    category: 'usage',
    question: '予約から施工完了までの流れは？',
    answer: 'メニュー選択 → 決済 → プロ検索 → プロ承認 → プロ移動 → 到着 → 作業 → 完了確認 → レビュー の流れになります。各ステップはアプリ内でリアルタイムに確認できます。',
  },
  {
    id: 'usage-3',
    category: 'usage',
    question: '対応エリアはどこですか？',
    answer: '現在、主要都市を中心にサービスを展開しています。対応エリア外の場合は、エリア拡大リクエストを送っていただけます。リクエストが一定数に達すると、サービスエリアの拡大を検討いたします。',
  },
  {
    id: 'usage-4',
    category: 'usage',
    question: '営業時間は何時から何時ですか？',
    answer: '営業時間は8:00〜20:00です（日本時間）。営業時間外のご予約は翌営業日の対応となります。',
  },

  // 料金 (pricing)
  {
    id: 'pricing-1',
    category: 'pricing',
    question: '料金体系について教えてください',
    answer: '料金はメニュー（外装洗車、内装クリーニング、コーティング等）と車両サイズ、汚れ具合により決まります。見積もり画面で事前に確認できます。',
  },
  {
    id: 'pricing-2',
    category: 'pricing',
    question: '追加料金は発生しますか？',
    answer: '事前に表示された見積もり金額以上の請求はありません。ただし、プロ到着後に追加メニューをご依頼いただいた場合は別途料金が発生します。',
  },
  {
    id: 'pricing-3',
    category: 'pricing',
    question: '車のサイズで料金は変わりますか？',
    answer: 'はい。軽自動車は基本料金の80%、SUVは130%、ミニバンは140%など、車両サイズによって価格が変動します。',
  },
  {
    id: 'pricing-4',
    category: 'pricing',
    question: '定期利用の割引はありますか？',
    answer: 'はい。週1回コースで15%OFF、隔週コースで10%OFF、月1回コースで5%OFFの定期プランをご用意しています。',
  },

  // キャンセル (cancellation)
  {
    id: 'cancel-1',
    category: 'cancellation',
    question: 'キャンセルはできますか？',
    answer: 'はい。プロ承認前であれば無料でキャンセルできます。承認後〜到着前は30〜50%、到着後は100%のキャンセル料が発生します。',
  },
  {
    id: 'cancel-2',
    category: 'cancellation',
    question: 'キャンセル料はいつ発生しますか？',
    answer: 'プロが予約を承認した後にキャンセルするとキャンセル料が発生します。プロ検索中（承認前）のキャンセルは無料です。',
  },
  {
    id: 'cancel-3',
    category: 'cancellation',
    question: '雨天の場合はどうなりますか？',
    answer: '雨予報が出た場合、予約の3時間前にアプリからキャンセルの提案が届きます。天候によるキャンセルは無料で対応いたします。',
  },

  // 支払い (payment)
  {
    id: 'payment-1',
    category: 'payment',
    question: '支払い方法は何がありますか？',
    answer: 'クレジットカード（Visa, Mastercard, JCB, AMEX）とApple Pay、Google Payに対応しています。現金払いも一部のプロで利用可能です。',
  },
  {
    id: 'payment-2',
    category: 'payment',
    question: '領収書は発行できますか？',
    answer: 'はい。注文完了後にアプリ内の注文履歴から領収書をPDFでダウンロードできます。',
  },
  {
    id: 'payment-3',
    category: 'payment',
    question: 'ポイントは使えますか？',
    answer: 'はい。ご利用金額の1%がポイントとして貯まり、100ポイント＝100円として次回以降のお支払いに使えます。レビュー投稿でもボーナスポイントが付与されます。',
  },
  {
    id: 'payment-4',
    category: 'payment',
    question: 'クーポンの使い方を教えてください',
    answer: '予約画面の「クーポンを適用」ボタンからクーポンコードを入力してください。割引が自動で適用されます。',
  },

  // プロについて (pro)
  {
    id: 'pro-1',
    category: 'pro',
    question: 'プロはどのように選ばれますか？',
    answer: '評価、距離、応答率、完了率などを総合的にスコアリングし、最適なプロを自動マッチングします。お気に入りのプロを指名することも可能です（指名料¥500）。',
  },
  {
    id: 'pro-2',
    category: 'pro',
    question: 'プロの評価はどのように確認できますか？',
    answer: 'プロのプロフィール画面から評価（★1〜5）、レビュー件数、スキルバッジ、施工実績をご確認いただけます。',
  },
  {
    id: 'pro-3',
    category: 'pro',
    question: 'プロの身元確認はされていますか？',
    answer: 'はい。すべてのプロは本人確認書類（運転免許証・マイナンバーカード等）による身元確認を完了しています。',
  },

  // トラブル (trouble)
  {
    id: 'trouble-1',
    category: 'trouble',
    question: '施工に不満がある場合はどうすればいいですか？',
    answer: '施工完了後24時間以内に、注文詳細画面からクレームを申請してください。品質不満の場合は10〜50%の返金、作業未実施の場合は全額返金で対応いたします。',
  },
  {
    id: 'trouble-2',
    category: 'trouble',
    question: '車にキズがついた場合は？',
    answer: '施工前後の写真を証拠として、クレームを申請してください。審査の上、適切な補償を行います。プロは全員損害保険に加入しています。',
  },
  {
    id: 'trouble-3',
    category: 'trouble',
    question: 'プロが時間通りに来ません',
    answer: 'アプリ内のGPS追跡でプロの現在地と到着予定時刻を確認できます。大幅に遅れる場合はチャットでプロに直接連絡するか、カスタマーサポートまでお問い合わせください。',
  },
  {
    id: 'trouble-4',
    category: 'trouble',
    question: 'アカウントにログインできません',
    answer: 'ログイン画面の「パスワードを忘れた場合」から再設定できます。それでも解決しない場合は、カスタマーサポート（アプリ内の「お問い合わせ」）までご連絡ください。',
  },
];

// --- Search ---

/**
 * Simple text search matching question and answer fields.
 * Returns FAQ items where the query appears in question or answer (case-insensitive).
 */
export function searchFAQ(query: string): FAQItem[] {
  if (!query || query.trim().length === 0) return [];

  const normalised = query.trim().toLowerCase();

  return FAQ_DATA.filter(
    (item) =>
      item.question.toLowerCase().includes(normalised) ||
      item.answer.toLowerCase().includes(normalised),
  );
}

// --- Filter by category ---

/**
 * Return all FAQ items belonging to the given category.
 */
export function getFAQsByCategory(categoryId: string): FAQItem[] {
  return FAQ_DATA.filter((item) => item.category === categoryId);
}
