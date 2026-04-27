const testimonials = [
  {
    name: "佐藤 美咲",
    role: "東京都渋谷区 / 30代女性",
    car: "トヨタ ヤリス",
    service: "出張手洗い洗車",
    rating: 5,
    text: "マンションの駐車場に来てもらえるなんて、革命でした。仕事から帰ってきたら愛車がピカピカ。月1回の定額プランで習慣化しています。",
  },
  {
    name: "山田 太郎",
    role: "神奈川県横浜市 / 40代男性",
    car: "BMW 3シリーズ",
    service: "出張ガラスコーティング",
    rating: 5,
    text: "ディーラーで20万円と言われたコーティングが、Auto Detail Pro なら3万円台。仕上がりは新車以上。プロの腕前に感動しました。",
  },
  {
    name: "鈴木 健一",
    role: "埼玉県さいたま市 / 30代パパ",
    car: "ホンダ ステップワゴン",
    service: "出張内装クリーニング",
    rating: 5,
    text: "子供の食べこぼしで悲惨だった内装が見違えるほど綺麗に。シートの匂いも消えて、家族みんな驚いていました。",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-black/50 uppercase mb-4">
              VOICE / お客様の声
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-black">
              選ばれている、
              <br />
              <span className="bg-[#ffd500] px-2">確かな</span>理由。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-black/65 leading-relaxed">
              ご利用いただいたお客様から、たくさんのご好評をいただいています。
              リアルな声をぜひご覧ください。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <div
              key={t.name}
              className="relative bg-white border-2 border-black rounded-3xl p-8 hover:bg-black hover:text-white transition-colors group"
            >
              <span className="absolute top-4 right-7 text-7xl font-black text-[#ffd500] leading-none">
                &ldquo;
              </span>

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-black text-black group-hover:text-[#ffd500] transition-colors tracking-wider">
                    CASE / {String(idx + 1).padStart(2, "0")}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 bg-[#ffd500] text-black text-[10px] font-black px-2.5 py-1 rounded-full mb-4">
                  {t.service}
                </div>

                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-[#ffd500]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-black group-hover:text-white text-base leading-relaxed mb-8 transition-colors">
                  {t.text}
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-black/10 group-hover:border-white/20 transition-colors">
                  <div className="w-11 h-11 bg-[#ffd500] rounded-full flex items-center justify-center">
                    <span className="text-black font-black text-base">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-black group-hover:text-white text-sm transition-colors">
                      {t.name}
                    </p>
                    <p className="text-black/60 group-hover:text-white/60 text-[11px] transition-colors truncate">
                      {t.role} ・ {t.car}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
