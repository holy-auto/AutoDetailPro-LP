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
      className="py-20 sm:py-28 bg-gradient-to-br from-primary via-blue-600 to-blue-800 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          今すぐ始めましょう
        </h2>
        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          アプリをダウンロードして、プロのカーディテイリングを体験しましょう。
          メールを登録すると、リリース時にお知らせします。
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8"
        >
          <input
            type="email"
            placeholder="メールアドレスを入力"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-5 py-3.5 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-white text-primary font-semibold px-8 py-3.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "送信中..." : "事前登録"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-300 text-sm">登録ありがとうございます！リリース時にお知らせします。</p>
        )}
        {status === "error" && (
          <p className="text-red-300 text-sm">エラーが発生しました。もう一度お試しください。</p>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <div className="text-left">
              <p className="text-[10px] text-gray-400">Download on the</p>
              <p className="text-sm font-semibold">App Store</p>
            </div>
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.585 1.497a1 1 0 010 1.732l-2.585 1.497-2.537-2.537 2.537-2.19zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
            </svg>
            <div className="text-left">
              <p className="text-[10px] text-gray-400">GET IT ON</p>
              <p className="text-sm font-semibold">Google Play</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
