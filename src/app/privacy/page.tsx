import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Auto Detail Pro",
  description:
    "Auto Detail Pro のプライバシーポリシー。個人情報の取扱い、利用目的、第三者提供、開示請求等について説明します。",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-8">プライバシーポリシー</h1>
          <p className="text-sm text-[#6b6b6b] mb-10">最終更新日: 2026年4月28日</p>

          <Section title="1. 事業者">
            <p>
              Auto Detail Pro（以下「当社」）は、本サービスにおける個人情報の取扱いについて、
              個人情報の保護に関する法律（個人情報保護法）等の関係法令を遵守し、適切に取り扱います。
            </p>
          </Section>

          <Section title="2. 取得する情報">
            <ul className="list-disc pl-6 space-y-1">
              <li>事前登録時にご入力いただくメールアドレス</li>
              <li>アクセスログ、IPアドレス、Cookie 等の技術情報</li>
            </ul>
          </Section>

          <Section title="3. 利用目的">
            <ul className="list-disc pl-6 space-y-1">
              <li>サービスのリリース通知、関連情報の提供</li>
              <li>不正利用防止、品質改善のための統計分析</li>
              <li>お問い合わせ対応</li>
            </ul>
          </Section>

          <Section title="4. 第三者提供">
            <p>
              法令に基づく場合を除き、ご本人の同意なく第三者へ個人情報を提供することはありません。
              業務委託先に対しては、必要な範囲で適切な監督を行います。
            </p>
          </Section>

          <Section title="5. 安全管理措置">
            <p>
              個人情報への不正アクセス、紛失、破壊、改ざん、漏洩を防止するため、適切な安全管理措置を講じます。
            </p>
          </Section>

          <Section title="6. 開示・訂正・削除">
            <p>
              ご本人からの個人情報の開示・訂正・利用停止・削除のご請求には、合理的な範囲で速やかに対応します。
              下記お問い合わせ窓口までご連絡ください。
            </p>
          </Section>

          <Section title="7. お問い合わせ窓口">
            <p>privacy@autodetailpro.jp</p>
          </Section>

          <Section title="8. 改定">
            <p>
              本ポリシーは、必要に応じて改定されることがあります。改定後の内容は本ページに掲載した時点で効力を生じます。
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
