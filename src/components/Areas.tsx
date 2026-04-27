const regions = [
  {
    name: "首都圏",
    nameEn: "TOKYO METRO",
    status: "active",
    prefectures: ["東京都", "神奈川県", "埼玉県", "千葉県"],
  },
  {
    name: "関西圏",
    nameEn: "KANSAI",
    status: "active",
    prefectures: ["大阪府", "京都府", "兵庫県", "奈良県"],
  },
  {
    name: "中部・東海",
    nameEn: "CHUBU",
    status: "active",
    prefectures: ["愛知県", "静岡県", "岐阜県", "三重県"],
  },
  {
    name: "九州",
    nameEn: "KYUSHU",
    status: "soon",
    prefectures: ["福岡県", "熊本県", "鹿児島県"],
  },
  {
    name: "東北・北海道",
    nameEn: "TOHOKU & HOKKAIDO",
    status: "soon",
    prefectures: ["北海道", "宮城県", "福島県"],
  },
  {
    name: "中国・四国",
    nameEn: "CHUGOKU & SHIKOKU",
    status: "soon",
    prefectures: ["広島県", "岡山県", "香川県"],
  },
];

export default function Areas() {
  return (
    <section id="areas" className="relative py-20 sm:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-14 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-black/50 uppercase mb-4">
              SERVICE AREA / 対応エリア
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-black">
              全国へ、
              <br />
              <span className="bg-[#ffd500] px-2">広がる</span>出張網。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-black/65 leading-relaxed">
              現在、首都圏・関西圏・東海エリアでサービス提供中。
              2026年中には全国47都道府県への展開を予定しています。
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div className="bg-black text-white rounded-3xl p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute inset-0 dot-grid opacity-30" />
              <div className="relative">
                <p className="text-[11px] font-bold tracking-[0.3em] text-[#ffd500] uppercase mb-4">
                  COVERAGE MAP
                </p>
                <div className="aspect-square max-w-[280px] mx-auto relative">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <g fill="#262626" stroke="#404040" strokeWidth={0.5}>
                      <path d="M30 60 Q35 50 50 55 L65 65 L70 80 L60 90 Z" />
                      <path d="M70 80 L85 75 L100 85 L95 100 L80 105 Z" />
                      <path d="M100 85 L120 75 L135 85 L140 100 L125 110 L110 105 Z" />
                      <path d="M140 100 L160 95 L170 110 L165 130 L150 135 L138 125 Z" />
                      <path d="M150 135 L160 150 L155 165 L140 160 Z" />
                    </g>
                    <g>
                      <circle cx="115" cy="92" r="4" fill="#ffd500" />
                      <circle cx="115" cy="92" r="8" fill="#ffd500" opacity="0.3">
                        <animate attributeName="r" from="4" to="14" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="85" cy="100" r="3" fill="#ffd500" />
                      <circle cx="135" cy="100" r="3" fill="#ffd500" />
                      <circle cx="155" cy="125" r="2.5" fill="#ffd500" opacity="0.5" />
                      <circle cx="60" cy="80" r="2.5" fill="#ffd500" opacity="0.5" />
                    </g>
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#ffd500] rounded-full" />
                    <span className="text-white/70">対応中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#ffd500]/40 rounded-full" />
                    <span className="text-white/70">準備中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-3">
              {regions.map((r) => (
                <div
                  key={r.name}
                  className={`rounded-2xl p-6 border-2 ${
                    r.status === "active"
                      ? "bg-[#ffd500] border-black"
                      : "bg-white border-black/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-black/50 mb-1">
                        {r.nameEn}
                      </p>
                      <h3 className="text-xl font-black text-black">{r.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        r.status === "active"
                          ? "bg-black text-[#ffd500]"
                          : "bg-black/10 text-black/60"
                      }`}
                    >
                      {r.status === "active" ? "● 対応中" : "準備中"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.prefectures.map((p) => (
                      <span
                        key={p}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          r.status === "active"
                            ? "bg-black/10 text-black"
                            : "bg-black/5 text-black/60"
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-black text-white rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-black mb-1">あなたのエリアは対応中？</p>
                <p className="text-xs text-white/60">
                  アプリで郵便番号を入力すると、対応状況がすぐに分かります。
                </p>
              </div>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 bg-[#ffd500] text-black font-black px-5 py-2.5 rounded-full text-sm hover:bg-white transition-colors"
              >
                エリアを確認
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
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
