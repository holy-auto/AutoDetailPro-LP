import type { Metadata } from "next";
import { SITE } from "@/data/site";

type StructuredData = Record<string, unknown>;

export function organizationLd(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: SITE.nameJa,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}${SITE.logo}`,
      width: 512,
      height: 512,
    },
    description: SITE.description,
    foundingDate: SITE.founded,
    sameAs: SITE.sameAs,
    address: {
      "@type": "PostalAddress",
      addressCountry: SITE.contact.addressCountry,
      addressLocality: SITE.contact.addressLocality,
      addressRegion: SITE.contact.addressRegion,
    },
  };
}

export function websiteLd(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "ja-JP",
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function serviceLd(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE.url}/#service`,
    serviceType: "出張カーディテイリング",
    name: "MobileWash 出張洗車・出張コーティング",
    description:
      "GPSマッチング型の出張カーディテイリングサービス。手洗い洗車、ガラスコーティング、内装クリーニング、ポリッシュ磨き、フルディテイリング、エンジンルーム洗浄を提供。",
    provider: { "@id": `${SITE.url}/#organization` },
    areaServed: [
      { "@type": "AdministrativeArea", name: "東京都" },
      { "@type": "AdministrativeArea", name: "神奈川県" },
      { "@type": "AdministrativeArea", name: "埼玉県" },
      { "@type": "AdministrativeArea", name: "千葉県" },
      { "@type": "AdministrativeArea", name: "大阪府" },
      { "@type": "AdministrativeArea", name: "京都府" },
      { "@type": "AdministrativeArea", name: "兵庫県" },
      { "@type": "AdministrativeArea", name: "愛知県" },
    ],
    audience: { "@type": "Audience", audienceType: "個人・法人カーオーナー" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "JPY",
      lowPrice: "2980",
      highPrice: "49800",
      offerCount: "9",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "出張カーケアメニュー",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "出張手洗い洗車" },
          price: "3980",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "出張内装クリーニング" },
          price: "6980",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "出張ガラスコーティング" },
          price: "29800",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "出張ポリッシュ磨き" },
          price: "12800",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "フルディテイリング" },
          price: "49800",
          priceCurrency: "JPY",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "エンジンルーム洗浄" },
          price: "9800",
          priceCurrency: "JPY",
        },
      ],
    },
  };
}

export function mobileApplicationLd(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "MobileWash",
    operatingSystem: "iOS, Android",
    applicationCategory: "LifestyleApplication",
    description:
      "出張洗車・出張コーティングのプロを呼べるカーディテイリングアプリ。GPSで近くの認定プロを自動マッチング。",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    softwareVersion: "1.0.0",
    releaseNotes:
      "正式ローンチ準備中。先行登録者にはリリース時にお知らせします。",
  };
}

export function faqLd(items: { q: string; a: string }[]): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function breadcrumbLd(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: SITE.url,
      },
    ],
  };
}

export function defaultMetadata(): Metadata {
  const title = `${SITE.name} | 出張洗車・出張コーティングのプロを呼べるアプリ`;
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    keywords: [...SITE.keywords],
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    category: "automotive",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    alternates: {
      canonical: SITE.url,
      languages: {
        "ja-JP": SITE.url,
      },
    },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: SITE.url,
      siteName: SITE.name,
      title,
      description: SITE.description,
      images: [
        {
          url: SITE.ogImage,
          width: 1200,
          height: 630,
          alt: `${SITE.name} - ${SITE.catchphrase}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      creator: SITE.twitter,
      title,
      description: SITE.shortDescription,
      images: [SITE.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-icon.png",
    },
    manifest: "/manifest.webmanifest",
    other: {
      "format-detection": "telephone=no",
    },
  };
}
