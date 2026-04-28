const footerNav = [
  {
    heading: "サービス",
    links: [
      { label: "出張手洗い洗車", href: "#services" },
      { label: "出張ガラスコーティング", href: "#services" },
      { label: "出張内装クリーニング", href: "#services" },
      { label: "出張ポリッシュ磨き", href: "#services" },
      { label: "フルディテイリング", href: "#services" },
      { label: "エンジンルーム洗浄", href: "#services" },
    ],
  },
  {
    heading: "料金プラン",
    links: [
      { label: "都度払い", href: "#plans" },
      { label: "定額ライト", href: "#plans" },
      { label: "定額プレミアム", href: "#plans" },
      { label: "法人プラン", href: "#" },
      { label: "ギフト・クーポン", href: "#" },
    ],
  },
  {
    heading: "サポート",
    links: [
      { label: "ご利用ガイド", href: "#how-it-works" },
      { label: "対応エリア", href: "#areas" },
      { label: "よくある質問", href: "#faq" },
      { label: "お問い合わせ", href: "#" },
      { label: "ヘルプセンター", href: "#" },
    ],
  },
  {
    heading: "プロの方へ",
    links: [
      { label: "プロ登録", href: "#pro-recruit" },
      { label: "プロ向けFAQ", href: "#" },
      { label: "プロ向けマニュアル", href: "#" },
      { label: "プロ向けニュース", href: "#" },
    ],
  },
  {
    heading: "会社情報",
    links: [
      { label: "会社概要", href: "#" },
      { label: "ニュース", href: "#" },
      { label: "プレスリリース", href: "#" },
      { label: "採用情報", href: "#" },
      { label: "ブランド素材", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a2540] text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 lg:pt-20 pb-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="logo-mark w-11 h-11 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h.5a1.5 1.5 0 011.5 1.5V17a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.5A1.5 1.5 0 014.5 11H5zm2.2 0h9.6L15.6 7.3a.5.5 0 00-.5-.3H8.9a.5.5 0 00-.5.3L7.2 11zM7 14a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-[17px] leading-tight">
                  MobileWash
                </p>
                <p className="text-white/40 text-[10px] tracking-widest mt-0.5">
                  MOBILE CAR WASH &amp; COATING
                </p>
              </div>
            </div>
            <p className="text-[13px] text-white/65 leading-relaxed mb-6 max-w-xs">
              出張洗車・出張コーティングのプロを、あなたの元へ。
              スマホひとつで、車のお手入れを変えていきます。
            </p>

            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-white text-[#0a2540] font-bold px-5 py-3 rounded-full text-[13px] hover:bg-[#e6f4ff] transition-colors mb-8"
            >
              アプリをダウンロード
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <div>
              <p className="text-[11px] text-white/40 font-bold tracking-widest mb-3">
                FOLLOW US
              </p>
              <div className="flex gap-2">
                {[
                  { label: "X", href: "#" },
                  { label: "IG", href: "#" },
                  { label: "FB", href: "#" },
                  { label: "YT", href: "#" },
                  { label: "in", href: "#" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white transition-colors"
                    aria-label={s.label}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
              {footerNav.map((col) => (
                <div key={col.heading}>
                  <h4 className="text-white font-bold text-[13px] mb-4">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[12px] text-white/55 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/45">
            <a href="#" className="hover:text-white transition-colors">利用規約</a>
            <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
            <a href="#" className="hover:text-white transition-colors">情報セキュリティ方針</a>
            <a href="#" className="hover:text-white transition-colors">サイトマップ</a>
          </div>
          <p className="text-[11px] text-white/40">
            &copy; 2026 MobileWash, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
