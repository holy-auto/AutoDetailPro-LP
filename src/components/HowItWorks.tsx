const steps = [
  {
    step: "01",
    title: "アプリをダウンロード",
    description: "App Store または Google Play から無料でダウンロード。会員登録は60秒で完了。",
  },
  {
    step: "02",
    title: "サービスを選択",
    description: "外装洗車、コーティングなど、必要なサービスをアプリで選びましょう。",
  },
  {
    step: "03",
    title: "プロが出張",
    description: "GPSで近くのプロが自動マッチング。最短5分であなたの元へ到着します。",
  },
  {
    step: "04",
    title: "施工完了・お支払い",
    description: "施工完了後、アプリで簡単にお支払い。評価とレビューもお忘れなく。",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-32 bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] bg-[#ffd900] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="inline-block bg-[#ffd900] text-[#0a0a0a] text-xs font-black px-3 py-1.5 uppercase tracking-wider mb-6">
              HOW IT WORKS / 使い方
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black">
              使い方は、
              <br />
              <span className="text-[#ffd900]">かんたん</span>4ステップ。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-white/70 leading-relaxed">
              ダウンロードから施工完了まで、すべてアプリで完結。
              はじめての方でも、迷わずに使えます。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {steps.map((item, index) => (
            <div key={item.step} className="relative bg-[#0a0a0a] p-8 hover:bg-[#161616] transition-colors">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-6xl lg:text-7xl font-black text-[#ffd900] leading-none">
                  {item.step}
                </span>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex flex-1 items-center pb-2">
                    <div className="flex-1 h-px bg-[#ffd900]/30" />
                    <svg
                      className="w-4 h-4 text-[#ffd900]/50"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-xl lg:text-2xl font-black mb-3 leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#cta"
            className="group inline-flex items-center justify-center gap-2 bg-[#ffd900] text-[#0a0a0a] font-black px-8 py-4 hover:bg-white transition-colors"
          >
            今すぐアプリをダウンロード
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
