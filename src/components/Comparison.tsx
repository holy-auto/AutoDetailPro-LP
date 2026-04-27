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
    <section className="relative py-20 sm:py-32 bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#0a2540]/50 uppercase mb-4">
            COMPARISON / 比較
          </p>
          <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a2540] mb-5">
            出張型と従来型、
            <br />
            <span className="bg-[#00b4ff] px-2">比べてみた</span>。
          </h2>
          <p className="text-base lg:text-lg text-[#0a2540]/65 max-w-2xl mx-auto leading-relaxed">
            ガソリンスタンドや専門店との違いを、6つの項目で比較しました。
          </p>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#0a2540]">
          <div className="grid grid-cols-3 bg-[#0a2540] text-white">
            <div className="p-5 lg:p-6">
              <p className="text-[10px] font-bold text-white/50 tracking-widest mb-1">
                CATEGORY
              </p>
              <p className="font-black text-sm lg:text-base">項目</p>
            </div>
            <div className="p-5 lg:p-6 bg-[#00b4ff] text-[#0a2540] border-x-2 border-[#0a2540] relative">
              <span className="absolute top-3 right-3 text-[9px] font-black bg-[#0a2540] text-[#00b4ff] px-2 py-0.5 rounded-full">
                BEST
              </span>
              <p className="text-[10px] font-bold text-[#0a2540]/60 tracking-widest mb-1">
                MOBILEWASH
              </p>
              <p className="font-black text-sm lg:text-base">出張型アプリ</p>
            </div>
            <div className="p-5 lg:p-6">
              <p className="text-[10px] font-bold text-white/50 tracking-widest mb-1">
                TRADITIONAL
              </p>
              <p className="font-black text-sm lg:text-base">従来型店舗</p>
            </div>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 ${i !== rows.length - 1 ? "border-b border-[#0a2540]/10" : ""}`}
            >
              <div className="p-5 lg:p-6 flex items-center bg-white">
                <p className="text-sm lg:text-base font-black text-[#0a2540]">
                  {row.feature}
                </p>
              </div>
              <div className="p-5 lg:p-6 bg-[#e8f7ff] border-x-2 border-[#0a2540]/5 flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 bg-[#0a2540] rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-[#00b4ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-sm lg:text-base font-bold text-[#0a2540] leading-snug">
                  {row.us}
                </p>
              </div>
              <div className="p-5 lg:p-6 bg-white flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 bg-[#0a2540]/10 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-[#0a2540]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}>
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <p className="text-sm lg:text-base text-[#0a2540]/60 leading-snug">
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
