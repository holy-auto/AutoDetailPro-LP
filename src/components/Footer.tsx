export default function Footer() {
  return (
    <footer className="bg-[#0a2540] text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="logo-mark w-12 h-12 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h.5a1.5 1.5 0 011.5 1.5V17a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.5A1.5 1.5 0 014.5 11H5zm2.2 0h9.6L15.6 7.3a.5.5 0 00-.5-.3H8.9a.5.5 0 00-.5.3L7.2 11zM7 14a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-base leading-none">
                  MobileWash
                </p>
                <p className="text-white/40 font-bold text-[10px] tracking-widest mt-1">
                  MOBILE CAR WASH &amp; COATING
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-xs">
              出張洗車・出張コーティングのプロを、あなたの元へ。
              スマホひとつで、車のお手入れを変えていきます。
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-[#00b4ff] text-[#0a2540] font-black px-5 py-3 rounded-full text-sm hover:bg-white transition-colors"
            >
              アプリをダウンロード
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#00b4ff] font-black text-xs tracking-widest uppercase mb-5">
              SERVICE
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#services" className="text-white/70 hover:text-[#00b4ff] transition-colors">出張洗車</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#00b4ff] transition-colors">出張コーティング</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#00b4ff] transition-colors">内装クリーニング</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#00b4ff] transition-colors">ポリッシュ磨き</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#00b4ff] transition-colors">フルディテイリング</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#00b4ff] font-black text-xs tracking-widest uppercase mb-5">
              PLAN
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#plans" className="text-white/70 hover:text-[#00b4ff] transition-colors">都度払い</a></li>
              <li><a href="#plans" className="text-white/70 hover:text-[#00b4ff] transition-colors">定額ライト</a></li>
              <li><a href="#plans" className="text-white/70 hover:text-[#00b4ff] transition-colors">定額プレミアム</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">法人プラン</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#00b4ff] font-black text-xs tracking-widest uppercase mb-5">
              SUPPORT
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#faq" className="text-white/70 hover:text-[#00b4ff] transition-colors">よくある質問</a></li>
              <li><a href="#areas" className="text-white/70 hover:text-[#00b4ff] transition-colors">対応エリア</a></li>
              <li><a href="#pro-recruit" className="text-white/70 hover:text-[#00b4ff] transition-colors">プロ募集</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">お問い合わせ</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#00b4ff] font-black text-xs tracking-widest uppercase mb-5">
              COMPANY
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">会社概要</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">採用情報</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">プレスリリース</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">利用規約</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">プライバシーポリシー</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#00b4ff] transition-colors">特定商取引法</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-white/50">
            &copy; 2026 MobileWash. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/50">
            <span>Made in Japan</span>
            <span>全国対応エリア拡大中</span>
          </div>
        </div>
      </div>

      <div className="diagonal-stripe h-3 w-full" />
    </footer>
  );
}
