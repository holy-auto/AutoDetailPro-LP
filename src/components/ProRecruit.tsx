const benefits = [
  {
    title: "好きな時間に好きな場所で",
    description: "完全シフトフリー。本業の合間や休日だけの稼働もOKです。",
  },
  {
    title: "業界最高水準の還元率",
    description: "プラットフォーム手数料は最小限。月収50万円以上の認定プロも多数活躍中。",
  },
  {
    title: "集客・決済はアプリにお任せ",
    description: "GPS自動マッチングで集客不要。決済・領収書もアプリで完結します。",
  },
  {
    title: "認定研修・保険補償あり",
    description: "未経験でも研修プログラムで安心。施工中の保険補償も完備しています。",
  },
];

export default function ProRecruit() {
  return (
    <section
      id="pro-recruit"
      aria-labelledby="pro-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#0a2540] via-[#0e2d52] to-[#143a6b] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#00b4ff] rounded-full opacity-10 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#00b4ff] uppercase mb-4">
                ── For Professionals
              </p>
              <h2
                id="pro-heading"
                className="heading-tight text-3xl sm:text-4xl lg:text-[44px] font-bold mb-5"
              >
                洗車・コーティングのプロを募集しています
              </h2>
              <p className="text-[15px] text-white/75 mb-10 leading-relaxed max-w-xl">
                ディテイリングのスキルを、もっと自由に。もっと稼げる場所へ。
                MobileWash は、出張型カーケアの新しい働き方を提案します。
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 mb-10">
                {benefits.map((b) => (
                  <li
                    key={b.title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >
                    <h3 className="text-sm font-bold mb-1.5 text-white">
                      {b.title}
                    </h3>
                    <p className="text-[12px] text-white/65 leading-relaxed">
                      {b.description}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#0a2540] font-bold px-7 py-3.5 rounded-full hover:bg-[#e6f4ff] transition-colors text-[14px]"
                >
                  プロ登録に申し込む
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-bold px-7 py-3.5 rounded-full border border-white/30 hover:bg-white/10 transition-colors text-[14px]"
                >
                  資料ダウンロード
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-7 lg:p-8 text-[#0a2540] soft-shadow-lg">
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#0099e6] uppercase mb-2">
                  Example Income
                </p>
                <p className="text-sm font-bold mb-3 text-[#5a7090]">
                  認定プロの月収シミュレーション
                </p>
                <p className="heading-tight text-5xl lg:text-6xl font-bold mb-2 text-[#0a2540]">
                  ¥520,000
                </p>
                <p className="text-[11px] text-[#8ba0ba] mb-6">
                  ※ 週4日 / 1日3件稼働 / 平均単価12,000円の場合
                </p>
                <dl className="space-y-2.5 text-[13px] border-t border-[#e4eef7] pt-5">
                  <div className="flex justify-between">
                    <dt className="text-[#5a7090]">稼働日数</dt>
                    <dd className="font-bold">16日 / 月</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5a7090]">1日あたり</dt>
                    <dd className="font-bold">3件</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5a7090]">平均単価</dt>
                    <dd className="font-bold">¥12,000</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5a7090]">還元率</dt>
                    <dd className="font-bold text-[#0099e6]">90%</dd>
                  </div>
                </dl>
                <div className="mt-5 pt-5 border-t border-[#e4eef7] flex items-center justify-between">
                  <span className="text-[12px] text-[#5a7090]">登録金</span>
                  <span className="text-base font-bold text-[#0099e6]">¥0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
