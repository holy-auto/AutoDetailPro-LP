export default function Media() {
  return (
    <section
      aria-label="メディア掲載・取材依頼"
      className="py-16 sm:py-20 bg-[#f7fbff] border-y border-[#e4eef7]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="section-label mb-3 inline-flex">Press &amp; Media</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
              取材・掲載のお問い合わせ
            </h2>
            <p className="text-[14px] text-[#5a7090] leading-relaxed">
              MobileWash は2026年Q3の正式ローンチに向けて準備中です。
              取材・記事掲載・出演依頼については、広報担当までお気軽にご連絡ください。
              ロゴ・サービス画像などのプレス素材もご用意しています。
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="#"
                className="soft-card bg-white p-5 flex items-start gap-3 hover:border-[#cfdfee]"
              >
                <span className="shrink-0 w-10 h-10 bg-[#e6f4ff] text-[#0099e6] rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0a2540] mb-0.5">
                    広報・取材のお問い合わせ
                  </p>
                  <p className="text-[12px] text-[#5a7090]">
                    取材・掲載・出演に関するご相談
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="soft-card bg-white p-5 flex items-start gap-3 hover:border-[#cfdfee]"
              >
                <span className="shrink-0 w-10 h-10 bg-[#e6fbf7] text-[#0a8f7c] rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0a2540] mb-0.5">
                    プレス素材ダウンロード
                  </p>
                  <p className="text-[12px] text-[#5a7090]">
                    ロゴ・サービス画像・会社概要
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="soft-card bg-white p-5 flex items-start gap-3 hover:border-[#cfdfee]"
              >
                <span className="shrink-0 w-10 h-10 bg-[#fff4e6] text-[#b36b00] rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0a2540] mb-0.5">
                    プレスリリース一覧
                  </p>
                  <p className="text-[12px] text-[#5a7090]">
                    最新のお知らせ・発表
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="soft-card bg-white p-5 flex items-start gap-3 hover:border-[#cfdfee]"
              >
                <span className="shrink-0 w-10 h-10 bg-[#f0e6ff] text-[#6b46c1] rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-bold text-[#0a2540] mb-0.5">
                    ブランド・利用ガイド
                  </p>
                  <p className="text-[12px] text-[#5a7090]">
                    ブランドガイドラインと使用例
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
