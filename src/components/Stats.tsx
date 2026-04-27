const stats = [
  {
    value: "10,000",
    suffix: "+",
    label: "累計予約数",
    en: "BOOKINGS",
  },
  {
    value: "300",
    suffix: "+",
    label: "認定プロ登録数",
    en: "CERTIFIED PROS",
  },
  {
    value: "47",
    suffix: "都道府県",
    label: "対応エリア",
    en: "PREFECTURES",
  },
  {
    value: "4.8",
    suffix: "★",
    label: "平均満足度",
    en: "RATING",
  },
];

export default function Stats() {
  return (
    <section className="relative bg-white py-16 sm:py-20 border-b border-[#0a2540]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#0a2540]/50 uppercase mb-3">
            BY THE NUMBERS
          </p>
          <h2 className="heading-tight text-2xl sm:text-3xl lg:text-4xl font-black text-[#0a2540]">
            数字で見る、MobileWash。
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#0a2540]/10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white px-4 py-8 sm:py-10 text-center"
            >
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#0a2540] leading-none tracking-tighter">
                {s.value}
                <span className="text-2xl sm:text-3xl text-[#00b4ff] ml-1">
                  {s.suffix}
                </span>
              </p>
              <p className="text-sm font-black text-[#0a2540] mt-4">{s.label}</p>
              <p className="text-[10px] font-bold text-[#0a2540]/40 tracking-widest mt-1">
                {s.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
