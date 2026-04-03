export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-blue-800">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              GPSで近くのプロを検索
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              今すぐプロを
              <br />
              <span className="text-blue-200">呼びましょう</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-lg mx-auto lg:mx-0">
              カーディテイリングのプロがあなたの元へ出張。
              外装洗車からフルディテイルまで、スマホひとつで簡単予約。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#cta"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors text-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                App Store
              </a>
              <a
                href="#cta"
                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/25 transition-colors text-lg border border-white/30"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.585 1.497a1 1 0 010 1.732l-2.585 1.497-2.537-2.537 2.537-2.19zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                Google Play
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-[280px] h-[560px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden relative">
                  <div className="bg-primary px-4 py-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-sm">Auto Detail Pro</span>
                  </div>

                  <div className="bg-primary px-4 pt-2 pb-6">
                    <span className="text-[10px] text-blue-200 bg-white/15 px-2 py-0.5 rounded-full">
                      GPS で近くのプロを検索
                    </span>
                    <p className="text-white font-bold text-lg mt-2">今すぐプロを</p>
                    <p className="text-white font-bold text-lg">呼びましょう</p>
                  </div>

                  <div className="px-3 -mt-3">
                    <div className="bg-white rounded-xl shadow-md p-3 mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">サービスカテゴリ</p>
                      <div className="flex gap-2">
                        {["外装洗車", "内装", "コーティング", "磨き"].map((s) => (
                          <div key={s} className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <div className="w-3 h-3 bg-primary rounded-full" />
                            </div>
                            <span className="text-[8px] text-gray-600">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 mb-2">近くのオンラインプロ</p>
                    {[
                      { name: "田中 健太", rating: "4.9", time: "約5分" },
                      { name: "鈴木 大輔", rating: "4.7", time: "約7分" },
                    ].map((pro) => (
                      <div
                        key={pro.name}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5 mb-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-gray-800">{pro.name}</p>
                            <p className="text-[9px] text-yellow-500">★ {pro.rating}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-primary font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                          {pro.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2">
                    {["ホーム", "検索", "♥", "予約"].map((item) => (
                      <span key={item} className="text-[9px] text-gray-400">{item}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-2xl rotate-12 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm text-center leading-tight -rotate-12">
                  無料
                  <br />
                  DL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
