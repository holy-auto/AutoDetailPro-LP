"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "duplicated" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setErrorMessage("有効なメールアドレスを入力してください。");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await res.json().catch(() => null)) as
        | { message?: string; error?: string; duplicated?: boolean }
        | null;

      if (res.ok) {
        setStatus(data?.duplicated ? "duplicated" : "success");
        setEmail("");
        return;
      }

      setStatus("error");
      setErrorMessage(
        data?.error ??
          (res.status === 429
            ? "リクエストが多すぎます。しばらくしてから再度お試しください。"
            : "登録に失敗しました。時間をおいて再度お試しください。"),
      );
    } catch {
      setStatus("error");
      setErrorMessage("ネットワークエラーが発生しました。");
    }
  };

  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="py-20 sm:py-28 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#e6f4ff] via-[#f0f9ff] to-[#e6fbf7] p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00b4ff]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#00d4b8]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="section-label mb-4 inline-flex">Get Started</p>
              <h2
                id="cta-heading"
                className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0a2540] mb-5 leading-tight"
              >
                さあ、洗車を呼ぼう。
              </h2>
              <p className="text-[15px] text-[#5a7090] mb-8 max-w-xl leading-relaxed">
                アプリをダウンロードして、出張カーディテイリングを体験。
                事前登録いただいた方には、リリース時に
                <span className="inline-flex items-center bg-white text-[#0099e6] px-2 py-0.5 font-bold mx-1 rounded text-[14px] border border-[#0099e6]/20">
                  ¥1,000 OFF クーポン
                </span>
                をお届けします。
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mb-3"
                aria-label="事前登録フォーム"
              >
                <input
                  type="email"
                  placeholder="メールアドレスを入力"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="メールアドレス"
                  className="flex-1 px-5 py-3.5 rounded-full text-[#0a2540] placeholder-[#8ba0ba] bg-white border border-[#e4eef7] focus:outline-none focus:ring-2 focus:ring-[#0099e6]/30 focus:border-[#0099e6] text-[14px]"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary text-[14px] px-7"
                >
                  {status === "loading" ? "送信中..." : "事前登録する"}
                </button>
              </form>

              <p role="status" aria-live="polite" className="min-h-[1.25rem]">
                {status === "success" && (
                  <span className="text-[#0a8f7c] text-[13px] font-medium">
                    ✓ 登録ありがとうございます。リリース時にお知らせします。
                  </span>
                )}
                {status === "duplicated" && (
                  <span className="text-[#0a8f7c] text-[13px] font-medium">
                    ✓ 既にご登録済みです。リリースまでお待ちください。
                  </span>
                )}
                {status === "error" && (
                  <span className="text-[#c41e60] text-[13px] font-medium">
                    {errorMessage}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-[#5a7090] mt-2">
                送信により
                <a href="/privacy" className="underline font-medium hover:text-[#0099e6]">
                  プライバシーポリシー
                </a>
                に同意したものとみなします。
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-[#0a2540] text-white px-5 py-3 rounded-full hover:bg-[#1a3658] transition-colors"
                  aria-label="App Store でダウンロード"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span className="text-left">
                    <span className="block text-[10px] text-white/60 leading-tight">
                      Download on the
                    </span>
                    <span className="block text-sm font-bold leading-tight">
                      App Store
                    </span>
                  </span>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-[#0a2540] text-white px-5 py-3 rounded-full hover:bg-[#1a3658] transition-colors"
                  aria-label="Google Play でダウンロード"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.585 1.497a1 1 0 010 1.732l-2.585 1.497-2.537-2.537 2.537-2.19zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                  </svg>
                  <span className="text-left">
                    <span className="block text-[10px] text-white/60 leading-tight">
                      GET IT ON
                    </span>
                    <span className="block text-sm font-bold leading-tight">
                      Google Play
                    </span>
                  </span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex justify-center">
              <div className="relative">
                <div className="logo-mark w-64 h-64 rounded-full flex items-center justify-center ring-8 ring-white/60 soft-shadow-lg">
                  <div className="absolute inset-3 rounded-full border-2 border-white/40" />
                  <svg
                    className="w-24 h-24 text-white drop-shadow-lg relative z-10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h.5a1.5 1.5 0 011.5 1.5V17a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.5A1.5 1.5 0 014.5 11H5zm2.2 0h9.6L15.6 7.3a.5.5 0 00-.5-.3H8.9a.5.5 0 00-.5.3L7.2 11zM7 14a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-bold text-[10px] tracking-[0.4em] z-10">
                    MOBILE WASH
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white border border-[#e4eef7] rounded-full px-3 py-1.5 soft-shadow text-[12px] font-bold text-[#0099e6]">
                  ★ Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
