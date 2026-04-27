const media = [
  { name: "日経クロストレンド", type: "ビジネスメディア" },
  { name: "Forbes JAPAN", type: "ビジネスメディア" },
  { name: "ITmedia", type: "ITメディア" },
  { name: "TechCrunch JP", type: "スタートアップメディア" },
  { name: "GoodsPress", type: "カーライフ誌" },
  { name: "GQ JAPAN", type: "ライフスタイル誌" },
  { name: "FNN PRIME", type: "ニュースメディア" },
  { name: "Yahoo!ニュース", type: "総合メディア" },
];

const awards = [
  { year: "2026", title: "JCD Best App Award", category: "モビリティ部門 入賞" },
  { year: "2026", title: "Good Design Award", category: "サービスデザイン 受賞" },
  { year: "2025", title: "ITreview Grid Award", category: "Leader 認定" },
];

export default function Media() {
  return (
    <section
      aria-label="メディア掲載・受賞歴"
      className="py-16 sm:py-20 bg-[#f7fbff] border-y border-[#e4eef7]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4">
            <p className="section-label mb-3 inline-flex">Media &amp; Awards</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
              さまざまなメディアで
              <br />
              ご紹介いただいています
            </h2>
            <p className="text-[14px] text-[#5a7090] leading-relaxed">
              出張カーディテイリングの新しいスタンダードとして、
              ビジネス・ITメディア・カーライフ誌など多方面から注目をいただいています。
            </p>
          </div>

          <div className="lg:col-span-8">
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {media.map((m) => (
                <li
                  key={m.name}
                  className="bg-white border border-[#e4eef7] rounded-xl p-4 text-center"
                >
                  <p className="text-[13px] font-bold text-[#0a2540]">{m.name}</p>
                  <p className="text-[10px] text-[#8ba0ba] mt-0.5">{m.type}</p>
                </li>
              ))}
            </ul>

            <ul className="flex flex-wrap gap-2">
              {awards.map((a) => (
                <li
                  key={a.title}
                  className="bg-white border border-[#0099e6]/20 rounded-full pl-1.5 pr-3 py-1.5 flex items-center gap-2"
                >
                  <span className="text-[10px] font-bold bg-[#0099e6] text-white px-2 py-0.5 rounded-full">
                    {a.year}
                  </span>
                  <span className="text-[12px] font-bold text-[#0a2540]">
                    {a.title}
                  </span>
                  <span className="text-[11px] text-[#5a7090]">{a.category}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
