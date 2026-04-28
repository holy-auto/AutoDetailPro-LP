import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import LiveCounter from "@/components/LiveCounter";
import { getPrefecture, prefectures } from "@/data/prefectures";
import { faqs } from "@/data/faq";
import { SITE } from "@/data/site";
import { getSiteStats } from "@/lib/stats";
import {
  breadcrumbLd,
  buildPageMetadata,
  faqLd,
} from "@/lib/seo";

export const dynamicParams = false;
export const revalidate = 600;

type Params = { params: Promise<{ prefecture: string }> };

export function generateStaticParams() {
  return prefectures.map((p) => ({ prefecture: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { prefecture } = await params;
  const pref = getPrefecture(prefecture);
  if (!pref) return {};

  const title = `${pref.name}の出張洗車・出張コーティングなら MobileWash`;
  const description = `${pref.name}（${pref.cities.slice(0, 4).join("・")}など）で出張洗車・出張コーティングをお探しなら MobileWash。GPSで近くの認定プロを最短5分でマッチング、駐車場まで出張で手洗い洗車・ガラスコーティング・内装クリーニングをご提供します。${pref.description}`;

  return buildPageMetadata({
    title,
    description,
    path: `/areas/${pref.slug}`,
  });
}

export default async function AreaPage({ params }: Params) {
  const { prefecture } = await params;
  const pref = getPrefecture(prefecture);
  if (!pref) return notFound();

  const stats = await getSiteStats();
  const url = `${SITE.url}/areas/${pref.slug}`;
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "対応エリア", href: "/areas" },
    { name: pref.name, href: `/areas/${pref.slug}` },
  ];

  const services = [
    { name: `${pref.name}の出張手洗い洗車`, price: "3,980", duration: "約45分" },
    { name: `${pref.name}の出張内装クリーニング`, price: "6,980", duration: "約90分" },
    { name: `${pref.name}の出張ガラスコーティング`, price: "29,800", duration: "約3時間" },
    { name: `${pref.name}の出張ポリッシュ磨き`, price: "12,800", duration: "約2時間" },
    { name: `${pref.name}のフルディテイリング`, price: "49,800", duration: "約5時間" },
    { name: `${pref.name}のエンジンルーム洗浄`, price: "9,800", duration: "約1時間" },
  ];

  return (
    <>
      <JsonLd
        id={`ld-area-${pref.slug}`}
        data={[
          breadcrumbLd(
            crumbs.map((c) => ({
              name: c.name,
              url: `${SITE.url}${c.href ?? ""}`,
            })),
          ),
          faqLd(faqs),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `${pref.name}の出張洗車・出張コーティング`,
            provider: { "@id": `${SITE.url}/#organization` },
            areaServed: {
              "@type": "AdministrativeArea",
              name: pref.name,
            },
            url,
            description: pref.description,
          },
        ]}
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
              {pref.name}の出張洗車・
              <br className="sm:hidden" />
              出張コーティング
            </h1>
            <p className="text-[15px] text-[#5a7090] leading-relaxed max-w-3xl">
              {pref.description}{" "}
              MobileWash は、出張洗車・出張コーティング専門のカーディテイリングアプリ。
              {pref.name}（{pref.cities.slice(0, 5).join("・")}）で
              <strong className="text-[#0a2540]">最短5分の出張</strong>と
              <strong className="text-[#0a2540]">明朗会計</strong>を実現します。
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span
                className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full ${
                  pref.status === "active"
                    ? "bg-[#e6f4ff] text-[#0099e6]"
                    : "bg-[#fff4e6] text-[#b36b00]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pref.status === "active" ? "bg-[#0099e6]" : "bg-[#b36b00]"} animate-pulse`} />
                {pref.status === "active" ? "出張対応中" : "サービス開始準備中"}
              </span>
              <span className="text-[12px] text-[#5a7090]">
                エリア: {pref.region}
              </span>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/#cta" className="btn-primary text-[14px]">
                先行登録する
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/#services" className="btn-outline text-[14px]">
                サービスメニュー
              </Link>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
              {pref.name}でご利用いただける出張カーケアメニュー
            </h2>
            <p className="text-[14px] text-[#5a7090] leading-relaxed mb-8 max-w-3xl">
              {pref.name}全域で、6つの出張カーケアメニューをご提供しています。
              料金は事前確定の明朗会計、追加請求は一切ありません。
            </p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <li key={s.name} className="soft-card p-6">
                  <h3 className="text-base font-bold text-[#0a2540] mb-2 leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-[12px] text-[#8ba0ba] mb-3">{s.duration}</p>
                  <p className="text-2xl font-bold text-[#0a2540] leading-none">
                    ¥{s.price}
                    <span className="text-xs ml-1 text-[#5a7090] font-medium">〜</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-[#f7fbff] border-y border-[#e4eef7]">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
              {pref.name}の対応都市・地域
            </h2>
            <p className="text-[14px] text-[#5a7090] leading-relaxed mb-6 max-w-3xl">
              下記の都市を中心に出張洗車・出張コーティングをご提供しています。
              記載のない地域も対応している場合がありますので、アプリで郵便番号を入力してご確認ください。
            </p>
            <ul className="flex flex-wrap gap-2">
              {pref.cities.map((c) => (
                <li
                  key={c}
                  className="text-[13px] font-bold text-[#0a2540] bg-white border border-[#e4eef7] rounded-full px-3 py-1.5"
                >
                  {pref.name}{c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-white">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-[#0a2540] mb-3">
                  {pref.name}での出張洗車のご利用シーン
                </h2>
                <ul className="space-y-3 text-[14px] text-[#5a7090] leading-relaxed">
                  <li>● マンション・タワマン地下駐車場での出張手洗い洗車</li>
                  <li>● 月極駐車場で水道がない場所での出張カーケア</li>
                  <li>● 共働きで土日も洗車する時間がないご家庭</li>
                  <li>● ディーラー見積もりが高額だったコーティングの代替</li>
                  <li>● 子どもの食べこぼしで汚れた内装の徹底クリーニング</li>
                  <li>● 法人の社用車・営業車のフリート管理</li>
                </ul>
              </div>
              <div className="bg-[#f7fbff] rounded-2xl p-7 border border-[#e4eef7]">
                <p className="text-[12px] font-bold text-[#0099e6] tracking-widest mb-3">
                  LIVE COUNTER
                </p>
                <p className="text-[13px] text-[#5a7090] mb-4">
                  {pref.name}を含む全国の累計
                </p>
                <dl className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-[13px] font-bold text-[#0a2540]">事前登録者数</dt>
                    <dd className="text-2xl font-bold text-[#0099e6] tabular-nums">
                      <LiveCounter target={stats.waitlist} />
                      <span className="text-sm ml-1">名</span>
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-[13px] font-bold text-[#0a2540]">認定プロ登録数</dt>
                    <dd className="text-2xl font-bold text-[#0099e6] tabular-nums">
                      <LiveCounter target={stats.pros} />
                      <span className="text-sm ml-1">名</span>
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/#cta"
                  className="block text-center bg-[#0099e6] hover:bg-[#0077b3] text-white font-bold py-3 rounded-full mt-6 text-[14px]"
                >
                  先行登録する
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-[#f7fbff] border-t border-[#e4eef7]">
          <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-2xl font-bold text-[#0a2540] mb-6">
              他のエリアの出張洗車を見る
            </h2>
            <ul className="flex flex-wrap gap-2">
              {prefectures
                .filter((p) => p.slug !== pref.slug)
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/areas/${p.slug}`}
                      className={`inline-flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                        p.status === "active"
                          ? "bg-white text-[#0099e6] border-[#0099e6]/20 hover:bg-[#0099e6] hover:text-white"
                          : "bg-white text-[#5a7090] border-[#e4eef7] hover:border-[#cfdfee]"
                      }`}
                    >
                      {p.name}の出張洗車
                    </Link>
                  </li>
                ))}
            </ul>
            <p className="mt-6 text-[13px] text-[#5a7090]">
              <Link href="/guide/mobile-wash" className="text-[#0099e6] hover:underline font-bold">
                出張洗車の詳しいガイドを読む →
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
