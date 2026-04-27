const steps = [
  {
    step: "01",
    title: "アプリをDL",
    titleSub: "DOWNLOAD",
    description: "App Store または Google Play から無料でダウンロード。会員登録は約60秒で完了します。",
    visual: "phone-download",
  },
  {
    step: "02",
    title: "メニューを選ぶ",
    titleSub: "CHOOSE MENU",
    description: "出張洗車・コーティングなど、必要なメニューと希望日時をアプリで選びましょう。",
    visual: "menu",
  },
  {
    step: "03",
    title: "プロが出張到着",
    titleSub: "PRO ARRIVES",
    description: "GPSで近くのプロが自動マッチング。最短5分であなたの駐車場まで出張します。",
    visual: "map",
  },
  {
    step: "04",
    title: "施工完了・決済",
    titleSub: "DONE",
    description: "施工完了後、アプリで自動決済。レシートも電子発行。レビューもお忘れなく。",
    visual: "done",
  },
];

function StepVisual({ kind }: { kind: string }) {
  if (kind === "phone-download") {
    return (
      <div className="relative w-full aspect-[4/3] bg-[#0e2a4a] rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="w-24 h-40 bg-[#0a2540] border-2 border-white/20 rounded-2xl p-1.5">
          <div className="w-full h-full bg-[#00b4ff] rounded-xl flex items-center justify-center">
            <svg className="w-10 h-10 text-[#0a2540]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  if (kind === "menu") {
    return (
      <div className="relative w-full aspect-[4/3] bg-[#0e2a4a] rounded-2xl overflow-hidden p-5 flex flex-col gap-2">
        {["手洗い洗車", "ガラスコーティング", "内装クリーニング"].map((m, i) => (
          <div
            key={m}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              i === 1 ? "bg-[#00b4ff] text-[#0a2540]" : "bg-white/5 text-white/70"
            }`}
          >
            <span className="text-sm font-bold">{m}</span>
            {i === 1 && (
              <span className="w-5 h-5 bg-[#0a2540] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-[#00b4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "map") {
    return (
      <div className="relative w-full aspect-[4/3] bg-[#0e2a4a] rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 bg-[#00b4ff]/30 rounded-full animate-ping" />
          <div className="relative w-16 h-16 bg-[#00b4ff] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#0a2540]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur rounded-lg px-3 py-2 flex items-center justify-between text-white">
          <span className="text-xs font-bold">プロが向かっています</span>
          <span className="text-xs font-black text-[#00b4ff]">あと 5分</span>
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-[4/3] bg-[#0e2a4a] rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3">
      <div className="w-16 h-16 bg-[#00b4ff] rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-[#0a2540]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-white font-black text-sm">完了 — ありがとうございました</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-[#00b4ff] text-base">★</span>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-32 bg-[#0a2540] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] bg-[#00b4ff] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#00b4ff] uppercase mb-4">
              HOW IT WORKS / 使い方
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black">
              使い方は、
              <br />
              <span className="text-[#00b4ff]">かんたん</span>4ステップ。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-white/70 leading-relaxed">
              ダウンロードから施工完了まで、すべてアプリで完結。
              はじめての方でも、迷わずに使えます。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              <div className="bg-[#0c2238] border border-white/10 rounded-3xl p-6 hover:border-[#00b4ff] transition-colors h-full flex flex-col">
                <StepVisual kind={item.visual} />
                <div className="flex items-baseline gap-3 mt-6 mb-3">
                  <span className="text-4xl lg:text-5xl font-black text-[#00b4ff] leading-none tracking-tighter">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold text-white/40 tracking-widest">
                    {item.titleSub}
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 bg-[#00b4ff] rounded-full items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#0a2540]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#cta"
            className="group inline-flex items-center justify-center gap-2 bg-[#00b4ff] text-[#0a2540] font-black px-8 py-4 rounded-full hover:bg-white transition-colors"
          >
            今すぐアプリをダウンロード
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
        </div>
      </div>
    </section>
  );
}
