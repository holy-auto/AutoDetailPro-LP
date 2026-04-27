const problems = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "洗車に行く時間がない",
    description: "週末は家族サービス、平日は仕事で深夜帰宅。GSの洗車機に並ぶ時間すら取れない。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: "マンションで洗車できない",
    description: "駐車場で水を使えない、ホースが届かない、騒音も気になる。手洗いは諦めていた。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "コーティングは高すぎる",
    description: "ディーラーや専門店だと数十万円。気軽に頼めず、結局はワックスで凌いでいる。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: "業者の質が分からない",
    description: "ネットで頼んでも当たり外れ。仕上がりに満足できなかった経験がある。",
  },
];

export default function Problems() {
  return (
    <section id="problems" className="relative py-20 sm:py-28 bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-14 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#0a2540]/50 uppercase mb-4">
              PAIN POINTS / お悩み
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a2540]">
              こんな
              <span className="bg-[#00b4ff] px-2">お悩み</span>
              、
              <br />
              ありませんか？
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-[#0a2540]/70 leading-relaxed">
              洗車もコーティングも「やりたい」けど、時間も場所も予算も足りない。
              そんな声に応えるのが MobileWash です。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-3xl p-7 border-2 border-[#0a2540]/5 hover:border-[#0a2540] transition-colors"
            >
              <div className="w-14 h-14 bg-[#0a2540] text-[#00b4ff] rounded-2xl flex items-center justify-center mb-6">
                {p.icon}
              </div>
              <h3 className="text-lg lg:text-xl font-black text-[#0a2540] mb-3 leading-tight">
                {p.title}
              </h3>
              <p className="text-sm text-[#0a2540]/65 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 lg:mt-16 bg-[#0a2540] text-white rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#00b4ff] rounded-full opacity-15 blur-3xl" />
          <div className="relative grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <p className="text-[11px] font-bold tracking-[0.3em] text-[#00b4ff] uppercase mb-3">
                OUR ANSWER
              </p>
              <h3 className="heading-tight text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
                ぜんぶ、
                <span className="text-[#00b4ff]">出張プロ</span>
                がやります。
              </h3>
              <p className="text-white/75 text-base lg:text-lg leading-relaxed max-w-2xl">
                駐車場が水を使えなくても、給水タンク完備のプロが伺います。
                料金は完全明朗、認定プロのみだから仕上がりも安心。
                スマホひとつで、「あったらいいな」をすべて解決します。
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <a
                href="#cta"
                className="inline-flex items-center gap-2 bg-[#00b4ff] text-[#0a2540] font-black px-7 py-4 rounded-full hover:bg-white transition-colors"
              >
                今すぐ解決する
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
