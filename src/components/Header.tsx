"use client";

import { useState } from "react";

const navItems = [
  { href: "#features", label: "特徴" },
  { href: "#services", label: "サービス" },
  { href: "#plans", label: "料金" },
  { href: "#how-it-works", label: "使い方" },
  { href: "#areas", label: "対応エリア" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-black/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-[#ffd500] font-black text-[11px] leading-none tracking-tighter">
                ADP
              </span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-base font-black text-black tracking-tight">
                Auto Detail Pro
              </span>
              <span className="text-[10px] text-black/50 font-bold tracking-wider mt-0.5">
                MOBILE CAR DETAILING
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-black hover:text-black/60 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#pro-recruit"
              className="text-sm font-bold text-black hover:text-black/60 transition-colors"
            >
              プロ募集
            </a>
            <a
              href="#cta"
              className="group inline-flex items-center gap-1.5 bg-black text-white px-5 py-2.5 rounded-full text-sm font-black hover:bg-[#ffd500] hover:text-black transition-colors"
            >
              アプリDL
              <svg
                className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
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
        <div className="lg:hidden bg-white border-t border-black/10 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block font-bold text-black py-3 border-b border-black/5"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#pro-recruit"
            className="block font-bold text-black py-3 border-b border-black/5"
            onClick={() => setMenuOpen(false)}
          >
            プロ募集
          </a>
          <a
            href="#cta"
            className="block bg-black text-white text-center px-5 py-3 rounded-full text-sm font-black mt-3"
            onClick={() => setMenuOpen(false)}
          >
            アプリをダウンロード
          </a>
        </div>
      )}
    </header>
  );
}
