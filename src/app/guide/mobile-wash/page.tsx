import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/data/site";
import {
  articleLd,
  breadcrumbLd,
  buildPageMetadata,
  faqLd,
} from "@/lib/seo";

const PATH = "/guide/mobile-wash";
const TITLE =
  "出張洗車とは？料金相場・選び方・洗車機との違いを完全ガイド【2026年版】";
const DESCRIPTION =
  "出張洗車とは、洗車のプロが自宅やマンション駐車場まで出張し、手洗い洗車・コーティング・内装クリーニングを行うサービスです。料金相場、洗車機との違い、失敗しない業者の選び方を解説します。";
const PUBLISHED = "2026-04-21";
const MODIFIED = "2026-04-28";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

const guideFaqs = [
  {
    q: "出張洗車とは何ですか？",
    a: "出張洗車とは、洗車のプロがご自宅・マンション駐車場・職場・月極駐車場まで出張し、手洗い洗車・ガラスコーティング・内装クリーニング・ポリッシュ磨きなどを行うサービスです。お客様が車を動かさずにプロ品質のカーケアを受けられる点が、ガソリンスタンドの自動洗車機や来店型ディテイリング店舗との大きな違いです。",
  },
  {
    q: "出張洗車の料金相場はどれくらいですか？",
    a: "出張洗車の料金相場は、業界一般で手洗い洗車5,000〜10,000円、内装クリーニング8,000〜15,000円、ガラスコーティング50,000〜200,000円、フルディテイリング30,000〜100,000円が目安です。MobileWash は出張手洗い洗車3,980円〜、出張ガラスコーティング29,800円〜と、相場よりも手の届きやすい価格設定です。",
  },
  {
    q: "マンションの駐車場でも出張洗車は可能ですか？",
    a: "はい、可能です。MobileWash の認定プロは、給水タンク・電源・撥水排水マットを完備して伺うため、水道や電源がないマンション駐車場でも問題ありません。事前にマンション管理規約のご確認をお願いしています。",
  },
  {
    q: "出張洗車と洗車機、ディテイリング店舗の違いは？",
    a: "洗車機は手軽さと価格が魅力ですが、頑固な汚れは落ちきらず、コーティングも簡易的です。ディテイリング店舗は最高品質ですが、来店が必要で予約待ちも長め。出張洗車はその中間で、プロ品質のケアを駐車場で受けられる「時間と品質のバランス」が最大の特徴です。",
  },
  {
    q: "出張洗車業者の選び方のポイントは？",
    a: "①事前確定価格で追加料金がないか、②認定プロ・身元確認済みか、③再施工・全額返金などの保証があるか、④保険補償が付帯するか、⑤レビュー・評価が公開されているか、の5点を確認しましょう。MobileWash はすべての項目を標準で満たしています。",
  },
  {
    q: "雨の日でも出張洗車は受けられますか？",
    a: "屋根付き駐車場であれば施工可能です。屋外駐車場の場合、施工前後24時間以内に降雨が予想される場合は無料で日程変更いただけます。仕上がり品質を守るための運用です。",
  },
];

export default function GuideMobileWashPage() {
  const url = `${SITE.url}${PATH}`;
  const crumbs = [
    { name: "ホーム", href: "/" },
    { name: "ガイド", href: "/guide" },
    { name: "出張洗車とは", href: PATH },
  ];

  return (
    <>
      <JsonLd
        id="ld-guide-mobile-wash"
        data={[
          articleLd({
            title: TITLE,
            description: DESCRIPTION,
            url,
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
          }),
          faqLd(guideFaqs),
          breadcrumbLd(
            crumbs.map((c) => ({
              name: c.name,
              url: `${SITE.url}${c.href ?? ""}`,
            })),
          ),
        ]}
      />
      <Header />
      <main>
        <section className="pt-[108px] lg:pt-[122px] pb-12 bg-[#f7fbff] border-b border-[#e4eef7]">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="mb-5">
              <Breadcrumb items={crumbs} />
            </div>
            <p className="section-label mb-4 inline-flex">Guide</p>
            <h1 className="heading-tight text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0a2540] mb-5">
              出張洗車とは？料金相場・選び方・洗車機との違いを完全ガイド
            </h1>
            <p className="text-[15px] text-[#5a7090] leading-relaxed">
              洗車に行く時間がない、マンションで水が使えない、ディーラーコーティングは高額……
              そんな悩みを解決するのが
              <strong className="text-[#0a2540]">出張洗車</strong>
              です。本ガイドでは、出張洗車の基本・料金相場・洗車機やディテイリング店舗との違い・
              失敗しない業者の選び方を、2026年最新情報でわかりやすく解説します。
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-6 text-[12px] text-[#8ba0ba]">
              <span>公開日: {PUBLISHED}</span>
              <span>最終更新: {MODIFIED}</span>
              <span>カテゴリ: 出張洗車・カーケア</span>
            </div>
          </div>
        </section>

        <article className="py-14 sm:py-20 bg-white">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-10 prose-content">
            <nav
              aria-label="目次"
              className="bg-[#f7fbff] border border-[#e4eef7] rounded-2xl p-6 mb-12"
            >
              <p className="text-[12px] font-bold text-[#0099e6] tracking-widest mb-3">
                CONTENTS / 目次
              </p>
              <ol className="space-y-2 text-[13px] text-[#1a3658]">
                <li><a href="#what" className="hover:text-[#0099e6] hover:underline">1. 出張洗車とは何か</a></li>
                <li><a href="#merit" className="hover:text-[#0099e6] hover:underline">2. 出張洗車を選ぶ4つのメリット</a></li>
                <li><a href="#demerit" className="hover:text-[#0099e6] hover:underline">3. 出張洗車のデメリットと対処法</a></li>
                <li><a href="#price" className="hover:text-[#0099e6] hover:underline">4. 出張洗車の料金相場</a></li>
                <li><a href="#compare" className="hover:text-[#0099e6] hover:underline">5. 洗車機・ディテイリング店舗との違い</a></li>
                <li><a href="#choose" className="hover:text-[#0099e6] hover:underline">6. 失敗しない出張洗車業者の選び方</a></li>
                <li><a href="#flow" className="hover:text-[#0099e6] hover:underline">7. 利用の流れ</a></li>
                <li><a href="#faq" className="hover:text-[#0099e6] hover:underline">8. 出張洗車のよくある質問</a></li>
                <li><a href="#mobilewash" className="hover:text-[#0099e6] hover:underline">9. MobileWash で出張洗車を呼ぶ</a></li>
              </ol>
            </nav>

            <Section id="what" title="1. 出張洗車とは何か">
              <p>
                <strong>出張洗車</strong>とは、洗車のプロがご自宅・マンション駐車場・職場・月極駐車場まで出張し、
                手洗い洗車・ガラスコーティング・内装クリーニング・ポリッシュ磨きなどを行うサービスのことです。
                お客様が車を動かす必要がないため、忙しい方や駐車場の制約がある方に最適です。
              </p>
              <p>
                ガソリンスタンドの自動洗車機は手軽ですが、ブラシ式のため細かな汚れや水垢を落としきれません。
                来店型のディテイリング店舗は品質が高い反面、予約待ちや持ち込みの手間が発生します。
                <strong>出張洗車</strong>はこれらの中間で、駐車場でプロ品質の手洗い・コーティングを受けられる
                「時間と品質のバランス」がとれた選択肢として注目されています。
              </p>
            </Section>

            <Section id="merit" title="2. 出張洗車を選ぶ4つのメリット">
              <h3>2-1. 自宅駐車場・マンション・職場に居ながら洗車できる</h3>
              <p>
                共働きで週末は家族との時間を優先したい方、平日は深夜帰宅で洗車する余裕がない方でも、
                出張洗車なら待ち時間ゼロで愛車をプロの仕上がりに保てます。
                マンション駐車場・タワマン地下駐車場・月極駐車場・職場のパーキングなど、いつもの場所が施工現場になります。
              </p>

              <h3>2-2. 給水タンク完備で水道がない場所でもOK</h3>
              <p>
                MobileWash の認定プロは給水タンク・電源・撥水排水マットを完備して伺うため、
                水道や電源がない駐車場でも本格的な手洗いが可能です。
                マンションで「敷地内で水を使ってはいけない」「ホースが届かない」という方も、安心してご依頼いただけます。
              </p>

              <h3>2-3. プロの手洗いで洗車機より高品質</h3>
              <p>
                出張洗車のプロは、ピュアウォーターを使った2バケット洗車、マイクロファイバークロスでの拭き上げ、
                ホイールやドアミラー裏など細部までの手洗いを行います。
                洗車機のブラシでは落ちない水垢・鉄粉・虫の死骸も、人の手で丁寧に除去できます。
              </p>

              <h3>2-4. アプリ完結で予約から決済までスムーズ</h3>
              <p>
                MobileWash のような出張洗車アプリでは、予約・日時指定・決済・レビューがすべてアプリで完結。
                電話予約や現金支払いの煩わしさもなく、忙しい方ほど時短メリットが大きくなります。
              </p>
            </Section>

            <Section id="demerit" title="3. 出張洗車のデメリットと対処法">
              <h3>3-1. 雨天時は施工できない場合がある</h3>
              <p>
                屋外駐車場の場合、雨天時は仕上がり品質を担保できないため、施工が延期されることがあります。
                屋根付き駐車場であれば多くの場合施工可能です。MobileWash では雨天時の日程変更・再施工保証を提供しています。
              </p>

              <h3>3-2. 予約が混み合う時間帯がある</h3>
              <p>
                土日や月末は予約が集中する傾向があります。
                ご希望の日時で確実に依頼したい場合は、平日や事前予約のご利用がおすすめです。
              </p>

              <h3>3-3. マンション管理規約の確認が必要</h3>
              <p>
                マンションによっては、共用駐車場での洗車が禁止されている場合があります。
                ご利用前に管理規約や管理組合へのご確認をお願いします。
              </p>
            </Section>

            <Section id="price" title="4. 出張洗車の料金相場">
              <p>
                出張洗車・出張コーティングの料金相場は以下の通りです（2026年4月時点・普通車Mサイズ目安）。
                個人事業主や小規模業者よりも、出張洗車アプリ運営型の方が、効率化により低価格を実現する傾向があります。
              </p>
              <div className="overflow-x-auto -mx-4 px-4 my-6">
                <table className="w-full min-w-[560px] text-[13px] border border-[#e4eef7] rounded-2xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#f7fbff]">
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7]">メニュー</th>
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7]">業界一般相場</th>
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7] bg-[#f0f9ff]">MobileWash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { m: "出張手洗い洗車", g: "5,000〜10,000円", us: "3,980円〜" },
                      { m: "出張内装クリーニング", g: "8,000〜15,000円", us: "6,980円〜" },
                      { m: "出張ガラスコーティング", g: "50,000〜200,000円", us: "29,800円〜" },
                      { m: "出張ポリッシュ磨き", g: "15,000〜40,000円", us: "12,800円〜" },
                      { m: "フルディテイリング", g: "30,000〜100,000円", us: "49,800円〜" },
                      { m: "エンジンルーム洗浄", g: "10,000〜20,000円", us: "9,800円〜" },
                    ].map((row, i) => (
                      <tr key={row.m} className={i !== 5 ? "border-b border-[#e4eef7]" : ""}>
                        <td className="p-4 font-bold text-[#0a2540]">{row.m}</td>
                        <td className="p-4 text-[#5a7090]">{row.g}</td>
                        <td className="p-4 text-[#0099e6] font-bold bg-[#f0f9ff]">{row.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                価格だけで業者を選ぶと、追加料金請求や仕上がりに満足できないケースがあります。
                <strong>事前確定価格・認定プロ・保険補償</strong>の3点を必ず確認しましょう。
              </p>
            </Section>

            <Section id="compare" title="5. 洗車機・ディテイリング店舗との違い">
              <p>
                出張洗車・ガソリンスタンドの自動洗車機・来店型ディテイリング店舗、
                それぞれの違いを6項目で整理しました。
              </p>
              <div className="overflow-x-auto -mx-4 px-4 my-6">
                <table className="w-full min-w-[640px] text-[13px] border border-[#e4eef7] rounded-2xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#f7fbff]">
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7] w-[18%]">項目</th>
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7] bg-[#f0f9ff] text-[#0099e6]">出張洗車</th>
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7]">GS洗車機</th>
                      <th className="text-left p-4 font-bold border-b border-[#e4eef7]">ディテイリング店舗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { i: "場所", us: "駐車場へ出張", g: "GS店舗", s: "店舗持込" },
                      { i: "予約", us: "アプリ30秒・最短5分", g: "予約不要・並ぶ", s: "電話予約" },
                      { i: "品質", us: "プロ手洗い", g: "ブラシ自動", s: "プロ手洗い" },
                      { i: "コーティング", us: "本格対応", g: "簡易のみ", s: "本格対応" },
                      { i: "料金", us: "明朗会計", g: "数百円〜", s: "高額" },
                      { i: "決済", us: "アプリ自動", g: "現金・カード", s: "現金・カード" },
                    ].map((row, i) => (
                      <tr key={row.i} className={i !== 5 ? "border-b border-[#e4eef7]" : ""}>
                        <td className="p-4 font-bold bg-[#f7fbff] text-[#0a2540]">{row.i}</td>
                        <td className="p-4 bg-[#f0f9ff] text-[#0a2540] font-medium">{row.us}</td>
                        <td className="p-4 text-[#5a7090]">{row.g}</td>
                        <td className="p-4 text-[#5a7090]">{row.s}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="choose" title="6. 失敗しない出張洗車業者の選び方">
              <ol className="list-decimal pl-5 space-y-2">
                <li><strong>事前確定価格で追加料金がないか</strong> — 出張費・水道使用料などの後請求がないか確認しましょう。</li>
                <li><strong>認定プロ・身元確認済みか</strong> — 自宅まで来てもらうため、運営会社の認定基準・身元確認の有無は重要です。</li>
                <li><strong>再施工・全額返金などの保証があるか</strong> — 仕上がりに満足できなかった場合の救済策を確認しましょう。</li>
                <li><strong>施工中の保険補償が付帯するか</strong> — 万が一の事故・損傷に備えた保険が必要です。</li>
                <li><strong>レビュー・評価が公開されているか</strong> — 実績の透明性は信頼の指標になります。</li>
              </ol>
              <p className="mt-5">
                MobileWash はこれら5項目をすべて標準で満たし、
                出張洗車をはじめて利用される方でも安心してご依頼いただけます。
              </p>
            </Section>

            <Section id="flow" title="7. 利用の流れ">
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>アプリをダウンロード</strong> — App Store / Google Play から無料で。</li>
                <li><strong>メニューと日時を選ぶ</strong> — 出張洗車・コーティングなど。</li>
                <li><strong>プロが出張到着</strong> — GPSマッチングで最短5分。</li>
                <li><strong>施工完了・自動決済</strong> — アプリで決済、電子レシート発行。</li>
              </ol>
              <p className="mt-5">
                詳しくは<Link href="/#how-it-works" className="text-[#0099e6] hover:underline">ご利用の流れ</Link>をご覧ください。
              </p>
            </Section>

            <Section id="faq" title="8. 出張洗車のよくある質問">
              <ul className="space-y-5">
                {guideFaqs.map((f) => (
                  <li key={f.q}>
                    <h3 className="font-bold text-[#0a2540] mb-1">{f.q}</h3>
                    <p>{f.a}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="mobilewash" title="9. MobileWash で出張洗車を呼ぶ">
              <p>
                MobileWash は、出張洗車・出張コーティング専門のカーディテイリングアプリです。
                GPSで近くの認定プロを最短5分でマッチング、ご自宅・マンション駐車場・職場まで出張します。
                先行登録いただいた方には、リリース時に
                <strong>¥1,000 OFF クーポン</strong>をお届けします。
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/#cta" className="btn-primary text-[14px]">
                  先行登録する
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/#services" className="btn-outline text-[14px]">
                  サービスメニューを見る
                </Link>
              </div>
            </Section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-5 leading-snug">
        {title}
      </h2>
      <div className="text-[14px] lg:text-[15px] text-[#1a3658] leading-relaxed space-y-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[#0a2540] [&_h3]:mt-6 [&_h3]:mb-2 [&_strong]:text-[#0a2540]">
        {children}
      </div>
    </section>
  );
}
