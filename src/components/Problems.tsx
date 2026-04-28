const problems = [
  {
    title: "洗車に行く時間がない",
    description: "週末は家族サービス、平日は仕事で深夜帰宅。GSの洗車機に並ぶ時間すら取れない。",
  },
  {
    title: "マンションで洗車できない",
    description: "駐車場で水を使えない、ホースが届かない、騒音も気になる。手洗いは諦めていた。",
  },
  {
    title: "コーティングは高すぎる",
    description: "ディーラーや専門店だと数十万円。気軽に頼めず、結局はワックスで凌いでいる。",
  },
  {
    title: "業者の質が分からない",
    description: "ネットで頼んでも当たり外れ。仕上がりに満足できなかった経験がある。",
  },
];

export default function Problems() {
  return (
    <section
      id="problems"
      aria-labelledby="problems-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-label mb-4 justify-center inline-flex">Pain Points</p>
          <h2
            id="problems-heading"
            className="text-3xl sm:text-4xl font-bold text-[#0a2540] mb-4"
          >
            こんなお悩み、ありませんか？
          </h2>
          <p className="text-[15px] text-[#5a7090] leading-relaxed">
            洗車もコーティングも「やりたい」けど、時間も場所も予算も足りない。
            <br className="hidden sm:inline" />
            そんな声に応えるのが MobileWash です。
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p, i) => (
            <li key={p.title} className="soft-card p-7">
              <div className="text-[11px] font-bold text-[#0099e6] tracking-widest mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-base lg:text-[17px] font-bold text-[#0a2540] mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-[13px] text-[#5a7090] leading-relaxed">
                {p.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <p className="text-[14px] text-[#5a7090] mb-1">
            ── すべての悩みを、ひとつのアプリで解決します。
          </p>
        </div>
      </div>
    </section>
  );
}
