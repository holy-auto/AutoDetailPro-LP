const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "GPSで近くのプロを\n自動マッチング",
    description: "現在地から近くのオンラインプロを自動で検索。到着予想時間も一目で分かります。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "最短5分で\nプロが出張到着",
    description: "給水タンク完備のプロがあなたの駐車場まで出張。マンションでも安心してご利用いただけます。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "明朗会計、\n追加料金なし",
    description: "アプリで料金を事前に確認。施工後に追加請求されることはなく、安心の固定価格です。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "認定プロのみ、\n品質と保険補償",
    description: "全プロは技能審査・身元確認済み。施工中の保険補償も完備、再施工保証もあります。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "アプリで\n全て完結する決済",
    description: "クレカ・Apple Pay・PayPayなどに対応。電子レシートも自動発行。法人請求書払いも可能です。",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "事前予約も\n当日依頼もOK",
    description: "「来週末の朝」も「今すぐ」も。お客様のスケジュールに柔軟に合わせて対応します。",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-20 sm:py-28 bg-[#f7fbff]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label mb-4 inline-flex">Features</p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-4"
          >
            MobileWashの特徴
          </h2>
          <p className="text-[15px] text-[#5a7090] leading-relaxed">
            スマホひとつで、出張洗車・出張コーティングのプロをあなたの元へ。
            6つの強みで、車のお手入れを変えていきます。
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <li key={f.title} className="soft-card p-7 bg-white">
              <div className="w-12 h-12 rounded-xl bg-[#e6f4ff] text-[#0099e6] flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-base lg:text-lg font-bold text-[#0a2540] mb-2 leading-snug whitespace-pre-line">
                {f.title}
              </h3>
              <p className="text-[13px] text-[#5a7090] leading-relaxed">
                {f.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
