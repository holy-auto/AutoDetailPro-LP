"use client";

import { useState } from "react";

const mainNav = [
  { href: "#features", label: "特徴" },
  { href: "#services", label: "サービス" },
  { href: "#plans", label: "料金プラン" },
  { href: "#how-it-works", label: "ご利用の流れ" },
  { href: "#areas", label: "対応エリア" },
  { href: "#stories", label: "導入事例" },
  { href: "#faq", label: "よくある質問" },
];

const utilityNav = [
  { href: "#cta", label: "個人のお客様" },
  { href: "#cta", label: "法人のお客様" },
  { href: "#pro-recruit", label: "プロ募集" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#e4eef7]">
      <div className="hidden lg:block bg-[#f7fbff] border-b border-[#e4eef7]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 flex justify-end items-center h-9 gap-6 text-[12px]">
          {utilityNav.map((u) => (
            <a
              key={u.label}
              href={u.href}
              className="text-[#5a7090] hover:text-[#0099e6] transition-colors"
            >
              {u.label}
            </a>
          ))}
          <span className="text-[#cfdfee]">|</span>
          <a href="#" className="text-[#5a7090] hover:text-[#0099e6] transition-colors">
            お問い合わせ
          </a>
          <span className="text-[#cfdfee]">|</span>
          <a href="#" className="text-[#5a7090] hover:text-[#0099e6] transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            JA
          </a>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          <a href="#" className="flex items-center gap-2.5 shrink-0" aria-label="MobileWash ホームへ">
            <div className="logo-mark w-9 h-9 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h.5a1.5 1.5 0 011.5 1.5V17a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.5A1.5 1.5 0 014.5 11H5zm2.2 0h9.6L15.6 7.3a.5.5 0 00-.5-.3H8.9a.5.5 0 00-.5.3L7.2 11zM7 14a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <span className="text-[17px] font-bold text-[#0a2540] tracking-tight">
              MobileWash
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7" aria-label="メインメニュー">
            {mainNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[14px] font-medium text-[#1a3658] hover:text-[#0099e6] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href="#cta"
              className="text-[13px] font-bold text-[#0099e6] border border-[#0099e6] hover:bg-[#e6f4ff] px-4 py-2 rounded-full transition-colors"
            >
              事前登録
            </a>
            <a
              href="#cta"
              className="text-[13px] font-bold text-white bg-[#0099e6] hover:bg-[#0077b3] px-5 py-2 rounded-full transition-colors inline-flex items-center gap-1"
            >
              アプリをダウンロード
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
            aria-expanded={menuOpen}
          >
            <svg
              className="w-6 h-6 text-[#0a2540]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="lg:hidden bg-white border-t border-[#e4eef7] px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
          aria-label="モバイルメニュー"
        >
          <div className="space-y-1 mb-5">
            {mainNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-[15px] font-medium text-[#1a3658] py-3 border-b border-[#f0f5fa]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="space-y-1 mb-5 pt-2 border-t border-[#e4eef7]">
            {utilityNav.map((u) => (
              <a
                key={u.label}
                href={u.href}
                className="block text-[13px] text-[#5a7090] py-2"
                onClick={() => setMenuOpen(false)}
              >
                {u.label}
              </a>
            ))}
          </div>
          <a
            href="#cta"
            className="block bg-[#0099e6] text-white text-center px-5 py-3.5 rounded-full text-[14px] font-bold"
            onClick={() => setMenuOpen(false)}
          >
            アプリをダウンロード
          </a>
        </nav>
      )}
    </header>
  );
}
