const services = [
  {
    name: "出張手洗い洗車",
    nameEn: "Hand Wash",
    description: "ピュアウォーターで丁寧に手洗い。ホイールも含めて隅々まで仕上げます。",
    price: "3,980",
    duration: "約45分",
    tag: "人気No.1",
    color: "#e6f4ff",
    iconColor: "#0099e6",
  },
  {
    name: "出張内装クリーニング",
    nameEn: "Interior Clean",
    description: "シート・天井・ダッシュボード・フロアを徹底的にクリーニング。消臭・除菌込み。",
    price: "6,980",
    duration: "約90分",
    color: "#e6fbf7",
    iconColor: "#0a8f7c",
  },
  {
    name: "出張ガラスコーティング",
    nameEn: "Glass Coating",
    description: "プロ施工のガラスコーティング。最大3年間、艶と撥水を保ちます。",
    price: "29,800",
    duration: "約3時間",
    tag: "おすすめ",
    color: "#fff4e6",
    iconColor: "#b36b00",
  },
  {
    name: "出張ポリッシュ磨き",
    nameEn: "Polish",
    description: "小傷・くすみを丁寧に磨き上げ、新車のような輝きを復活させます。",
    price: "12,800",
    duration: "約2時間",
    color: "#f0e6ff",
    iconColor: "#6b46c1",
  },
  {
    name: "フルディテイリング",
    nameEn: "Full Detail",
    description: "洗車・内装・磨き・コーティングをトータルケア。最高の仕上がりへ。",
    price: "49,800",
    duration: "約5時間",
    color: "#ffe6ee",
    iconColor: "#c41e60",
  },
  {
    name: "エンジンルーム洗浄",
    nameEn: "Engine Bay",
    description: "エンジン周りの油汚れ・ホコリを丁寧に洗浄。点検前にもおすすめです。",
    price: "9,800",
    duration: "約1時間",
    color: "#e6f0ff",
    iconColor: "#1e4dc4",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <p className="section-label mb-4 inline-flex">Services</p>
            <h2
              id="services-heading"
              className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-3"
            >
              サービスメニュー
            </h2>
            <p className="text-[15px] text-[#5a7090] leading-relaxed max-w-xl">
              手洗い洗車から本格コーティングまで、6つの出張メニュー。
              料金はすべて表示価格、追加請求は一切ありません。
            </p>
          </div>
          <a href="#cta" className="btn-outline text-[14px] shrink-0">
            すべてのメニューを見る
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <li key={service.name}>
              <a
                href="#cta"
                className="soft-card p-7 block h-full bg-white relative group"
              >
                {service.tag && (
                  <span className="absolute top-5 right-5 bg-[#0099e6] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {service.tag}
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: service.color }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: service.iconColor }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold text-[#8ba0ba] tracking-widest mb-1.5">
                  {service.nameEn}
                </p>
                <h3 className="text-lg lg:text-xl font-bold text-[#0a2540] mb-3 leading-snug">
                  {service.name}
                </h3>
                <p className="text-[13px] text-[#5a7090] mb-6 leading-relaxed min-h-[60px]">
                  {service.description}
                </p>
                <div className="flex items-end justify-between pt-5 border-t border-[#e4eef7]">
                  <div>
                    <p className="text-[11px] font-medium text-[#8ba0ba] mb-1">
                      {service.duration}
                    </p>
                    <p className="text-2xl font-bold text-[#0a2540] leading-none">
                      ¥{service.price}
                      <span className="text-xs ml-1 text-[#5a7090] font-medium">〜</span>
                    </p>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-[#f0f9ff] group-hover:bg-[#0099e6] flex items-center justify-center transition-colors">
                    <svg
                      className="w-4 h-4 text-[#0099e6] group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <p className="text-center text-[12px] text-[#8ba0ba] mt-8">
          ※ 表示価格は普通車（Mサイズ）の目安です。車種・サイズ・状態により変動する場合があります。
        </p>
      </div>
    </section>
  );
}
