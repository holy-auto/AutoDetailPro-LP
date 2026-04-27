const plans = [
  {
    name: "都度払い",
    nameEn: "Pay as you go",
    description: "使いたいときだけ。試しに1回からご利用OK。",
    price: "3,980",
    unit: "〜 / 回",
    features: [
      "出張料金込み",
      "全メニューから選択可",
      "支払いはアプリで完結",
      "キャンセル料 24時間前まで無料",
    ],
    cta: "都度払いで予約",
    accent: false,
  },
  {
    name: "定額ライト",
    nameEn: "Light Monthly",
    description: "月1回の手洗い洗車で、いつもキレイをキープ。",
    price: "2,980",
    unit: "/ 月",
    badge: "20%お得",
    features: [
      "月1回 出張手洗い洗車込み",
      "オプション追加 10%OFF",
      "予約優先枠",
      "雨天時の再施工保証",
    ],
    cta: "ライトを始める",
    accent: false,
  },
  {
    name: "定額プレミアム",
    nameEn: "Premium Monthly",
    description: "毎週ピカピカ。法人・愛車家に選ばれる王道プラン。",
    price: "9,800",
    unit: "/ 月",
    badge: "人気No.1",
    features: [
      "月4回 出張手洗い洗車込み",
      "年1回 ガラスコーティング込み",
      "オプション追加 20%OFF",
      "深夜・早朝枠の優先予約",
      "専属プロ指名可",
    ],
    cta: "プレミアムを始める",
    accent: true,
  },
];

export default function Plans() {
  return (
    <section
      id="plans"
      aria-labelledby="plans-heading"
      className="py-20 sm:py-28 bg-[#f7fbff]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label mb-4 inline-flex">Plans</p>
          <h2
            id="plans-heading"
            className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-4"
          >
            ライフスタイルに合わせて選べる料金プラン
          </h2>
          <p className="text-[15px] text-[#5a7090] leading-relaxed">
            「使いたい時だけ」も「毎週ピカピカ」も。
            あなたのカーライフに合わせて、ぴったりのプランをお選びいただけます。
          </p>
        </div>

        <ul className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <li
              key={plan.name}
              className={`relative rounded-3xl p-8 lg:p-9 flex flex-col ${
                plan.accent
                  ? "bg-gradient-to-br from-[#0a2540] to-[#1a3658] text-white soft-shadow-lg"
                  : "bg-white border border-[#e4eef7] soft-shadow"
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
                    plan.accent
                      ? "bg-[#00b4ff] text-white"
                      : "bg-[#0099e6] text-white"
                  }`}
                >
                  ★ {plan.badge}
                </span>
              )}

              <p
                className={`text-[10px] font-bold tracking-[0.25em] uppercase mb-3 ${
                  plan.accent ? "text-[#00b4ff]" : "text-[#0099e6]"
                }`}
              >
                {plan.nameEn}
              </p>
              <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
              <p
                className={`text-[13px] mb-7 leading-relaxed ${
                  plan.accent ? "text-white/70" : "text-[#5a7090]"
                }`}
              >
                {plan.description}
              </p>

              <div
                className={`mb-7 pb-7 border-b ${
                  plan.accent ? "border-white/15" : "border-[#e4eef7]"
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">¥</span>
                  <span className="text-5xl font-bold tracking-tight leading-none">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm font-medium ml-1 ${
                      plan.accent ? "text-white/60" : "text-[#5a7090]"
                    }`}
                  >
                    {plan.unit}
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-2 ${
                    plan.accent ? "text-white/50" : "text-[#8ba0ba]"
                  }`}
                >
                  税込・出張料込み
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <span
                      className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-1 ${
                        plan.accent
                          ? "bg-[#00b4ff] text-white"
                          : "bg-[#e6f4ff] text-[#0099e6]"
                      }`}
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`block text-center font-bold px-6 py-3.5 rounded-full transition-colors text-sm ${
                  plan.accent
                    ? "bg-[#00b4ff] text-white hover:bg-white hover:text-[#0a2540]"
                    : "bg-[#0099e6] text-white hover:bg-[#0077b3]"
                }`}
              >
                {plan.cta}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-center text-[12px] text-[#8ba0ba] mt-8">
          ※ 定額プランはいつでも解約・プラン変更が可能です。最低契約期間はありません。
        </p>
      </div>
    </section>
  );
}
