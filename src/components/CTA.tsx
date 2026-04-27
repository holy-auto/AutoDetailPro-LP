"use client";

import { useState } from "react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="cta"
      className="relative py-20 sm:py-32 bg-[#ffd500] overflow-hidden"
    >
      <div className="diagonal-stripe absolute top-0 left-0 right-0 h-3" />
      <div className="diagonal-stripe absolute bottom-0 left-0 right-0 h-3" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-bold tracking-[0.3em] text-black/60 uppercase mb-4">
              GET STARTED / 今すぐ
            </p>
            <h2 className="heading-tight text-display text-5xl sm:text-6xl lg:text-8xl font-black text-black mb-6">
              さあ、
              <br />
              呼ぼう。
            </h2>
            <p className="text-base lg:text-lg text-black/80 mb-8 max-w-xl leading-relaxed">
              アプリをダウンロードして、出張カーディテイリングを体験。
              事前登録いただいた方には、リリース時に
              <span className="bg-black text-[#ffd500] px-2 py-0.5 font-black mx-1">¥1,000 OFF クーポン</span>
              をお届けします。
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mb-4"
            >
              <input
                type="email"
                placeholder="メールアドレスを入力"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-4 rounded-full text-black placeholder-black/40 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-black font-bold"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-black text-[#ffd500] font-black px-8 py-4 rounded-full hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? "送信中..." : "事前登録する"}
              </button>
            </form>

            {status === "success" && (
              <p className="text-black text-sm font-bold">
                登録ありがとうございます！リリース時にお知らせします。
              </p>
            )}
            {status === "error" && (
              <p className="text-red-700 text-sm font-bold">
                エラーが発生しました。もう一度お試しください。
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-10">
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/60 font-bold leading-tight">
                    Download on the
                  </p>
                  <p className="text-base font-black leading-tight">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-black text-white px-6 py-3.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.585 1.497a1 1 0 010 1.732l-2.585 1.497-2.537-2.537 2.537-2.19zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/60 font-bold leading-tight">
                    GET IT ON
                  </p>
                  <p className="text-base font-black leading-tight">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <div className="text-display text-[200px] xl:text-[260px] font-black text-black leading-none tracking-tighter">
                ADP
              </div>
              <div className="absolute -bottom-2 right-0 bg-black text-[#ffd500] px-4 py-2 rounded-full font-black text-sm">
                Auto Detail Pro
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
