export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#ffd500] rounded-full flex items-center justify-center">
                <span className="text-black font-black text-sm tracking-tighter">ADP</span>
              </div>
              <div>
                <p className="text-white font-black text-base leading-none">
                  Auto Detail Pro
                </p>
                <p className="text-white/40 font-bold text-[10px] tracking-widest mt-1">
                  MOBILE CAR DETAILING
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-xs">
              出張洗車・出張コーティングのプロを、あなたの元へ。
              スマホひとつで、車のお手入れを変えていきます。
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-[#ffd500] text-black font-black px-5 py-3 rounded-full text-sm hover:bg-white transition-colors"
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
            <h4 className="text-[#ffd500] font-black text-xs tracking-widest uppercase mb-5">
              SERVICE
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#services" className="text-white/70 hover:text-[#ffd500] transition-colors">出張洗車</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#ffd500] transition-colors">出張コーティング</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#ffd500] transition-colors">内装クリーニング</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#ffd500] transition-colors">ポリッシュ磨き</a></li>
              <li><a href="#services" className="text-white/70 hover:text-[#ffd500] transition-colors">フルディテイリング</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#ffd500] font-black text-xs tracking-widest uppercase mb-5">
              PLAN
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#plans" className="text-white/70 hover:text-[#ffd500] transition-colors">都度払い</a></li>
              <li><a href="#plans" className="text-white/70 hover:text-[#ffd500] transition-colors">定額ライト</a></li>
              <li><a href="#plans" className="text-white/70 hover:text-[#ffd500] transition-colors">定額プレミアム</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">法人プラン</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#ffd500] font-black text-xs tracking-widest uppercase mb-5">
              SUPPORT
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#faq" className="text-white/70 hover:text-[#ffd500] transition-colors">よくある質問</a></li>
              <li><a href="#areas" className="text-white/70 hover:text-[#ffd500] transition-colors">対応エリア</a></li>
              <li><a href="#pro-recruit" className="text-white/70 hover:text-[#ffd500] transition-colors">プロ募集</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">お問い合わせ</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#ffd500] font-black text-xs tracking-widest uppercase mb-5">
              COMPANY
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">会社概要</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">採用情報</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">プレスリリース</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">利用規約</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">プライバシーポリシー</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd500] transition-colors">特定商取引法</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-white/50">
            &copy; 2026 Auto Detail Pro. All rights reserved.
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
