const testimonials = [
  {
    name: "佐藤 美咲",
    role: "東京都渋谷区",
    rating: 5,
    text: "仕事帰りにサクッと予約できて、翌日にはピカピカになってました。忙しい方におすすめ！",
  },
  {
    name: "山田 太郎",
    role: "神奈川県横浜市",
    rating: 5,
    text: "コーティングをお願いしました。プロの技術が素晴らしく、新車のような輝きに感動しました。",
  },
  {
    name: "鈴木 健一",
    role: "埼玉県さいたま市",
    rating: 5,
    text: "子供の食べこぼしで汚れた内装が見違えるほど綺麗に。今では定期的に利用しています。",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
          <div className="lg:col-span-7">
            <p className="inline-block bg-[#0a0a0a] text-[#ffd900] text-xs font-black px-3 py-1.5 uppercase tracking-wider mb-6">
              VOICE / お客様の声
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-6xl font-black text-[#0a0a0a]">
              選ばれている、
              <br />
              <span className="bg-[#ffd900] px-2">確かな</span>理由。
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base lg:text-lg text-[#6b6b6b] leading-relaxed">
              ご利用いただいたお客様から、たくさんのご好評をいただいています。
              リアルな声をぜひご覧ください。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={t.name}
              className="relative bg-white border-2 border-[#0a0a0a] p-8 hover:bg-[#0a0a0a] hover:text-white transition-colors group"
            >
              <span className="absolute top-4 right-6 text-7xl font-black text-[#ffd900] leading-none">
                &ldquo;
              </span>

              <div className="relative">
                <p className="text-xs font-black text-[#0a0a0a] group-hover:text-[#ffd900] transition-colors mb-6 tracking-wider">
                  CASE / {String(idx + 1).padStart(2, "0")}
                </p>
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#ffd900]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-[#0a0a0a] group-hover:text-white text-base leading-relaxed mb-8 transition-colors">
                  {t.text}
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-[#0a0a0a]/10 group-hover:border-white/20 transition-colors">
                  <div className="w-10 h-10 bg-[#ffd900] flex items-center justify-center">
                    <span className="text-[#0a0a0a] font-black text-base">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-black text-[#0a0a0a] group-hover:text-white text-sm transition-colors">
                      {t.name}
                    </p>
                    <p className="text-[#6b6b6b] group-hover:text-white/60 text-xs transition-colors">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
