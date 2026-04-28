const useCases = [
  {
    persona: "共働きファミリー",
    color: "#e6f4ff",
    headline:
      "週末は家族の時間。\n洗車に行く余裕はありません。",
    description:
      "ご自宅の駐車場まで認定プロが出張するため、お子様のお昼寝中や在宅勤務の合間でも愛車をプロの仕上がりに。土日は家族との時間に集中できます。",
    plan: "おすすめ：定額ライトプラン",
  },
  {
    persona: "マンション在住オーナー",
    color: "#e6fbf7",
    headline:
      "敷地で水が使えない、\n駐車場が狭くて諦めていた。",
    description:
      "プロは給水タンク・電源・撥水排水マットを持参するため、水道や電源がないマンション駐車場でも施工が可能です。管理規約のご確認だけお願いしています。",
    plan: "おすすめ：出張手洗い洗車",
  },
  {
    persona: "輸入車・愛車家",
    color: "#fff4e6",
    headline:
      "ディーラー20万円のコーティング、\n気軽に頼めない。",
    description:
      "認定プロによるガラスコーティングを、ディーラーよりも手の届きやすい価格で。仕上がり保証・再施工対応・保険補償付きで、大切な愛車も安心です。",
    plan: "おすすめ：出張ガラスコーティング",
  },
];

export default function Stories() {
  return (
    <section
      id="stories"
      aria-labelledby="usecases-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="section-label mb-4 inline-flex">Use Cases</p>
            <h2
              id="usecases-heading"
              className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-3"
            >
              こんな方に選ばれます
            </h2>
            <p className="text-[15px] text-[#5a7090] leading-relaxed max-w-xl">
              MobileWash は現在ローンチ準備中のサービスです。
              実際にご利用いただいた方の声は、サービス開始後に随時公開していきます。
            </p>
          </div>
        </div>

        <ul className="grid lg:grid-cols-3 gap-5">
          {useCases.map((c) => (
            <li key={c.persona} className="soft-card bg-white overflow-hidden flex flex-col">
              <div
                className="aspect-[16/10] flex items-center justify-center relative"
                style={{ background: c.color }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-5 left-5 text-[10px] font-bold text-[#0a2540]/60 tracking-widest"
                >
                  USE CASE
                </span>
                <svg
                  className="w-20 h-20 text-[#0a2540]/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4-1.5 1-2 4 1 4-1 2 2v3l-2 2H5l-1-2 1-1.5z" />
                  <circle cx="8" cy="16" r="1.5" />
                  <circle cx="16" cy="16" r="1.5" />
                </svg>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-[11px] font-bold text-[#0099e6] tracking-widest mb-3">
                  {c.persona}
                </p>
                <h3 className="text-base lg:text-lg font-bold text-[#0a2540] mb-3 leading-snug whitespace-pre-line">
                  「{c.headline}」
                </h3>
                <p className="text-[13px] text-[#5a7090] leading-relaxed mb-5 flex-1">
                  {c.description}
                </p>
                <div className="pt-4 border-t border-[#e4eef7]">
                  <span className="inline-block bg-[#f0f9ff] text-[#0099e6] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {c.plan}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 bg-[#f7fbff] border border-[#e4eef7] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#0a2540] mb-1">
              お客様の声を募集予定
            </p>
            <p className="text-[12px] text-[#5a7090]">
              正式ローンチ後、ご利用いただいたお客様の体験談を順次掲載予定です。
              先行登録いただくと、第一陣のお客様としてご招待します。
            </p>
          </div>
          <a href="#cta" className="btn-outline text-[13px] shrink-0">
            先行登録する
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
