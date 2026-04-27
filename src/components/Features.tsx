const features = [
  {
    num: "01",
    en: "GPS MATCHING",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "GPSで\n近くのプロを\n自動マッチング",
    description: "現在地から近くのプロを自動検索。到着予想時間も一目でわかります。",
  },
  {
    num: "02",
    en: "ON DEMAND",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "最短5分で\nプロが\n出張到着",
    description: "給水タンク完備のプロがあなたの駐車場へ出張。マンションでも安心です。",
  },
  {
    num: "03",
    en: "TRANSPARENT",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "明朗会計、\n追加料金\n一切なし",
    description: "アプリで料金を事前確認。施工後の追加請求は一切ありません。安心の固定価格。",
  },
  {
    num: "04",
    en: "CERTIFIED",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "認定プロのみ\n確かな技術\nと品質保証",
    description: "全プロは技能審査・身元確認済み。万が一の保険補償も完備しています。",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-black/50 uppercase mb-4">
              FEATURES / 特徴
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-black">
              選ばれる、
              <br />
              4つの<span className="bg-[#ffd500] px-2">理由</span>。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-black/65 leading-relaxed">
              スマホひとつで、出張洗車・出張コーティングのプロをあなたの元へ。
              スピード・透明性・確かな品質で、車のお手入れを変えていきます。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-black">
          {features.map((feature) => (
            <div
              key={feature.num}
              className="group relative p-8 border-r border-b border-black bg-white hover:bg-[#ffd500] transition-colors"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-black text-[#ffd500] group-hover:bg-white group-hover:text-black rounded-2xl flex items-center justify-center transition-colors">
                  {feature.icon}
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-black/30 group-hover:text-black/50 transition-colors leading-none">
                    {feature.num}
                  </span>
                  <span className="block text-[9px] font-bold text-black/40 group-hover:text-black/60 tracking-widest mt-1">
                    {feature.en}
                  </span>
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-black mb-3 whitespace-pre-line leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
