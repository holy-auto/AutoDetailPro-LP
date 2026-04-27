export default function Hero() {
  return (
    <section className="relative pt-24 lg:pt-28 pb-0 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#ffd500] rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-[#ffd500] rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 lg:pt-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center pb-16 lg:pb-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-[#ffd500] text-black text-xs sm:text-sm font-black px-4 py-1.5 rounded-full mb-8 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
              出張カーディテイリング No.1 アプリ
            </div>
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#ffd500] uppercase mb-4">
              MOBILE CAR WASH &amp; COATING
            </p>
            <h1 className="heading-tight text-display text-[56px] sm:text-7xl lg:text-[88px] xl:text-[112px] font-black mb-8">
              洗車を、
              <br />
              <span className="relative inline-block">
                呼ぶ時代
                <span className="absolute -bottom-1 left-0 right-0 h-3 sm:h-4 bg-[#ffd500] -z-0 opacity-90" />
                <span className="relative">。</span>
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              出張洗車・出張コーティングのプロが、あなたの駐車場まで出張。
              <br className="hidden sm:inline" />
              タップひとつ、最短5分でプロが到着。手洗い・内装・コーティングをまとめて。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <a
                href="#cta"
                className="group inline-flex items-center justify-center gap-2 bg-[#ffd500] text-black font-black px-8 py-4 rounded-full text-base hover:bg-white transition-colors"
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
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-bold px-8 py-4 rounded-full text-base border border-white/30 hover:bg-white/10 transition-colors"
              >
                使い方を見る
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 lg:gap-10 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl lg:text-4xl font-black text-[#ffd500] leading-none">
                  10,000<span className="text-base">+</span>
                </p>
                <p className="text-[11px] text-white/60 mt-2 font-bold tracking-wider">
                  累計予約数
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl lg:text-4xl font-black text-[#ffd500] leading-none">
                  4.8<span className="text-base">★</span>
                </p>
                <p className="text-[11px] text-white/60 mt-2 font-bold tracking-wider">
                  平均評価
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl lg:text-4xl font-black text-[#ffd500] leading-none">
                  5<span className="text-base">分〜</span>
                </p>
                <p className="text-[11px] text-white/60 mt-2 font-bold tracking-wider">
                  最短到着
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 bg-[#ffd500] -rotate-3 rounded-3xl" />
              <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden relative">
                  <div className="bg-black px-4 py-3 flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#ffd500] rounded-full flex items-center justify-center">
                      <span className="text-black font-black text-[9px] tracking-tighter">ADP</span>
                    </div>
                    <span className="text-white font-black text-sm">Auto Detail Pro</span>
                  </div>

                  <div className="bg-black px-4 pt-2 pb-6">
                    <span className="text-[10px] text-black bg-[#ffd500] px-2 py-0.5 rounded-full font-black">
                      ● GPSで近くのプロを検索中
                    </span>
                    <p className="text-white font-black text-xl mt-3 leading-tight">洗車を、</p>
                    <p className="text-[#ffd500] font-black text-xl leading-tight">呼ぶ時代。</p>
                  </div>

                  <div className="px-3 -mt-3">
                    <div className="bg-white rounded-2xl shadow-md border border-black/5 p-3 mb-3">
                      <p className="text-[10px] text-gray-500 mb-1.5 font-bold">サービスメニュー</p>
                      <div className="flex gap-2 justify-between">
                        {["手洗い", "内装", "コート", "磨き"].map((s) => (
                          <div key={s} className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-9 h-9 bg-[#ffd500] rounded-xl flex items-center justify-center">
                              <div className="w-3 h-3 bg-black rounded-full" />
                            </div>
                            <span className="text-[8px] text-gray-700 font-bold">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 mb-2 font-bold">近くの出張プロ</p>
                    {[
                      { name: "田中 健太", rating: "4.9", time: "5分" },
                      { name: "鈴木 大輔", rating: "4.7", time: "7分" },
                    ].map((pro) => (
                      <div
                        key={pro.name}
                        className="bg-white border border-black/10 rounded-xl p-2.5 mb-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-black">{pro.name}</p>
                            <p className="text-[9px] text-yellow-600 font-bold">★ {pro.rating}</p>
                          </div>
                        </div>
                        <span className="text-[9px] text-black font-black bg-[#ffd500] px-2 py-1 rounded-full">
                          約{pro.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/10 flex justify-around py-2">
                    {["ホーム", "予約", "♥", "履歴"].map((item) => (
                      <span key={item} className="text-[9px] text-gray-500 font-bold">{item}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-8 bg-white text-black px-4 py-3 rounded-2xl shadow-xl rotate-[-4deg]">
                <p className="text-[10px] font-bold text-gray-500 leading-none">DOWNLOAD</p>
                <p className="text-2xl font-black leading-none mt-1">無料</p>
              </div>
              <div className="absolute -top-4 -right-2 bg-black text-[#ffd500] px-3 py-2 rounded-full shadow-xl rotate-[6deg]">
                <p className="text-[10px] font-black leading-none">初回限定</p>
                <p className="text-base font-black leading-none mt-0.5">¥1,000 OFF</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#ffd500] overflow-hidden border-y-2 border-black">
        <div className="marquee-track py-4 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-10 pr-10 text-black font-black text-base sm:text-lg uppercase tracking-wider">
              <span>★ 出張洗車</span>
              <span>★ 出張コーティング</span>
              <span>★ 内装クリーニング</span>
              <span>★ ポリッシュ磨き</span>
              <span>★ 最短5分到着</span>
              <span>★ 全国対応エリア拡大中</span>
              <span>★ 認定プロのみ</span>
              <span>★ アプリで簡単予約</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
