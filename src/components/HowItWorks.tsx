const steps = [
  {
    step: "01",
    title: "アプリをダウンロード",
    description: "App Store または Google Play から無料でダウンロード。会員登録は約60秒で完了します。",
    iconBg: "#e6f4ff",
    iconColor: "#0099e6",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "メニューと日時を選ぶ",
    description: "出張洗車・コーティングなど、必要なメニューと希望日時をアプリで選びましょう。",
    iconBg: "#e6fbf7",
    iconColor: "#0a8f7c",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "プロが出張到着",
    description: "GPSで近くのプロが自動マッチング。最短5分であなたの駐車場まで出張します。",
    iconBg: "#fff4e6",
    iconColor: "#b36b00",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "施工完了・自動決済",
    description: "施工完了後、アプリで自動決済。電子レシートも発行。レビューもお忘れなく。",
    iconBg: "#f0e6ff",
    iconColor: "#6b46c1",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label mb-4 inline-flex">How it Works</p>
          <h2
            id="how-heading"
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-4"
          >
            ご利用の流れ
          </h2>
          <p className="text-[15px] text-[#5a7090] leading-relaxed">
            ダウンロードから施工完了まで、すべてアプリで完結。
            はじめての方でも、4ステップで簡単にご利用いただけます。
          </p>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, index) => (
            <li key={item.step} className="relative">
              <div className="soft-card p-7 h-full">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: item.iconBg, color: item.iconColor }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-[#8ba0ba] tracking-widest pt-2">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="text-base lg:text-lg font-bold text-[#0a2540] mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[#5a7090] leading-relaxed">
                  {item.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:flex absolute top-1/2 -right-[14px] -translate-y-1/2 z-10 w-7 h-7 bg-white border border-[#e4eef7] soft-shadow rounded-full items-center justify-center"
                >
                  <svg className="w-3 h-3 text-[#0099e6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <a href="#cta" className="btn-primary text-[15px]">
            今すぐアプリをダウンロード
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
