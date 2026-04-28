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
      className="relative py-20 sm:py-32 bg-[#ffd900] overflow-hidden"
    >
      <div className="diagonal-stripe absolute top-0 left-0 right-0 h-3" />
      <div className="diagonal-stripe absolute bottom-0 left-0 right-0 h-3" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="inline-block bg-[#0a0a0a] text-[#ffd900] text-xs font-black px-3 py-1.5 uppercase tracking-wider mb-6">
              GET STARTED / 今すぐ
            </p>
            <h2 className="heading-tight text-4xl sm:text-5xl lg:text-7xl font-black text-[#0a0a0a] mb-6">
              さあ、
              <br />
              はじめよう。
            </h2>
            <p className="text-base lg:text-lg text-[#0a0a0a]/80 mb-10 max-w-xl leading-relaxed">
              アプリをダウンロードして、プロのカーディテイリングを体験。
              事前登録いただいた方には、リリース時にお得な情報をお届けします。
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mb-4"
              noValidate
            >
              <label htmlFor="waitlist-email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="メールアドレスを入力"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={status === "error"}
                aria-describedby="waitlist-status"
                maxLength={254}
                className="flex-1 px-5 py-4 text-[#0a0a0a] placeholder-[#0a0a0a]/40 bg-white border-2 border-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a] font-bold"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-[#0a0a0a] text-[#ffd900] font-black px-8 py-4 hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? "送信中..." : "事前登録する"}
              </button>
            </form>

            <p id="waitlist-status" role="status" aria-live="polite" className="min-h-[1.25rem]">
              {status === "success" && (
                <span className="text-[#0a0a0a] text-sm font-bold">
                  登録ありがとうございます！リリース時にお知らせします。
                </span>
              )}
              {status === "duplicated" && (
                <span className="text-[#0a0a0a] text-sm font-bold">
                  既にご登録済みです。リリースまでお待ちください。
                </span>
              )}
              {status === "error" && (
                <span className="text-red-700 text-sm font-bold">{errorMessage}</span>
              )}
            </p>

            <p className="text-xs text-[#0a0a0a]/70 mt-2">
              送信により
              <a href="/privacy" className="underline font-bold hover:text-[#0a0a0a]">
                プライバシーポリシー
              </a>
              に同意したものとみなします。
            </p>

            <div className="flex flex-wrap gap-3 mt-10">
              <StoreButton
                href={process.env.NEXT_PUBLIC_APP_STORE_URL}
                label="App Store"
                caption="Download on the"
                icon={
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                }
              />
              <StoreButton
                href={process.env.NEXT_PUBLIC_PLAY_STORE_URL}
                label="Google Play"
                caption="GET IT ON"
                icon={
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.585 1.497a1 1 0 010 1.732l-2.585 1.497-2.537-2.537 2.537-2.19zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <div className="text-[180px] xl:text-[240px] font-black text-[#0a0a0a] leading-none tracking-tighter">
                ADP
              </div>
              <div className="absolute -bottom-4 right-0 bg-[#0a0a0a] text-[#ffd900] px-4 py-2 font-black text-sm">
                Auto Detail Pro
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreButton({
  href,
  label,
  caption,
  icon,
}: {
  href: string | undefined;
  label: string;
  caption: string;
  icon: React.ReactNode;
}) {
  const enabled = Boolean(href);
  const content = (
    <>
      {icon}
      <div className="text-left">
        <p className="text-[10px] text-white/60 font-bold leading-tight">
          {enabled ? caption : "COMING SOON"}
        </p>
        <p className="text-base font-black leading-tight">{label}</p>
      </div>
    </>
  );

  if (!enabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex items-center gap-3 bg-[#0a0a0a] text-white/70 px-6 py-3.5 cursor-not-allowed opacity-70"
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 bg-[#0a0a0a] text-white px-6 py-3.5 hover:bg-[#1a1a1a] transition-colors"
    >
      {content}
    </a>
  );
}
