import Link from "next/link";
import { prefectures } from "@/data/prefectures";

const benefits = [
  {
    title: "1. 自宅・マンション駐車場へ出張",
    body: "出張洗車の最大のメリットは、お客様が動かなくて良いこと。MobileWash の認定プロは給水タンク・電源・撥水排水マットを完備して伺うため、水道や電源がないマンション駐車場や月極駐車場でも、その場で本格的な手洗い洗車が可能です。",
  },
  {
    title: "2. プロ品質の手洗いとコーティング",
    body: "ガソリンスタンドの自動洗車機では落としきれない頑固な水垢・鉄粉・虫の死骸も、出張洗車のプロが手作業で丁寧に除去。ガラスコーティングや内装クリーニング、ポリッシュ磨きまで、ディテイリングメニューを駐車場で完結できます。",
  },
  {
    title: "3. 明朗会計と評価制で安心",
    body: "出張洗車サービスは料金が不透明だったり、業者の質にばらつきがあるのが課題。MobileWash は事前確定価格・追加料金なし、認定プロのみ・評価制で、はじめての方でも安心してご利用いただけます。",
  },
];

const compare = [
  { item: "予約・依頼", us: "アプリで30秒、最短5分到着", machine: "GSへ来店、混雑時は20分待ち", shop: "電話予約・店舗持込が必要" },
  { item: "洗い方", us: "認定プロによるピュアウォーター手洗い", machine: "ブラシ式の自動洗車", shop: "店舗ごとにバラつき" },
  { item: "場所", us: "自宅・マンション駐車場・職場", machine: "GS店舗のみ", shop: "店舗のみ" },
  { item: "料金（普通車）", us: "出張手洗い洗車 ¥3,980〜", machine: "¥500〜¥1,500", shop: "¥3,000〜¥5,000" },
  { item: "コーティング", us: "出張ガラスコーティング ¥29,800〜", machine: "簡易撥水コートのみ", shop: "¥30,000〜¥200,000" },
  { item: "決済", us: "アプリで自動決済・電子レシート", machine: "現地現金・カード", shop: "現地現金・カード" },
];

const cities = [
  "東京都新宿区", "東京都渋谷区", "東京都港区", "東京都世田谷区", "東京都品川区",
  "東京都目黒区", "東京都江東区", "東京都千代田区", "東京都中央区", "東京都豊島区",
  "横浜市西区", "横浜市中区", "横浜市青葉区", "川崎市中原区", "川崎市高津区",
  "さいたま市浦和区", "さいたま市大宮区", "千葉市中央区", "船橋市", "柏市",
  "大阪市中央区", "大阪市北区", "大阪市西区", "大阪市福島区", "大阪市天王寺区",
  "京都市中京区", "京都市左京区", "京都市右京区", "神戸市中央区", "神戸市灘区",
  "名古屋市中区", "名古屋市東区", "名古屋市千種区", "名古屋市昭和区", "名古屋市熱田区",
];

const serviceKeywords = [
  { name: "出張手洗い洗車", desc: "ピュアウォーターによる手洗い・拭き上げ・ホイール洗浄を駐車場で。" },
  { name: "出張ガラスコーティング", desc: "プロ施工のガラスコーティング。撥水・艶・ボディ保護を最大3年。" },
  { name: "出張内装クリーニング", desc: "シート・天井・フロアの徹底清掃と消臭・除菌を出張で。" },
  { name: "出張ポリッシュ磨き", desc: "小傷・くすみを磨き上げ、新車の輝きを駐車場で復活。" },
  { name: "出張フルディテイリング", desc: "洗車・内装・磨き・コーティングのトータルケアを出張で。" },
  { name: "出張エンジンルーム洗浄", desc: "油汚れ・ホコリを丁寧に洗浄、点検前にも最適。" },
];

export default function SeoContent() {
  return (
    <section
      id="about-mobile-wash"
      aria-labelledby="seo-content-heading"
      className="relative py-20 sm:py-28 bg-white border-t border-[#e4eef7]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-5">
            <p className="section-label mb-4 inline-flex">About Mobile Wash</p>
            <h2
              id="seo-content-heading"
              className="heading-tight text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0a2540] mb-5"
            >
              出張洗車とは。
              <br />
              そして MobileWash がめざすもの。
            </h2>
            <p className="text-[14px] text-[#5a7090] leading-relaxed">
              <strong className="text-[#0a2540]">出張洗車</strong>とは、洗車のプロが
              ご自宅や職場・マンション駐車場・月極駐車場まで出張し、
              手洗い洗車・コーティング・内装クリーニングなどを行うサービスです。
              ガソリンスタンドの洗車機や来店型のディテイリング店舗とは異なり、
              お客様が車を動かさなくても、いつもの駐車場でプロ品質のカーケアが受けられます。
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#f7fbff] border border-[#e4eef7] rounded-2xl p-6 lg:p-8">
              <p className="text-[12px] font-bold text-[#0099e6] tracking-widest mb-2">
                MOBILEWASH = 出張洗車 × アプリ × 認定プロ
              </p>
              <p className="text-[14px] text-[#5a7090] leading-relaxed mb-4">
                MobileWash は、出張洗車・出張コーティング専門の
                <strong className="text-[#0a2540]">カーディテイリングアプリ</strong>
                です。GPSで近くの認定プロを自動マッチングし、最短5分で駐車場まで
                出張。料金は事前確定の明朗会計、決済もアプリで完結します。
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-[13px] text-[#0a2540]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0099e6] font-bold">●</span>
                  GPSマッチングで最短5分の出張
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099e6] font-bold">●</span>
                  認定プロのみ・評価制で安心
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099e6] font-bold">●</span>
                  事前確定価格・追加料金なし
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099e6] font-bold">●</span>
                  アプリで決済・電子レシート発行
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-14">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-6">
            出張洗車を選ぶ3つのメリット
          </h3>
          <ul className="grid lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <li key={b.title} className="soft-card p-7">
                <h4 className="text-base font-bold text-[#0a2540] mb-3 leading-snug">
                  {b.title}
                </h4>
                <p className="text-[13px] text-[#5a7090] leading-relaxed">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-14">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
            出張洗車・洗車機・店舗洗車の違い
          </h3>
          <p className="text-[14px] text-[#5a7090] leading-relaxed mb-6 max-w-3xl">
            手軽さで選ぶなら洗車機、品質で選ぶなら出張洗車、最高品質を求めるならディテイリング店舗、と
            選択肢が広がっています。それぞれの特徴を6つの項目で整理しました。
          </p>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[640px] text-[13px] border border-[#e4eef7] rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-[#f7fbff] text-[#0a2540]">
                  <th className="text-left p-4 font-bold border-b border-[#e4eef7] w-[18%]">項目</th>
                  <th className="text-left p-4 font-bold border-b border-[#e4eef7] bg-white">
                    <span className="block text-[10px] text-[#0099e6] tracking-widest mb-0.5">RECOMMENDED</span>
                    出張洗車（MobileWash）
                  </th>
                  <th className="text-left p-4 font-bold border-b border-[#e4eef7]">GS自動洗車機</th>
                  <th className="text-left p-4 font-bold border-b border-[#e4eef7]">店舗ディテイリング</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row, i) => (
                  <tr
                    key={row.item}
                    className={i !== compare.length - 1 ? "border-b border-[#e4eef7]" : ""}
                  >
                    <td className="p-4 font-bold bg-[#f7fbff] text-[#0a2540]">{row.item}</td>
                    <td className="p-4 bg-[#f0f9ff] text-[#0a2540] font-medium">{row.us}</td>
                    <td className="p-4 text-[#5a7090]">{row.machine}</td>
                    <td className="p-4 text-[#5a7090]">{row.shop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-14">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
            出張洗車の料金相場と MobileWash の価格
          </h3>
          <p className="text-[14px] text-[#5a7090] leading-relaxed mb-6 max-w-3xl">
            出張洗車・出張コーティングの料金相場は、業界一般で
            <strong className="text-[#0a2540]">手洗い洗車 5,000〜10,000円、ガラスコーティング 50,000〜200,000円</strong>
            が目安です。MobileWash はアプリ運営による効率化で、相場よりも手の届きやすい価格を実現しました。
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {serviceKeywords.map((s) => (
              <li
                key={s.name}
                className="bg-white border border-[#e4eef7] rounded-2xl p-5"
              >
                <p className="font-bold text-[#0a2540] text-[14px] mb-1">{s.name}</p>
                <p className="text-[12px] text-[#5a7090] leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-[#8ba0ba] mt-4">
            ※ 詳しい料金は<Link href="/#services" className="text-[#0099e6] hover:underline">サービスメニュー</Link>と
            <Link href="/#plans" className="text-[#0099e6] hover:underline">料金プラン</Link>をご覧ください。
          </p>
        </div>

        <div className="mb-14">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
            出張洗車の対応エリア（都道府県別ページ）
          </h3>
          <p className="text-[14px] text-[#5a7090] leading-relaxed mb-6 max-w-3xl">
            MobileWash は首都圏・関西圏・東海エリアを中心に
            <strong className="text-[#0a2540]">全国47都道府県</strong>へ出張洗車サービスを順次拡大中です。
            お住まいのエリアの詳細ページから、対応状況をご確認いただけます。
          </p>
          <ul className="flex flex-wrap gap-2 mb-4">
            {prefectures.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/areas/${p.slug}`}
                  className={`inline-flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    p.status === "active"
                      ? "bg-[#e6f4ff] text-[#0099e6] border-[#0099e6]/20 hover:bg-[#0099e6] hover:text-white"
                      : "bg-white text-[#5a7090] border-[#e4eef7] hover:border-[#cfdfee]"
                  }`}
                >
                  {p.name}の出張洗車
                  {p.status === "active" && (
                    <span className="text-[9px] font-bold">●</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <details className="mt-4 text-[13px] text-[#5a7090]">
            <summary className="cursor-pointer text-[#0099e6] font-bold inline-flex items-center gap-1">
              主要都市の対応エリアを見る
            </summary>
            <ul className="flex flex-wrap gap-2 mt-3">
              {cities.map((c) => (
                <li
                  key={c}
                  className="text-[12px] text-[#5a7090] bg-[#f7fbff] border border-[#e4eef7] rounded px-2.5 py-1"
                >
                  {c}
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pt-10 border-t border-[#e4eef7]">
          <div>
            <h4 className="text-base font-bold text-[#0a2540] mb-2">
              出張洗車の決定版
            </h4>
            <p className="text-[13px] text-[#5a7090] leading-relaxed">
              出張洗車アプリを比較しても、MobileWash は
              GPSマッチングのスピード・認定プロのみによる品質保証・明朗会計で選ばれています。
              洗車機では落としきれない頑固な汚れも、プロの手洗いで丁寧に。
            </p>
            <Link
              href="/guide/mobile-wash"
              className="text-[13px] text-[#0099e6] font-bold hover:underline mt-2 inline-flex items-center gap-1"
            >
              出張洗車の詳しいガイドを読む
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#0a2540] mb-2">
              法人・複数台もお任せ
            </h4>
            <p className="text-[13px] text-[#5a7090] leading-relaxed">
              社用車のフリート管理、レンタカー営業所、カーディーラーの納車前洗車にも対応。
              請求書払い・複数台割引・専属プロ手配が可能な法人プランをご用意しています。
            </p>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#0a2540] mb-2">
              ディテイリングのプロ募集
            </h4>
            <p className="text-[13px] text-[#5a7090] leading-relaxed">
              洗車・コーティング技術をお持ちの方は、副業・独立どちらも歓迎。
              シフトフリー・還元率90%・集客自動化で、新しい働き方を提案します。
              現在、認定プロ第一期生を募集中です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
