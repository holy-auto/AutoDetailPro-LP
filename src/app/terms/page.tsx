import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "利用規約 | Auto Detail Pro",
  description: "Auto Detail Pro の利用規約。サービスのご利用条件等を定めます。",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-8">利用規約</h1>
          <p className="text-sm text-[#6b6b6b] mb-10">最終更新日: 2026年4月28日</p>

          <Section title="第1条（適用）">
            <p>
              本規約は、Auto Detail Pro（以下「本サービス」）の利用に関する一切の関係に適用されます。
              本サービスをご利用いただく際は、本規約に同意したものとみなします。
            </p>
          </Section>

          <Section title="第2条（事前登録）">
            <p>
              事前登録は、ご本人のメールアドレスを正確にご入力いただくことを前提とします。
              虚偽の情報による登録は禁止します。
            </p>
          </Section>

          <Section title="第3条（禁止事項）">
            <ul className="list-disc pl-6 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他者の権利・利益を侵害する行為</li>
              <li>本サービスを不正な目的で利用する行為</li>
            </ul>
          </Section>

          <Section title="第4条（免責）">
            <p>
              当社は、本サービスに関して利用者と第三者の間で生じた取引・連絡・紛争等について一切責任を負いません。
            </p>
          </Section>

          <Section title="第5条（規約の変更）">
            <p>
              当社は、必要と判断した場合、利用者に通知することなく本規約を変更できるものとします。
              変更後の規約は、本ページに掲載した時点で効力を生じます。
            </p>
          </Section>

          <Section title="第6条（準拠法・管轄）">
            <p>
              本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-3">{title}</h2>
      <div className="text-sm sm:text-base text-[#0a0a0a]/80 leading-relaxed">{children}</div>
    </section>
  );
}
