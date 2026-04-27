import LiveCounter from "@/components/LiveCounter";
import { getSiteStats } from "@/lib/stats";

export const revalidate = 120;

export default async function Hero() {
  const stats = await getSiteStats();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative bg-white pt-10 lg:pt-14 pb-16 lg:pb-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-soft opacity-60 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-[#e6f4ff] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-40 w-[420px] h-[420px] bg-[#e6fbf7] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="tag-pill mb-6">
              <span className="w-1.5 h-1.5 bg-[#0099e6] rounded-full" />
              {stats.launchTarget} 正式ローンチ予定 / 先行登録受付中
            </span>
            <h1
              id="hero-heading"
              className="heading-tight text-[40px] sm:text-5xl lg:text-[58px] xl:text-[64px] font-bold text-[#0a2540] mb-6"
            >
              洗車を、
              <br />
              <span className="text-[#0099e6]">呼ぶ時代</span>
              へ。
            </h1>
            <p className="text-[15px] sm:text-base lg:text-lg text-[#5a7090] leading-relaxed mb-10 max-w-xl">
              出張洗車・出張コーティングのプロを、スマホひとつで呼べるアプリ。
              GPSで近くの認定プロを自動マッチング。最短5分で駐車場まで出張。
              現在、認定プロ募集中・先行ユーザー登録を受け付けています。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <a href="#cta" className="btn-primary text-[15px] px-7">
                先行登録する
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#how-it-works" className="btn-outline text-[15px] px-7">
                サービスを見る
              </a>
            </div>

            <dl className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-7 border-t border-[#e4eef7]">
              <div>
                <dt className="text-[11px] text-[#8ba0ba] font-bold tracking-widest mb-1 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#0a8f7c] rounded-full animate-pulse" />
                  事前登録者数
                </dt>
                <dd className="text-2xl lg:text-[28px] font-bold text-[#0a2540] leading-none tabular-nums">
                  <LiveCounter target={stats.waitlist} />
                  <span className="text-sm text-[#0099e6] ml-1 font-bold">名</span>
                </dd>
              </div>
              <div className="w-px h-9 bg-[#e4eef7]" />
              <div>
                <dt className="text-[11px] text-[#8ba0ba] font-bold tracking-widest mb-1 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#0a8f7c] rounded-full animate-pulse" />
                  認定プロ登録数
                </dt>
                <dd className="text-2xl lg:text-[28px] font-bold text-[#0a2540] leading-none tabular-nums">
                  <LiveCounter target={stats.pros} />
                  <span className="text-sm text-[#0099e6] ml-1 font-bold">名</span>
                </dd>
              </div>
              <div className="w-px h-9 bg-[#e4eef7]" />
              <div>
                <dt className="text-[11px] text-[#8ba0ba] font-bold tracking-widest mb-1">
                  ローンチ予定
                </dt>
                <dd className="text-2xl lg:text-[28px] font-bold text-[#0a2540] leading-none">
                  {stats.launchTarget}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -top-8 -left-10 bg-white soft-shadow-lg rounded-2xl px-4 py-3 z-20 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-[#e6f4ff] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0099e6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8ba0ba] font-bold leading-tight">プロが向かいます（イメージ）</p>
                    <p className="text-[13px] font-bold text-[#0a2540] leading-tight mt-0.5">最短5分で出張</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white soft-shadow-lg rounded-2xl px-4 py-3 z-20 hidden sm:block">
                <p className="text-[10px] text-[#8ba0ba] font-bold leading-tight">先行登録特典</p>
                <p className="text-base font-bold text-[#0099e6] leading-tight mt-0.5">¥1,000 OFF</p>
              </div>

              <div className="relative w-[260px] sm:w-[300px] h-[540px] sm:h-[600px] bg-gradient-to-b from-[#0a2540] to-[#1a3658] rounded-[2.5rem] p-3 soft-shadow-lg">
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  <div className="bg-white border-b border-[#e4eef7] px-4 py-3 flex items-center gap-2">
                    <div className="logo-mark w-6 h-6 rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h.5a1.5 1.5 0 011.5 1.5V17a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.5A1.5 1.5 0 014.5 11H5z" />
                      </svg>
                    </div>
                    <span className="text-[#0a2540] font-bold text-[13px]">MobileWash</span>
                    <span className="ml-auto text-[9px] font-bold text-[#0a8f7c] bg-[#e6fbf7] px-1.5 py-0.5 rounded-full">
                      β
                    </span>
                  </div>

                  <div className="px-4 pt-4 pb-3 bg-gradient-to-b from-[#f0f9ff] to-white">
                    <p className="text-[11px] text-[#8ba0ba] font-bold mb-1">画面イメージ</p>
                    <p className="text-[#0a2540] font-bold text-base leading-tight">
                      今日も愛車を、
                      <br />
                      <span className="text-[#0099e6]">ピカピカ</span>に。
                    </p>
                  </div>

                  <div className="px-3">
                    <div className="bg-white rounded-2xl border border-[#e4eef7] p-3 mb-3">
                      <p className="text-[10px] text-[#8ba0ba] mb-2 font-bold">サービスメニュー</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: "手洗い", color: "#e6f4ff" },
                          { name: "内装", color: "#e6fbf7" },
                          { name: "コート", color: "#fff4e6" },
                          { name: "磨き", color: "#f0e6ff" },
                        ].map((s) => (
                          <div key={s.name} className="flex flex-col items-center gap-1">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{ background: s.color }}
                            >
                              <div className="w-3 h-3 bg-[#0099e6] rounded-full" />
                            </div>
                            <span className="text-[8px] text-[#5a7090] font-medium">{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-[#8ba0ba] mb-2 font-bold">
                      近くの出張プロ <span className="text-[#0a8f7c]">（β版イメージ）</span>
                    </p>
                    {[
                      { name: "プロA", time: "5分" },
                      { name: "プロB", time: "7分" },
                    ].map((pro) => (
                      <div
                        key={pro.name}
                        className="bg-white border border-[#e4eef7] rounded-xl p-2.5 mb-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-[#e6f4ff] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-[#0099e6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[#0a2540]">{pro.name}</p>
                            <p className="text-[9px] text-[#5a7090]">レビュー準備中</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#0099e6] font-bold bg-[#e6f4ff] px-2 py-0.5 rounded-full">
                          約{pro.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e4eef7] flex justify-around py-2.5">
                    {[
                      { label: "ホーム", active: true },
                      { label: "予約", active: false },
                      { label: "履歴", active: false },
                      { label: "設定", active: false },
                    ].map((item) => (
                      <span
                        key={item.label}
                        className={`text-[9px] font-bold ${
                          item.active ? "text-[#0099e6]" : "text-[#8ba0ba]"
                        }`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
