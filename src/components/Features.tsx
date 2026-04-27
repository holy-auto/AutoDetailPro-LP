const features = [
  {
    num: "01",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "GPSで近くのプロを\n自動マッチング",
    description: "現在地から近くのプロを自動検索。到着予想時間も一目でわかります。",
  },
  {
    num: "02",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "最短5分で\nプロが到着",
    description: "プロがあなたの元へ出張。待ち時間なく、その場で施工開始します。",
  },
  {
    num: "03",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "評価・口コミで\n安心の選択",
    description: "実際の利用者の評価と口コミで、信頼できるプロを選べます。",
  },
  {
    num: "04",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "認定プロのみ\n確かな技術",
    description: "全てのプロは資格認定済み。確かな技術と品質をお約束します。",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="inline-block bg-[#0a0a0a] text-[#ffd900] text-xs font-black px-3 py-1.5 uppercase tracking-wider mb-6">
              FEATURES / 特徴
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a0a0a]">
              選ばれる、
              <br />
              4つの<span className="bg-[#ffd900] px-2">理由</span>。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-[#6b6b6b] leading-relaxed">
              スマホひとつで、プロのカーディテイリングをあなたの元へ。
              スピード・品質・信頼の三拍子で、車のお手入れを変えていきます。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#0a0a0a]">
          {features.map((feature) => (
            <div
              key={feature.num}
              className="group relative p-8 border-r border-b border-[#0a0a0a] bg-white hover:bg-[#ffd900] transition-colors"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 bg-[#0a0a0a] text-[#ffd900] group-hover:bg-white group-hover:text-[#0a0a0a] flex items-center justify-center transition-colors">
                  {feature.icon}
                </div>
                <span className="text-2xl font-black text-[#0a0a0a]/30 group-hover:text-[#0a0a0a]/50 transition-colors">
                  {feature.num}
                </span>
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-[#0a0a0a] mb-3 whitespace-pre-line leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-[#0a0a0a]/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
