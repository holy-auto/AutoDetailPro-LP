import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Auto Detail Pro",
  description: "特定商取引法に基づく表記。",
  robots: { index: true, follow: true },
};

export default function TokushohoPage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-8">特定商取引法に基づく表記</h1>
          <p className="text-sm text-[#6b6b6b] mb-10">最終更新日: 2026年4月28日</p>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-6 text-sm sm:text-base">
            <Row label="販売事業者">Auto Detail Pro 運営事務局</Row>
            <Row label="運営責任者">追って公開いたします</Row>
            <Row label="所在地">追って公開いたします</Row>
            <Row label="連絡先">support@autodetailpro.jp</Row>
            <Row label="販売価格">アプリ内に表示する各サービス価格に従います</Row>
            <Row label="支払方法">
              クレジットカード、その他アプリ内で指定する決済手段
            </Row>
            <Row label="支払時期">サービス提供完了後、アプリ内で確定した時点で課金されます</Row>
            <Row label="サービス提供時期">予約時間に従いプロが現地にて施工します</Row>
            <Row label="返品・キャンセル">
              施工開始前のキャンセルは可能です。詳細はアプリ内ヘルプをご覧ください。
            </Row>
          </dl>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="font-black text-[#0a0a0a]">{label}</dt>
      <dd className="sm:col-span-2 text-[#0a0a0a]/80 leading-relaxed">{children}</dd>
    </>
  );
}
