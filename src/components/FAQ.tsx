import { faqs } from "@/data/faq";

export default function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-20 sm:py-28 bg-[#f7fbff]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="section-label mb-4 inline-flex">FAQ</p>
            <h2
              id="faq-heading"
              className="text-3xl sm:text-4xl font-bold text-[#0a2540] mb-4"
            >
              よくあるご質問
            </h2>
            <p className="text-[14px] text-[#5a7090] leading-relaxed mb-7">
              ご利用前のご不明点は、こちらでチェック。
              さらに詳しく知りたい方は、お気軽にお問い合わせください。
            </p>
            <a
              href="#"
              className="btn-outline text-[13px] px-5"
            >
              お問い合わせ
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="lg:col-span-8">
            <ul className="space-y-2">
              {faqs.map((faq, i) => (
                <li key={i}>
                  <details className="group bg-white border border-[#e4eef7] rounded-xl hover:border-[#cfdfee] transition-colors overflow-hidden">
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4 p-5 lg:p-6">
                      <div className="flex items-start gap-3.5 flex-1">
                        <span className="shrink-0 w-7 h-7 bg-[#e6f4ff] text-[#0099e6] rounded-full flex items-center justify-center font-bold text-[12px]">
                          Q
                        </span>
                        <h3 className="text-[14px] lg:text-[15px] font-bold text-[#0a2540] leading-snug pt-0.5">
                          {faq.q}
                        </h3>
                      </div>
                      <span className="faq-icon shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0">
                        <svg
                          className="w-4 h-4 text-[#5a7090]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 lg:px-6 pb-5 lg:pb-6 pl-[60px] lg:pl-[68px]">
                      <p className="text-[13px] lg:text-[14px] text-[#5a7090] leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
