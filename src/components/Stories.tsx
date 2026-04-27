const stories = [
  {
    name: "佐藤 美咲さん",
    profile: "30代女性 / 東京都渋谷区",
    car: "トヨタ ヤリス",
    plan: "定額ライトプラン",
    headline:
      "マンション駐車場まで来てもらえる「革命」",
    text:
      "夫婦共働きで、週末は家族との時間が最優先。GSの洗車機に並ぶ気力すら残らない毎日でした。MobileWash を知ってからは月1回の定額プランで、仕事帰りに帰宅すると愛車がピカピカ。マンションの管理人さんも好意的で、すっかり生活の一部になっています。",
    color: "#e6f4ff",
  },
  {
    name: "山田 太郎さん",
    profile: "40代男性 / 神奈川県横浜市",
    car: "BMW 3シリーズ",
    plan: "出張ガラスコーティング",
    headline:
      "ディーラー20万円のコーティングが、3万円で新車超え",
    text:
      "BMW のディーラーで見積もりを取ったら20万円。さすがに躊躇していたところ、SNSで MobileWash を発見。3万円台で本格ガラスコーティングを依頼できて、仕上がりは新車以上の艶。プロの方の説明も丁寧で、コスパだけでなく安心感が桁違いでした。",
    color: "#e6fbf7",
  },
  {
    name: "鈴木 健一さん",
    profile: "30代男性 / 埼玉県さいたま市",
    car: "ホンダ ステップワゴン",
    plan: "出張内装クリーニング",
    headline:
      "子供の食べこぼしも、新車みたいにリセット",
    text:
      "5歳と2歳の子育てミニバンの内装は、見たくない汚れだらけ。普段は週末に少しずつ拭いていましたが、限界を感じてプロにお願いしました。シートの隙間まで丁寧に清掃してくれて、消臭・除菌込み。子供達も「車が新車になった！」と大喜びで、リピート確定です。",
    color: "#fff4e6",
  },
];

export default function Stories() {
  return (
    <section
      id="stories"
      aria-labelledby="stories-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <p className="section-label mb-4 inline-flex">Customer Stories</p>
            <h2
              id="stories-heading"
              className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-3"
            >
              ご利用のお客様の声
            </h2>
            <p className="text-[15px] text-[#5a7090] leading-relaxed max-w-xl">
              実際にご利用いただいたお客様から、日々たくさんの嬉しいご感想をいただいています。
            </p>
          </div>
          <a href="#" className="btn-outline text-[14px] shrink-0">
            すべての事例を見る
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <ul className="grid lg:grid-cols-3 gap-5">
          {stories.map((s, i) => (
            <li key={s.name} className="soft-card bg-white overflow-hidden flex flex-col">
              <div
                className="aspect-[16/10] flex items-center justify-center relative"
                style={{ background: s.color }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-5 left-5 text-[11px] font-bold text-[#0a2540]/60 tracking-widest"
                >
                  CASE {String(i + 1).padStart(2, "0")}
                </span>
                <svg
                  className="w-20 h-20 text-[#0a2540]/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4-1.5 1-2 4 1 4-1 2 2v3l-2 2H5l-1-2 1-1.5z" />
                  <circle cx="8" cy="16" r="1.5" />
                  <circle cx="16" cy="16" r="1.5" />
                </svg>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg
                      key={j}
                      className="w-3.5 h-3.5 text-[#f5b800]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <h3 className="text-base lg:text-lg font-bold text-[#0a2540] mb-3 leading-snug">
                  「{s.headline}」
                </h3>
                <p className="text-[13px] text-[#5a7090] leading-relaxed mb-5 flex-1">
                  {s.text}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#e4eef7]">
                  <div className="w-10 h-10 bg-[#e6f4ff] rounded-full flex items-center justify-center">
                    <span className="text-[#0099e6] font-bold text-sm">
                      {s.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0a2540] truncate">{s.name}</p>
                    <p className="text-[11px] text-[#8ba0ba] truncate">
                      {s.profile} ・ {s.car}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-block bg-[#f0f9ff] text-[#0099e6] text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {s.plan}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
