const plans = [
  {
    name: "都度払い",
    nameEn: "PAY AS YOU GO",
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
    nameEn: "LIGHT MONTHLY",
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
    nameEn: "PREMIUM MONTHLY",
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
    <section id="plans" className="relative py-20 sm:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#0a2540]/50 uppercase mb-4">
            PLANS / 料金プラン
          </p>
          <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a2540] mb-5">
            ライフスタイルに、
            <br />
            合わせて<span className="bg-[#00b4ff] px-2">選ぶ</span>。
          </h2>
          <p className="text-base lg:text-lg text-[#0a2540]/65 max-w-2xl mx-auto leading-relaxed">
            「使いたい時だけ」も「毎週ピカピカ」も。
            <br className="hidden sm:inline" />
            あなたのカーライフに合わせて、ぴったりのプランをお選びいただけます。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 lg:p-10 flex flex-col ${
                plan.accent
                  ? "bg-[#0a2540] text-white"
                  : "bg-white border-2 border-[#0a2540]/10 text-[#0a2540]"
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-8 text-[11px] font-black px-3 py-1.5 rounded-full ${
                    plan.accent ? "bg-[#00b4ff] text-[#0a2540]" : "bg-[#0a2540] text-[#00b4ff]"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <p
                className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-3 ${
                  plan.accent ? "text-[#00b4ff]" : "text-[#0a2540]/40"
                }`}
              >
                {plan.nameEn}
              </p>
              <h3 className="text-2xl lg:text-3xl font-black mb-3">{plan.name}</h3>
              <p
                className={`text-sm mb-8 leading-relaxed ${
                  plan.accent ? "text-white/70" : "text-[#0a2540]/65"
                }`}
              >
                {plan.description}
              </p>

              <div className="mb-8 pb-8 border-b border-current/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">¥</span>
                  <span className="text-6xl font-black tracking-tighter leading-none">
                    {plan.price}
                  </span>
                  <span
                    className={`text-base font-bold ml-1 ${
                      plan.accent ? "text-white/60" : "text-[#0a2540]/60"
                    }`}
                  >
                    {plan.unit}
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-2 ${
                    plan.accent ? "text-white/50" : "text-[#0a2540]/50"
                  }`}
                >
                  税込・出張料込み
                </p>
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm font-medium">
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        plan.accent ? "bg-[#00b4ff] text-[#0a2540]" : "bg-[#0a2540] text-[#00b4ff]"
                      }`}
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className={`block text-center font-black px-6 py-4 rounded-full transition-colors ${
                  plan.accent
                    ? "bg-[#00b4ff] text-[#0a2540] hover:bg-white"
                    : "bg-[#0a2540] text-white hover:bg-[#00b4ff] hover:text-[#0a2540]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#0a2540]/50 mt-8">
          ※ 定額プランはいつでも解約・プラン変更が可能です。最低契約期間はありません。
        </p>
      </div>
    </section>
  );
}
