const rows = [
  { feature: "予約方法", us: "アプリで30秒", others: "電話・店舗持込" },
  { feature: "場所", us: "自宅駐車場・職場へ出張", others: "店舗まで来店" },
  { feature: "所要時間", us: "最短45分〜", others: "半日〜1日（待ち時間込み）" },
  { feature: "料金の透明性", us: "事前確定・追加なし", others: "現地で見積もり" },
  { feature: "プロの品質", us: "認定プロのみ・評価制", others: "店舗ごとにバラつき" },
  { feature: "決済", us: "アプリで自動決済", others: "現金・カード払い" },
];

export default function Comparison() {
  return (
    <section
      aria-labelledby="comparison-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="section-label mb-4 inline-flex">Comparison</p>
          <h2
            id="comparison-heading"
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-4"
          >
            出張型と従来型のちがい
          </h2>
          <p className="text-[15px] text-[#5a7090] leading-relaxed">
            ガソリンスタンドや専門店との違いを、6つの項目で比較しました。
          </p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-[#e4eef7] soft-shadow">
          <div className="grid grid-cols-3 bg-[#f7fbff] border-b border-[#e4eef7]">
            <div className="p-5 lg:p-6">
              <p className="text-[10px] font-bold text-[#8ba0ba] tracking-widest mb-1">
                CATEGORY
              </p>
              <p className="font-bold text-sm lg:text-base text-[#0a2540]">項目</p>
            </div>
            <div className="p-5 lg:p-6 bg-white border-x border-[#e4eef7] relative">
              <span className="absolute top-3 right-3 text-[9px] font-bold bg-[#0099e6] text-white px-2 py-0.5 rounded-full">
                BEST
              </span>
              <p className="text-[10px] font-bold text-[#0099e6] tracking-widest mb-1">
                MOBILEWASH
              </p>
              <p className="font-bold text-sm lg:text-base text-[#0a2540]">出張型アプリ</p>
            </div>
            <div className="p-5 lg:p-6">
              <p className="text-[10px] font-bold text-[#8ba0ba] tracking-widest mb-1">
                TRADITIONAL
              </p>
              <p className="font-bold text-sm lg:text-base text-[#5a7090]">従来型店舗</p>
            </div>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 ${
                i !== rows.length - 1 ? "border-b border-[#e4eef7]" : ""
              }`}
            >
              <div className="p-5 lg:p-6 flex items-center bg-[#f7fbff]">
                <p className="text-sm lg:text-base font-bold text-[#0a2540]">
                  {row.feature}
                </p>
              </div>
              <div className="p-5 lg:p-6 bg-[#f0f9ff] border-x border-[#e4eef7] flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 bg-[#0099e6] rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-sm lg:text-base font-medium text-[#0a2540] leading-snug">
                  {row.us}
                </p>
              </div>
              <div className="p-5 lg:p-6 bg-white flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 bg-[#f0f5fa] rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-[#8ba0ba]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <p className="text-sm lg:text-base text-[#5a7090] leading-snug">
                  {row.others}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
