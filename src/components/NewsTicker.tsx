const news = [
  { date: "2026.04.21", tag: "プレス", text: "シリーズA資金調達を実施。全国47都道府県への展開を加速します。" },
  { date: "2026.04.10", tag: "サービス", text: "出張ガラスコーティングの新メニューをリリースしました。" },
  { date: "2026.03.18", tag: "メディア", text: "「日経クロストレンド」にてサービスが紹介されました。" },
  { date: "2026.03.05", tag: "お知らせ", text: "対応エリアに名古屋市・京都市を追加しました。" },
];

const tagColor: Record<string, string> = {
  プレス: "bg-[#e6f4ff] text-[#0077b3]",
  サービス: "bg-[#e6fbf7] text-[#0a8f7c]",
  メディア: "bg-[#fff4e6] text-[#b36b00]",
  お知らせ: "bg-[#f0f0f5] text-[#4a5568]",
};

export default function NewsTicker() {
  return (
    <section
      aria-label="お知らせ"
      className="relative pt-[108px] lg:pt-[122px] pb-0 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-3 border-b border-[#e4eef7]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#0099e6]">
              NEWS
            </span>
            <span className="text-[11px] text-[#8ba0ba]">お知らせ</span>
          </div>
          <ul className="flex-1 overflow-hidden">
            <li className="flex items-center gap-3 text-[13px]">
              <time className="text-[#5a7090] shrink-0 tabular-nums">
                {news[0].date}
              </time>
              <span
                className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor[news[0].tag]}`}
              >
                {news[0].tag}
              </span>
              <a href="#" className="text-[#1a3658] hover:text-[#0099e6] transition-colors truncate">
                {news[0].text}
              </a>
            </li>
          </ul>
          <a
            href="#"
            className="text-[12px] text-[#0099e6] font-bold hover:underline shrink-0 inline-flex items-center gap-1"
          >
            お知らせ一覧
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
