const benefits = [
  {
    title: "好きな時間に\n好きな場所で",
    description: "完全シフトフリー。本業の合間や休日だけの稼働もOKです。",
  },
  {
    title: "高単価・高還元",
    description: "業界最高水準の還元率。月収50万円以上の認定プロも多数。",
  },
  {
    title: "集客・決済すべて\nアプリにお任せ",
    description: "GPS自動マッチングで集客不要。決済・領収書もアプリで完結。",
  },
  {
    title: "認定研修・補償あり",
    description: "未経験でも研修プログラムで安心。施工中の保険補償も完備。",
  },
];

export default function ProRecruit() {
  return (
    <section id="pro-recruit" className="relative py-20 sm:py-32 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#ffd500] rounded-full opacity-15 blur-3xl pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#ffd500] uppercase mb-4">
              FOR PROS / プロ募集
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black mb-5">
              洗車・コーティングの
              <br />
              <span className="text-[#ffd500]">プロ</span>、募集中。
            </h2>
            <p className="text-base lg:text-lg text-white/75 mb-10 leading-relaxed max-w-xl">
              ディテイリングのスキルを、もっと自由に。もっと稼げる場所へ。
              Auto Detail Pro は、出張型カーケアの新しい働き方を提案します。
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#ffd500] transition-colors"
                >
                  <h3 className="text-base lg:text-lg font-black mb-2 whitespace-pre-line leading-tight">
                    {b.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-white/65 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-2 bg-[#ffd500] text-black font-black px-8 py-4 rounded-full hover:bg-white transition-colors"
              >
                プロ登録に申し込む
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-bold px-8 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
              >
                資料をダウンロード
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="bg-[#ffd500] text-black rounded-3xl p-8 lg:p-10 rotate-1">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-3">
                  EXAMPLE INCOME
                </p>
                <p className="text-sm font-black mb-2">月収シミュレーション</p>
                <p className="heading-tight text-display text-6xl lg:text-7xl font-black mb-2">
                  ¥520,000
                </p>
                <p className="text-xs text-black/70 mb-6">
                  ※ 週4日 / 1日3件稼働 / 平均単価12,000円の場合
                </p>
                <div className="space-y-2 text-sm border-t-2 border-black pt-5">
                  <div className="flex justify-between font-bold">
                    <span>稼働日数</span>
                    <span>16日 / 月</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>1日あたり</span>
                    <span>3件</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>平均単価</span>
                    <span>¥12,000</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>還元率</span>
                    <span>90%</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 bg-black text-[#ffd500] px-4 py-3 rounded-full rotate-[-6deg] shadow-xl">
                <p className="text-[10px] font-black leading-none">登録金</p>
                <p className="text-xl font-black leading-none mt-0.5">¥0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
