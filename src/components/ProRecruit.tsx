import ProSignupForm from "@/components/ProSignupForm";

const benefits = [
  {
    title: "好きな時間に好きな場所で",
    description: "完全シフトフリー。本業の合間や休日だけの稼働もOKです。",
  },
  {
    title: "業界最高水準の還元率",
    description: "プラットフォーム手数料は最小限の10%。施工料金の90%が直接プロの収益になります。",
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
        <div className="rounded-3xl bg-gradient-to-br from-[#0a2540] via-[#0e2d52] to-[#143a6b] p-8 sm:p-12 lg:p-14 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#00b4ff] rounded-full opacity-15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#00d4b8] rounded-full opacity-10 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6 text-white">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] text-[#00b4ff] uppercase mb-4 bg-[#00b4ff]/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#00b4ff] rounded-full animate-pulse" />
                For Professionals / プロ募集中
              </p>
              <h2
                id="pro-heading"
                className="heading-tight text-3xl sm:text-4xl lg:text-[44px] font-bold mb-5 text-white"
              >
                洗車・コーティングの
                <br />
                <span className="text-[#00b4ff]">プロ</span>を募集しています
              </h2>
              <p className="text-[15px] text-white/80 mb-8 leading-relaxed max-w-xl">
                ディテイリングのスキルを、もっと自由に。もっと稼げる場所へ。
                MobileWash は、出張型カーケアの新しい働き方を提案します。
                <strong className="text-[#00b4ff]">全国47都道府県</strong>から認定プロ第一期生を募集中です。
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {benefits.map((b) => (
                  <li
                    key={b.title}
                    className="bg-white/8 border border-white/15 backdrop-blur rounded-2xl p-5"
                  >
                    <h3 className="text-sm font-bold mb-1.5 text-white">
                      {b.title}
                    </h3>
                    <p className="text-[12px] text-white/70 leading-relaxed">
                      {b.description}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="bg-white/8 border border-white/15 backdrop-blur rounded-2xl p-6 lg:p-7">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-[10px] font-bold tracking-[0.25em] text-[#00b4ff] uppercase">
                    Income Simulation
                  </p>
                  <span className="text-[10px] text-white/50">想定モデル</span>
                </div>
                <p className="heading-tight text-4xl lg:text-5xl font-bold text-white">
                  ¥520,000
                  <span className="text-base text-white/60 ml-2">/ 月</span>
                </p>
                <p className="text-[11px] text-white/60 mt-2 mb-4">
                  ※ 週4日 / 1日3件 / 単価¥12,000 / 還元率90% の場合の試算例
                </p>
                <dl className="grid grid-cols-2 gap-2 text-[12px] pt-4 border-t border-white/15">
                  <div className="flex justify-between">
                    <dt className="text-white/60">稼働日数</dt>
                    <dd className="font-bold text-white">16日 / 月</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">1日あたり</dt>
                    <dd className="font-bold text-white">3件</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">平均単価</dt>
                    <dd className="font-bold text-white">¥12,000</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/60">還元率</dt>
                    <dd className="font-bold text-[#00b4ff]">90%</dd>
                  </div>
                </dl>
                <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-[12px] text-white/60">登録金</span>
                  <span className="text-base font-bold text-[#00b4ff]">¥0</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <ProSignupForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
