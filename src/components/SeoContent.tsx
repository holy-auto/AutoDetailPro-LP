const cities = [
  "東京都新宿区",
  "東京都渋谷区",
  "東京都港区",
  "東京都世田谷区",
  "東京都品川区",
  "東京都目黒区",
  "東京都江東区",
  "横浜市西区",
  "横浜市中区",
  "横浜市青葉区",
  "川崎市中原区",
  "さいたま市浦和区",
  "千葉市中央区",
  "大阪市中央区",
  "大阪市北区",
  "大阪市西区",
  "京都市中京区",
  "京都市左京区",
  "神戸市中央区",
  "名古屋市中区",
  "名古屋市東区",
  "名古屋市千種区",
];

const serviceKeywords = [
  { name: "出張手洗い洗車", desc: "ピュアウォーター手洗い・拭き上げ・ホイール洗浄" },
  { name: "出張ガラスコーティング", desc: "撥水・艶・ボディ保護を最大3年キープ" },
  { name: "出張内装クリーニング", desc: "シート・天井・フロアの徹底清掃と消臭・除菌" },
  { name: "出張ポリッシュ磨き", desc: "小傷・くすみを磨き上げて新車の輝きへ" },
  { name: "出張フルディテイリング", desc: "洗車・内装・磨き・コーティングのトータルケア" },
  { name: "出張エンジンルーム洗浄", desc: "油汚れ・ホコリを丁寧に洗浄、点検前にも最適" },
];

export default function SeoContent() {
  return (
    <section
      aria-labelledby="seo-content-heading"
      className="relative py-20 sm:py-24 bg-white border-t border-[#0a2540]/10"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#0a2540]/50 uppercase mb-4">
              ABOUT MOBILEWASH
            </p>
            <h2
              id="seo-content-heading"
              className="heading-tight text-3xl sm:text-4xl lg:text-5xl font-black text-[#0a2540] mb-6"
            >
              出張洗車・出張コーティングを、
              <br />
              アプリで<span className="bg-[#00b4ff] px-2">もっと身近に</span>。
            </h2>
            <div className="space-y-4 text-[#0a2540]/75 leading-relaxed text-sm lg:text-base">
              <p>
                MobileWash（モバイルウォッシュ）は、GPSマッチング型の
                <strong className="text-[#0a2540]">出張カーディテイリングアプリ</strong>
                です。スマートフォンから手洗い洗車・ガラスコーティング・内装クリーニング・フルディテイリングなどの専門サービスを予約すると、認定プロが給水タンクを携えて、ご自宅やマンションの駐車場、職場、月極駐車場まで出張して施工します。
              </p>
              <p>
                ガソリンスタンドの洗車機や専門ディテイリング店舗まで車を持ち込む手間と待ち時間が発生しません。
                予約はアプリで30秒、決済もアプリで自動完結。最短5分でプロが到着し、料金は事前確定の明朗会計、追加請求は一切ありません。
              </p>
              <p>
                マンションで水が使えない、共働きで時間がない、ディーラーコーティングは高額すぎる──そんな
                <strong className="text-[#0a2540]">愛車のお手入れに関するお悩み</strong>
                を、MobileWash がすべて解決します。月1回からの定額プラン「ライト」、毎週ピカピカの「プレミアム」、必要な時だけの「都度払い」と、ライフスタイルに合わせて選べる料金体系もご用意しています。
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#f0f9ff] rounded-3xl p-8 lg:p-10 border border-[#00b4ff]/20">
              <h3 className="text-xl lg:text-2xl font-black text-[#0a2540] mb-2">
                出張カーディテイリングのサービスメニュー
              </h3>
              <p className="text-sm text-[#0a2540]/65 mb-6">
                すべて出張対応・税込・追加料金なし
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {serviceKeywords.map((s) => (
                  <li
                    key={s.name}
                    className="bg-white rounded-2xl p-4 border border-[#0a2540]/5"
                  >
                    <p className="font-black text-[#0a2540] text-sm mb-1">
                      {s.name}
                    </p>
                    <p className="text-xs text-[#0a2540]/60 leading-relaxed">
                      {s.desc}
                    </p>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl lg:text-2xl font-black text-[#0a2540] mb-2">
                対応エリア（主要都市の例）
              </h3>
              <p className="text-sm text-[#0a2540]/65 mb-5">
                首都圏・関西圏・東海エリアで順次拡大中。
                出張手洗い洗車・出張コーティングは下記エリアにて即日予約可能です。
              </p>
              <ul className="flex flex-wrap gap-2 mb-2">
                {cities.map((c) => (
                  <li
                    key={c}
                    className="text-xs font-bold text-[#0a2540] bg-white border border-[#0a2540]/10 rounded-full px-3 py-1.5"
                  >
                    {c}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#0a2540]/50 mt-4 leading-relaxed">
                ※ 上記以外のエリアにお住まいの方も、アプリで郵便番号を入力すると最新の対応状況が確認できます。
                対応エリアは2026年中に全国47都道府県へ拡大予定です。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid lg:grid-cols-3 gap-6 pt-10 border-t border-[#0a2540]/10">
          <div>
            <h3 className="text-base font-black text-[#0a2540] mb-2">
              洗車アプリの新しいスタンダード
            </h3>
            <p className="text-sm text-[#0a2540]/70 leading-relaxed">
              出張洗車アプリを比較しても、MobileWash は
              GPSマッチングのスピード・認定プロのみによる品質保証・明朗会計で選ばれています。
              洗車機では落としきれない頑固な汚れも、プロの手洗いで丁寧に。
            </p>
          </div>
          <div>
            <h3 className="text-base font-black text-[#0a2540] mb-2">
              法人・複数台もお任せ
            </h3>
            <p className="text-sm text-[#0a2540]/70 leading-relaxed">
              社用車のフリート管理、レンタカー営業所、カーディーラーの納車前洗車にも対応。
              請求書払い・複数台割引・専属プロ手配が可能な法人プランをご用意しています。
            </p>
          </div>
          <div>
            <h3 className="text-base font-black text-[#0a2540] mb-2">
              ディテイリングのプロ募集
            </h3>
            <p className="text-sm text-[#0a2540]/70 leading-relaxed">
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
