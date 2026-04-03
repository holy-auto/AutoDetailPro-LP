const services = [
  {
    emoji: "\ud83d\udca7",
    name: "外装洗車",
    description: "手洗いで丁寧に汚れを落とし、輝くボディへ",
    price: "\u00a53,000〜",
  },
  {
    emoji: "\u2728",
    name: "内装クリーニング",
    description: "シート、ダッシュボード、フロアを徹底清掃",
    price: "\u00a55,000〜",
  },
  {
    emoji: "\ud83d\udee1\ufe0f",
    name: "コーティング",
    description: "ガラスコーティングで長期間輝きを保護",
    price: "\u00a515,000〜",
  },
  {
    emoji: "\ud83d\udd27",
    name: "ポリッシュ磨き",
    description: "小傷やくすみを磨き上げ、新車の輝きを復活",
    price: "\u00a510,000〜",
  },
  {
    emoji: "\ud83c\udf1f",
    name: "フルディテイル",
    description: "内外装をトータルケア。最高の仕上がりへ",
    price: "\u00a525,000〜",
  },
  {
    emoji: "\u2699\ufe0f",
    name: "エンジンルーム",
    description: "エンジン周りの汚れを丁寧にクリーニング",
    price: "\u00a58,000〜",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            サービスカテゴリ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            あなたの車に合ったサービスをお選びください
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-4xl mb-4">{service.emoji}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <p className="text-primary font-bold text-lg">{service.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
