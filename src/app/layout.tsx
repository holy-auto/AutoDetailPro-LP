import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MobileWash | プロが今すぐ出張するカーディテイリングアプリ",
  description:
    "GPSで近くのカーディテイリングプロを検索。出張洗車・出張コーティング・内装クリーニングなど、プロが今すぐあなたの元へ出張します。",
  openGraph: {
    title: "MobileWash | プロが今すぐ出張するカーディテイリングアプリ",
    description:
      "GPSで近くのカーディテイリングプロを検索。プロが今すぐあなたの元へ出張します。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#0a2540]">
        {children}
      </body>
    </html>
  );
}
