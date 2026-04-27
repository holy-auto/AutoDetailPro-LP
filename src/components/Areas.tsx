const regions = [
  {
    name: "首都圏",
    nameEn: "Tokyo Metro",
    status: "active",
    prefectures: ["東京都", "神奈川県", "埼玉県", "千葉県"],
  },
  {
    name: "関西圏",
    nameEn: "Kansai",
    status: "active",
    prefectures: ["大阪府", "京都府", "兵庫県", "奈良県"],
  },
  {
    name: "中部・東海",
    nameEn: "Chubu",
    status: "active",
    prefectures: ["愛知県", "静岡県", "岐阜県", "三重県"],
  },
  {
    name: "九州",
    nameEn: "Kyushu",
    status: "soon",
    prefectures: ["福岡県", "熊本県", "鹿児島県"],
  },
  {
    name: "東北・北海道",
    nameEn: "Tohoku & Hokkaido",
    status: "soon",
    prefectures: ["北海道", "宮城県", "福島県"],
  },
  {
    name: "中国・四国",
    nameEn: "Chugoku & Shikoku",
    status: "soon",
    prefectures: ["広島県", "岡山県", "香川県"],
  },
];

export default function Areas() {
  return (
    <section
      id="areas"
      aria-labelledby="areas-heading"
      className="py-20 sm:py-28 bg-[#f7fbff]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label mb-4 inline-flex">Service Area</p>
          <h2
            id="areas-heading"
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-4"
          >
            対応エリア
          </h2>
          <p className="text-[15px] text-[#5a7090] leading-relaxed">
            現在、首都圏・関西圏・東海エリアでサービス提供中。
            2026年中には全国47都道府県への展開を予定しています。
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <div className="soft-card bg-white p-8">
              <p className="section-label mb-4 inline-flex">Coverage Map</p>
              <div className="aspect-square max-w-[280px] mx-auto relative">
                <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
                  <g fill="#e4eef7" stroke="#cfdfee" strokeWidth={0.5}>
                    <path d="M30 60 Q35 50 50 55 L65 65 L70 80 L60 90 Z" />
                    <path d="M70 80 L85 75 L100 85 L95 100 L80 105 Z" />
                    <path d="M100 85 L120 75 L135 85 L140 100 L125 110 L110 105 Z" />
                    <path d="M140 100 L160 95 L170 110 L165 130 L150 135 L138 125 Z" />
                    <path d="M150 135 L160 150 L155 165 L140 160 Z" />
                  </g>
                  <g>
                    <circle cx="115" cy="92" r="4" fill="#0099e6" />
                    <circle cx="115" cy="92" r="8" fill="#0099e6" opacity="0.3">
                      <animate attributeName="r" from="4" to="14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="85" cy="100" r="3" fill="#0099e6" />
                    <circle cx="135" cy="100" r="3" fill="#0099e6" />
                    <circle cx="155" cy="125" r="2.5" fill="#0099e6" opacity="0.5" />
                    <circle cx="60" cy="80" r="2.5" fill="#0099e6" opacity="0.5" />
                  </g>
                </svg>
              </div>
              <div className="flex items-center justify-center gap-5 mt-4 text-[12px]">
                <span className="flex items-center gap-1.5 text-[#5a7090]">
                  <span className="w-2.5 h-2.5 bg-[#0099e6] rounded-full" />
                  対応中
                </span>
                <span className="flex items-center gap-1.5 text-[#8ba0ba]">
                  <span className="w-2.5 h-2.5 bg-[#0099e6]/30 rounded-full" />
                  準備中
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid sm:grid-cols-2 gap-3">
              {regions.map((r) => (
                <li
                  key={r.name}
                  className={`rounded-2xl p-5 border ${
                    r.status === "active"
                      ? "bg-white border-[#0099e6]/30 soft-shadow"
                      : "bg-white border-[#e4eef7]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-[#8ba0ba] mb-1">
                        {r.nameEn}
                      </p>
                      <h3 className="text-base font-bold text-[#0a2540]">{r.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        r.status === "active"
                          ? "bg-[#e6f4ff] text-[#0099e6]"
                          : "bg-[#f0f5fa] text-[#8ba0ba]"
                      }`}
                    >
                      {r.status === "active" ? "● 対応中" : "準備中"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.prefectures.map((p) => (
                      <span
                        key={p}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          r.status === "active"
                            ? "bg-[#f0f9ff] text-[#1a3658]"
                            : "bg-[#f7fbff] text-[#8ba0ba]"
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 bg-white border border-[#e4eef7] rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-bold text-[#0a2540] mb-0.5">
                  あなたのエリアは対応中？
                </p>
                <p className="text-[12px] text-[#5a7090]">
                  アプリで郵便番号を入力すると、対応状況がすぐに分かります。
                </p>
              </div>
              <a
                href="#cta"
                className="text-[13px] font-bold text-[#0099e6] hover:underline inline-flex items-center gap-1"
              >
                エリアを確認
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
