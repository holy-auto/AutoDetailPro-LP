export default function Hero() {
  return (
    <section className="relative pt-24 lg:pt-28 pb-0 overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#ffd900] rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-[#ffd900] rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center pb-16 lg:pb-24">
          <div className="lg:col-span-7 text-white">
            <div className="inline-flex items-center gap-2 bg-[#ffd900] text-[#0a0a0a] text-xs sm:text-sm font-black px-3 py-1.5 mb-8 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full animate-pulse" />
              出張カーディテイリングNo.1
            </div>
            <h1 className="heading-tight text-5xl sm:text-6xl lg:text-[80px] xl:text-[96px] font-black mb-8">
              プロが、
              <br />
              <span className="relative inline-block">
                今すぐ
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#ffd900] -z-0 opacity-90" />
                <span className="relative">出張</span>
              </span>
              。
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              GPSで近くのプロを呼ぶ、出張カーディテイリングアプリ。
              <br className="hidden sm:inline" />
              洗車・コーティング・内装、スマホひとつで最短5分。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <a
                href="#cta"
                className="group inline-flex items-center justify-center gap-2 bg-[#ffd900] text-[#0a0a0a] font-black px-8 py-4 text-base hover:bg-white transition-colors"
              >
                アプリを無料ダウンロード
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-bold px-8 py-4 text-base border border-white/30 hover:bg-white/10 transition-colors"
              >
                使い方を見る
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 lg:gap-10 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl lg:text-4xl font-black text-[#ffd900]">10,000+</p>
                <p className="text-xs text-white/60 mt-1">累計予約数</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-black text-[#ffd900]">4.8</p>
                <p className="text-xs text-white/60 mt-1">平均評価 ★</p>
              </div>
              <div>
                <p className="text-3xl lg:text-4xl font-black text-[#ffd900]">5<span className="text-xl">分</span></p>
                <p className="text-xs text-white/60 mt-1">最短到着時間</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 bg-[#ffd900] -rotate-3" />
              <div className="relative w-[280px] h-[560px] bg-[#0a0a0a] rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden relative">
                  <div className="bg-[#0a0a0a] px-4 py-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#ffd900] flex items-center justify-center">
                      <span className="text-[#0a0a0a] font-black text-[10px] tracking-tighter">ADP</span>
                    </div>
                    <span className="text-white font-black text-sm">Auto Detail Pro</span>
                  </div>

                  <div className="bg-[#0a0a0a] px-4 pt-2 pb-6">
                    <span className="text-[10px] text-[#0a0a0a] bg-[#ffd900] px-2 py-0.5 font-black">
                      GPSで近くのプロを検索
                    </span>
                    <p className="text-white font-black text-xl mt-3 leading-tight">プロが、</p>
                    <p className="text-[#ffd900] font-black text-xl leading-tight">今すぐ出張。</p>
                  </div>

                  <div className="px-3 -mt-3">
                    <div className="bg-white rounded-xl shadow-md border border-black/5 p-3 mb-3">
                      <p className="text-[10px] text-gray-500 mb-1.5 font-bold">サービスカテゴリ</p>
                      <div className="flex gap-2 justify-between">
                        {["外装", "内装", "コート", "磨き"].map((s) => (
                          <div key={s} className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-9 h-9 bg-[#ffd900] flex items-center justify-center">
                              <div className="w-3 h-3 bg-[#0a0a0a] rounded-full" />
                            </div>
                            <span className="text-[8px] text-gray-700 font-bold">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 mb-2 font-bold">近くのオンラインプロ</p>
                    {[
                      { name: "田中 健太", rating: "4.9", time: "5分" },
                      { name: "鈴木 大輔", rating: "4.7", time: "7分" },
                    ].map((pro) => (
                      <div
                        key={pro.name}
                        className="bg-white border border-black/10 p-2.5 mb-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#0a0a0a]">{pro.name}</p>
                            <p className="text-[9px] text-yellow-600 font-bold">★ {pro.rating}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-[#0a0a0a] font-black bg-[#ffd900] px-2 py-1">
                          約{pro.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/10 flex justify-around py-2">
                    {["ホーム", "検索", "♥", "予約"].map((item) => (
                      <span key={item} className="text-[9px] text-gray-500 font-bold">{item}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-8 bg-white text-[#0a0a0a] px-4 py-3 shadow-xl">
                <p className="text-[10px] font-bold text-gray-500">ダウンロード</p>
                <p className="text-2xl font-black leading-none">無料</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#ffd900] overflow-hidden border-y-2 border-[#0a0a0a]">
        <div className="marquee-track py-4 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-10 pr-10 text-[#0a0a0a] font-black text-lg uppercase tracking-wider">
              <span>★ 出張カーディテイリング</span>
              <span>★ 最短5分で到着</span>
              <span>★ 認定プロのみ</span>
              <span>★ アプリで簡単予約</span>
              <span>★ 全国対応エリア拡大中</span>
              <span>★ GPSで近くのプロを検索</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
