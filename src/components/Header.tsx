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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-[#0a2540]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="logo-mark w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-[#00b4ff]/20">
              <svg className="w-6 h-6 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11h.5a1.5 1.5 0 011.5 1.5V17a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.5A1.5 1.5 0 014.5 11H5zm2.2 0h9.6L15.6 7.3a.5.5 0 00-.5-.3H8.9a.5.5 0 00-.5.3L7.2 11zM7 14a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-base font-black text-[#0a2540] tracking-tight">
                MobileWash
              </span>
              <span className="text-[10px] text-[#0a2540]/50 font-bold tracking-wider mt-0.5">
                MOBILE CAR WASH &amp; COATING
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-bold text-[#0a2540] hover:text-[#0a2540]/60 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#pro-recruit"
              className="text-sm font-bold text-[#0a2540] hover:text-[#0a2540]/60 transition-colors"
            >
              プロ募集
            </a>
            <a
              href="#cta"
              className="group inline-flex items-center gap-1.5 bg-[#0a2540] text-white px-5 py-2.5 rounded-full text-sm font-black hover:bg-[#00b4ff] hover:text-[#0a2540] transition-colors"
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
              className="w-6 h-6 text-[#0a2540]"
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
        <div className="lg:hidden bg-white border-t border-[#0a2540]/10 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block font-bold text-[#0a2540] py-3 border-b border-[#0a2540]/5"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#pro-recruit"
            className="block font-bold text-[#0a2540] py-3 border-b border-[#0a2540]/5"
            onClick={() => setMenuOpen(false)}
          >
            プロ募集
          </a>
          <a
            href="#cta"
            className="block bg-[#0a2540] text-white text-center px-5 py-3 rounded-full text-sm font-black mt-3"
            onClick={() => setMenuOpen(false)}
          >
            アプリをダウンロード
          </a>
        </div>
      )}
    </header>
  );
}
