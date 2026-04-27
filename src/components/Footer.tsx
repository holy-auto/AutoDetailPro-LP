export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-[#ffd900] flex items-center justify-center">
                <span className="text-[#0a0a0a] font-black text-base tracking-tighter">ADP</span>
              </div>
              <span className="text-white font-black text-lg">Auto Detail Pro</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-xs">
              プロのカーディテイリングを、あなたの元へ。
              出張型カーケアサービスのスタンダードを目指して。
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-[#ffd900] text-[#0a0a0a] font-black px-5 py-3 text-sm hover:bg-white transition-colors"
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
            <h4 className="text-[#ffd900] font-black text-xs tracking-widest uppercase mb-5">
              SERVICE
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">外装洗車</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">内装クリーニング</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">コーティング</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">フルディテイル</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#ffd900] font-black text-xs tracking-widest uppercase mb-5">
              COMPANY
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">会社概要</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">採用情報</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">プレス</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">お問い合わせ</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#ffd900] font-black text-xs tracking-widest uppercase mb-5">
              SUPPORT
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">よくあるご質問</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">対応エリア</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">プロ募集</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[#ffd900] font-black text-xs tracking-widest uppercase mb-5">
              LEGAL
            </h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">利用規約</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">プライバシーポリシー</a></li>
              <li><a href="#" className="text-white/70 hover:text-[#ffd900] transition-colors">特定商取引法</a></li>
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
