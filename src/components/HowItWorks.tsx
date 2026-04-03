const steps = [
  {
    step: "01",
    title: "アプリをダウンロード",
    description: "App Store または Google Play から無料でダウンロード。",
  },
  {
    step: "02",
    title: "サービスを選択",
    description: "外装洗車、コーティングなど、必要なサービスを選びましょう。",
  },
  {
    step: "03",
    title: "プロが出張",
    description: "GPSで近くのプロがマッチング。最短5分で到着します。",
  },
  {
    step: "04",
    title: "施工完了・お支払い",
    description: "施工完了後、アプリで簡単にお支払い。評価もお忘れなく。",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            使い方はかんたん
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            4つのステップで、プロのカーディテイリングを体験
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-0.5 bg-blue-200" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
