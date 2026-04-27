"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-black/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-[#ffd900] font-black text-lg leading-none tracking-tighter">
                ADP
              </span>
            </div>
            <span className="text-base font-black text-[#0a0a0a] tracking-tight hidden sm:inline">
              Auto Detail Pro
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-bold text-[#0a0a0a] hover:text-[#ffd900] transition-colors"
            >
              特徴
            </a>
            <a
              href="#services"
              className="text-sm font-bold text-[#0a0a0a] hover:text-[#ffd900] transition-colors"
            >
              サービス
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-bold text-[#0a0a0a] hover:text-[#ffd900] transition-colors"
            >
              使い方
            </a>
            <a
              href="#testimonials"
              className="text-sm font-bold text-[#0a0a0a] hover:text-[#ffd900] transition-colors"
            >
              お客様の声
            </a>
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-6 py-3 text-sm font-black hover:bg-[#ffd900] hover:text-[#0a0a0a] transition-colors"
            >
              アプリをダウンロード
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6 text-[#0a0a0a]"
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
        <div className="md:hidden bg-white border-t border-black/10 px-4 py-4 space-y-3">
          <a
            href="#features"
            className="block font-bold text-[#0a0a0a] py-2"
            onClick={() => setMenuOpen(false)}
          >
            特徴
          </a>
          <a
            href="#services"
            className="block font-bold text-[#0a0a0a] py-2"
            onClick={() => setMenuOpen(false)}
          >
            サービス
          </a>
          <a
            href="#how-it-works"
            className="block font-bold text-[#0a0a0a] py-2"
            onClick={() => setMenuOpen(false)}
          >
            使い方
          </a>
          <a
            href="#testimonials"
            className="block font-bold text-[#0a0a0a] py-2"
            onClick={() => setMenuOpen(false)}
          >
            お客様の声
          </a>
          <a
            href="#cta"
            className="block bg-[#0a0a0a] text-white text-center px-5 py-3 text-sm font-black"
            onClick={() => setMenuOpen(false)}
          >
            アプリをダウンロード
          </a>
        </div>
      )}
    </header>
  );
}
