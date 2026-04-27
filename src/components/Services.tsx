const services = [
  {
    num: "01",
    name: "外装洗車",
    nameEn: "EXTERIOR WASH",
    description: "手洗いで丁寧に汚れを落とし、輝くボディへ仕上げます。",
    price: "3,000",
  },
  {
    num: "02",
    name: "内装クリーニング",
    nameEn: "INTERIOR CLEAN",
    description: "シート、ダッシュボード、フロアを徹底的に清掃します。",
    price: "5,000",
  },
  {
    num: "03",
    name: "コーティング",
    nameEn: "COATING",
    description: "ガラスコーティングで長期間、輝きとボディを保護します。",
    price: "15,000",
  },
  {
    num: "04",
    name: "ポリッシュ磨き",
    nameEn: "POLISH",
    description: "小傷やくすみを丁寧に磨き上げ、新車の輝きを復活させます。",
    price: "10,000",
  },
  {
    num: "05",
    name: "フルディテイル",
    nameEn: "FULL DETAIL",
    description: "内外装をトータルケア。最高の仕上がりをお届けします。",
    price: "25,000",
  },
  {
    num: "06",
    name: "エンジンルーム",
    nameEn: "ENGINE ROOM",
    description: "エンジン周りの汚れも丁寧にクリーニングします。",
    price: "8,000",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-20 sm:py-32 bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="inline-block bg-[#0a0a0a] text-[#ffd900] text-xs font-black px-3 py-1.5 uppercase tracking-wider mb-6">
              SERVICES / サービス
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a0a0a]">
              あなたの車に
              <br />
              <span className="bg-[#ffd900] px-2">最適</span>なサービスを。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-[#6b6b6b] leading-relaxed">
              洗車からフルディテイルまで、6つのカテゴリから選べます。
              料金はすべて明朗会計、追加料金は一切いただきません。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#0a0a0a]">
          {services.map((service) => (
            <div
              key={service.num}
              className="group relative bg-white p-8 hover:bg-[#0a0a0a] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-10">
                <span className="text-sm font-black text-[#0a0a0a] group-hover:text-[#ffd900] transition-colors tracking-wider">
                  {service.num}
                </span>
                <span className="text-xs font-bold text-[#0a0a0a]/40 group-hover:text-white/40 transition-colors tracking-widest">
                  {service.nameEn}
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-[#0a0a0a] group-hover:text-white mb-3 transition-colors">
                {service.name}
              </h3>
              <p className="text-sm text-[#0a0a0a]/70 group-hover:text-white/70 mb-8 leading-relaxed transition-colors">
                {service.description}
              </p>
              <div className="flex items-end justify-between pt-6 border-t border-[#0a0a0a]/10 group-hover:border-white/20 transition-colors">
                <div>
                  <p className="text-[10px] font-bold text-[#0a0a0a]/50 group-hover:text-white/50 transition-colors mb-1">
                    料金
                  </p>
                  <p className="text-2xl font-black text-[#0a0a0a] group-hover:text-[#ffd900] transition-colors">
                    ¥{service.price}
                    <span className="text-xs ml-1 font-bold">〜</span>
                  </p>
                </div>
                <div className="w-10 h-10 bg-[#ffd900] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-[#0a0a0a]"
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
      </div>
    </section>
  );
}
