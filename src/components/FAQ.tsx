import { faqs } from "@/data/faq";

export default function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative py-20 sm:py-32 bg-[#f5f5f5]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#0a2540]/50 uppercase mb-4">
              FAQ / よくある質問
            </p>
            <h2
              id="faq-heading"
              className="heading-tight text-4xl sm:text-5xl font-black text-[#0a2540] mb-5"
            >
              気になること、
              <br />
              <span className="bg-[#00b4ff] px-2">ぜんぶ</span>
              。
            </h2>
            <p className="text-base text-[#0a2540]/65 leading-relaxed mb-8">
              ご利用前のご不明点は、こちらでチェック。
              さらに詳しく知りたい方は、お気軽にお問い合わせください。
            </p>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 bg-[#0a2540] text-white font-black px-6 py-3 rounded-full text-sm hover:bg-[#00b4ff] hover:text-[#0a2540] transition-colors"
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
                  className="group bg-white rounded-2xl border-2 border-[#0a2540]/5 hover:border-[#0a2540] transition-colors overflow-hidden"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 p-6">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="shrink-0 w-8 h-8 bg-[#0a2540] text-[#00b4ff] rounded-full flex items-center justify-center font-black text-sm">
                        Q
                      </span>
                      <h3 className="text-base lg:text-lg font-black text-[#0a2540] leading-snug pt-1">
                        {faq.q}
                      </h3>
                    </div>
                    <span className="faq-icon shrink-0 w-8 h-8 bg-[#00b4ff] rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-[#0a2540]"
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
                      <p className="text-sm lg:text-base text-[#0a2540]/70 leading-relaxed">
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
