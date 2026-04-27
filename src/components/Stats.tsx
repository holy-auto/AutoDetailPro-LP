const stats = [
  { value: "10,000", suffix: "+", label: "累計予約数" },
  { value: "300", suffix: "+", label: "認定プロ登録数" },
  { value: "47", suffix: "都道府県", label: "対応エリア" },
  { value: "4.8", suffix: "★", label: "平均満足度" },
];

export default function Stats() {
  return (
    <section
      aria-label="数字で見るMobileWash"
      className="relative bg-[#f7fbff] py-14 sm:py-20 border-y border-[#e4eef7]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <p className="section-label mb-3">By the Numbers</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540]">
            選ばれている理由は、数字が語ります
          </h2>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dd className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0a2540] leading-none tracking-tight">
                {s.value}
                <span className="text-xl sm:text-2xl text-[#0099e6] ml-1 font-bold">
                  {s.suffix}
                </span>
              </dd>
              <dt className="text-[13px] sm:text-sm font-medium text-[#5a7090] mt-3">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
