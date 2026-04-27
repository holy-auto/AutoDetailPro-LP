const faqs = [
  {
    q: "マンションの駐車場でも利用できますか？",
    a: "はい、ご利用いただけます。プロは給水タンク・電源・撥水排水マットを完備しているため、水道や電源がない駐車場でも問題ありません。事前にマンション管理規約をご確認のうえ、ご予約ください。",
  },
  {
    q: "雨の日でもサービスは受けられますか？",
    a: "屋根付き駐車場であれば施工可能です。屋外駐車場の場合は、安全と仕上がり品質を担保するため、施工前後24時間以内に再降雨が予想される場合は無料で日程変更いただけます。",
  },
  {
    q: "予約から最短どのくらいで来てもらえますか？",
    a: "GPSマッチングにより、近くにオンラインのプロがいる場合、最短5分でお伺いできます。混雑時間帯は1〜2時間ほどお待ちいただく場合もあります。事前予約も可能です。",
  },
  {
    q: "車種・サイズによる料金の違いは？",
    a: "コンパクトカー（Sサイズ）は表示料金から-500円、SUVや3列シート車（L/XLサイズ）は+1,000〜3,000円となります。アプリで車種選択時に自動計算されます。",
  },
  {
    q: "支払い方法は？",
    a: "アプリ内のクレジットカード決済（Visa/Master/JCB/Amex）、Apple Pay、Google Pay、PayPay、d払いに対応しています。法人プランでは請求書払いも可能です。",
  },
  {
    q: "施工の品質に満足できなかった場合は？",
    a: "万が一仕上がりにご満足いただけない場合は、施工後24時間以内のご連絡で無料で再施工いたします。それでも解決しない場合は全額返金保証も用意しています。",
  },
  {
    q: "プロのキャンセルや遅延はありますか？",
    a: "プロ側都合のキャンセルが発生した場合は、自動で別のプロに再マッチング、もしくは全額返金＋次回1,000円OFFクーポンを発行します。",
  },
  {
    q: "法人で複数台の依頼は可能ですか？",
    a: "はい、法人プラン（請求書払い・複数台割引・専属プロ手配）をご用意しています。詳細はお問い合わせフォームからご相談ください。",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-20 sm:py-32 bg-[#f5f5f5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-bold tracking-[0.3em] text-black/50 uppercase mb-4">
              FAQ / よくある質問
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl font-black text-black mb-5">
              気になること、
              <br />
              <span className="bg-[#ffd500] px-2">ぜんぶ</span>
              。
            </h2>
            <p className="text-base text-black/65 leading-relaxed mb-8">
              ご利用前のご不明点は、こちらでチェック。
              さらに詳しく知りたい方は、お気軽にお問い合わせください。
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-black text-white font-black px-6 py-3 rounded-full text-sm hover:bg-[#ffd500] hover:text-black transition-colors"
            >
              お問い合わせ
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white rounded-2xl border-2 border-black/5 hover:border-black transition-colors overflow-hidden"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 p-6">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="shrink-0 w-8 h-8 bg-black text-[#ffd500] rounded-full flex items-center justify-center font-black text-sm">
                        Q
                      </span>
                      <h3 className="text-base lg:text-lg font-black text-black leading-snug pt-1">
                        {faq.q}
                      </h3>
                    </div>
                    <span className="faq-icon shrink-0 w-8 h-8 bg-[#ffd500] rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path d="M12 6v12M6 12h12" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pl-[72px]">
                    <div className="flex items-start gap-4">
                      <p className="text-sm lg:text-base text-black/70 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
