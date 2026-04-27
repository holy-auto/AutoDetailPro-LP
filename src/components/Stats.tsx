import LiveCounter from "@/components/LiveCounter";
import { getSiteStats } from "@/lib/stats";

export const revalidate = 120;

export default async function Stats() {
  const stats = await getSiteStats();
  const updated = new Date(stats.fetchedAt).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items = [
    {
      label: "事前登録者数",
      hint: "リリース時に¥1,000 OFFをお届け",
      value: stats.waitlist,
      suffix: "名",
      live: true,
    },
    {
      label: "認定プロ登録数",
      hint: "現在募集中・順次審査中",
      value: stats.pros,
      suffix: "名",
      live: true,
    },
    {
      label: "対応予定エリア",
      hint: "順次拡大中・全国47都道府県へ",
      value: stats.prefecturesActive,
      suffix: " / 47都道府県",
      live: false,
    },
    {
      label: "施工実績",
      hint: "正式ローンチ後にカウント開始",
      value: stats.bookings,
      suffix: "件",
      live: false,
    },
  ];

  return (
    <section
      aria-label="数字で見るMobileWash"
      className="relative bg-[#f7fbff] py-14 sm:py-20 border-y border-[#e4eef7]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <p className="section-label mb-3">By the Numbers</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-2">
            数字で見る MobileWash
          </h2>
          <p className="text-[13px] text-[#5a7090]">
            現在ローンチ準備中。実績ではなく、いま誠実にお伝えできる数字を公開しています。
          </p>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#e4eef7] rounded-2xl overflow-hidden border border-[#e4eef7]">
          {items.map((s) => (
            <div
              key={s.label}
              className="bg-white px-5 py-7 sm:py-9 text-center relative"
            >
              {s.live && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-bold text-[#0a8f7c] bg-[#e6fbf7] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#0a8f7c] rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
              <dd className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0a2540] leading-none tracking-tight tabular-nums">
                <LiveCounter target={s.value} />
                <span className="text-base sm:text-lg text-[#0099e6] ml-1 font-bold">
                  {s.suffix}
                </span>
              </dd>
              <dt className="text-[13px] font-bold text-[#0a2540] mt-3">
                {s.label}
              </dt>
              <p className="text-[11px] text-[#8ba0ba] mt-1.5 leading-snug">
                {s.hint}
              </p>
            </div>
          ))}
        </dl>

        <p className="text-center text-[11px] text-[#8ba0ba] mt-6">
          ※ 事前登録者数・認定プロ登録数はSupabaseから取得しているリアルタイムカウンターです。
          {stats.fetchedAt !== new Date(0).toISOString() && (
            <span className="ml-1">最終更新: {updated}</span>
          )}
        </p>
      </div>
    </section>
  );
}
