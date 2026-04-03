"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Auto Detail Pro
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              特徴
            </a>
            <a
              href="#services"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              サービス
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              使い方
            </a>
            <a
              href="#testimonials"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              お客様の声
            </a>
            <a
              href="#cta"
              className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              アプリをダウンロード
            </a>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <a
            href="#features"
            className="block text-gray-600 hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            特徴
          </a>
          <a
            href="#services"
            className="block text-gray-600 hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            サービス
          </a>
          <a
            href="#how-it-works"
            className="block text-gray-600 hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            使い方
          </a>
          <a
            href="#testimonials"
            className="block text-gray-600 hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            お客様の声
          </a>
          <a
            href="#cta"
            className="block bg-primary text-white text-center px-5 py-2 rounded-full text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            アプリをダウンロード
          </a>
        </div>
      )}
    </header>
  );
}
