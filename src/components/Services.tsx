const services = [
  {
    num: "01",
    name: "出張手洗い洗車",
    nameEn: "HAND WASH",
    description: "高品質ピュアウォーターで丁寧に手洗い。ホイールも含めて隅々まで仕上げます。",
    price: "3,980",
    duration: "約45分",
    tag: "人気No.1",
  },
  {
    num: "02",
    name: "出張内装クリーニング",
    nameEn: "INTERIOR CLEAN",
    description: "シート・天井・ダッシュボード・フロアを徹底的にクリーニング。消臭・除菌込み。",
    price: "6,980",
    duration: "約90分",
  },
  {
    num: "03",
    name: "出張ガラスコーティング",
    nameEn: "GLASS COATING",
    description: "プロ施工のガラスコーティング。最大3年間、艶と撥水を保ちます。",
    price: "29,800",
    duration: "約3時間",
    tag: "おすすめ",
  },
  {
    num: "04",
    name: "出張ポリッシュ磨き",
    nameEn: "POLISH",
    description: "小傷・くすみを丁寧に磨き上げ、新車のような輝きを復活させます。",
    price: "12,800",
    duration: "約2時間",
  },
  {
    num: "05",
    name: "フルディテイリング",
    nameEn: "FULL DETAIL",
    description: "洗車・内装・磨き・コーティングをトータルケア。最高の仕上がりへ。",
    price: "49,800",
    duration: "約5時間",
  },
  {
    num: "06",
    name: "エンジンルーム洗浄",
    nameEn: "ENGINE BAY",
    description: "エンジン周りの油汚れ・ホコリを丁寧に洗浄。点検前にもおすすめ。",
    price: "9,800",
    duration: "約1時間",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-20 sm:py-32 bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-black/50 uppercase mb-4">
              SERVICES / メニュー
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-black">
              出張で、
              <br />
              <span className="bg-[#ffd500] px-2">すべて</span>そろう。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-black/65 leading-relaxed">
              手洗い洗車から本格コーティングまで、6つの出張メニュー。
              料金はすべて表示価格、追加請求は一切ありません。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
          {services.map((service) => (
            <div
              key={service.num}
              className="group relative bg-white p-8 hover:bg-black transition-colors cursor-pointer"
            >
              {service.tag && (
                <span className="absolute top-6 right-6 bg-[#ffd500] text-black text-[10px] font-black px-2.5 py-1 rounded-full">
                  {service.tag}
                </span>
              )}
              <div className="flex items-start justify-between mb-8">
                <span className="text-sm font-black text-black group-hover:text-[#ffd500] transition-colors tracking-wider">
                  {service.num}
                </span>
              </div>
              <p className="text-[10px] font-bold text-black/40 group-hover:text-white/40 tracking-widest mb-2 transition-colors">
                {service.nameEn}
              </p>
              <h3 className="text-2xl lg:text-3xl font-black text-black group-hover:text-white mb-3 transition-colors leading-tight">
                {service.name}
              </h3>
              <p className="text-sm text-black/70 group-hover:text-white/70 mb-8 leading-relaxed transition-colors min-h-[60px]">
                {service.description}
              </p>
              <div className="flex items-end justify-between pt-6 border-t border-black/10 group-hover:border-white/20 transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-black/50 group-hover:text-white/50 transition-colors mb-1">
                    {service.duration}
                  </p>
                  <p className="text-3xl font-black text-black group-hover:text-[#ffd500] transition-colors leading-none">
                    ¥{service.price}
                    <span className="text-xs ml-1 font-bold">〜</span>
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#ffd500] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-black/50 mt-8">
          ※ 表示価格は普通車（Mサイズ）の目安です。車種・サイズ・状態により変動する場合があります。
        </p>
      </div>
    </section>
  );
}
