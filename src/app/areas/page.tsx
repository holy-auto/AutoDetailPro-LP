import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { prefectures } from "@/data/prefectures";
import { SITE } from "@/data/site";
import { breadcrumbLd, buildPageMetadata } from "@/lib/seo";

const PATH = "/areas";
const TITLE = "出張洗車・出張コーティングの対応エリア一覧（全国47都道府県）";
const DESCRIPTION =
  "MobileWash の出張洗車・出張コーティング対応エリア一覧。首都圏（東京・神奈川・埼玉・千葉）、関西圏（大阪・京都・兵庫）、東海（愛知）でサービス提供中。47都道府県へ順次拡大中です。";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function AreasIndexPage() {
  const grouped = prefectures.reduce<Record<string, typeof prefectures>>((acc, p) => {
    acc[p.region] ??= [];
    acc[p.region].push(p);
    return acc;
  }, {});

  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "対応エリア", href: PATH },
  ];

  return (
    <>
      <JsonLd
        id="ld-areas"
        data={breadcrumbLd(
          crumbs.map((c) => ({ name: c.name, url: `${SITE.url}${c.href ?? ""}` })),
        )}
      />
      <Header />
      <main>
        <section className="pt-[108px] lg:pt-[122px] pb-12 bg-[#f7fbff] border-b border-[#e4eef7]">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="mb-5">
              <Breadcrumb items={crumbs} />
            </div>
            <p className="section-label mb-4 inline-flex">Service Area</p>
            <h1 className="heading-tight text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0a2540] mb-5">
              出張洗車・出張コーティングの対応エリア
            </h1>
            <p className="text-[15px] text-[#5a7090] leading-relaxed max-w-3xl">
              MobileWash の出張洗車・出張コーティングは、首都圏・関西圏・東海エリアでサービス提供中です。
              2026年内に全国47都道府県へ順次拡大予定。お住まいの都道府県をクリックすると、
              対応都市の詳細をご覧いただけます。
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
            {Object.entries(grouped).map(([region, prefs]) => (
              <div key={region}>
                <h2 className="text-2xl font-bold text-[#0a2540] mb-5">{region}</h2>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prefs.map((p) => (
                    <li key={p.slug} className="soft-card p-5">
                      <Link
                        href={`/areas/${p.slug}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-bold text-[#0a2540] group-hover:text-[#0099e6] transition-colors">
                            {p.name}の出張洗車
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === "active"
                                ? "bg-[#e6f4ff] text-[#0099e6]"
                                : "bg-[#f0f5fa] text-[#8ba0ba]"
                            }`}
                          >
                            {p.status === "active" ? "対応中" : "準備中"}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#5a7090] leading-relaxed mb-2">
                          {p.cities.slice(0, 5).join("・")} など
                        </p>
                        <span className="text-[12px] text-[#0099e6] font-bold inline-flex items-center gap-1">
                          詳細を見る
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
