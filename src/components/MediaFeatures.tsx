import type { ReactNode } from "react";
import {
  PRESS_FEATURES,
  SOCIAL_FEATURES,
  type MediaPlatform,
  type SocialFeature,
} from "@/data/media";

const PLATFORM_META: Record<
  MediaPlatform,
  { label: string; bg: string; fg: string; icon: ReactNode }
> = {
  instagram: {
    label: "Instagram",
    bg: "#fdecf2",
    fg: "#c13584",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    bg: "#eaeaea",
    fg: "#111111",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M16.5 3v3.2a4.8 4.8 0 0 0 4.5 3v3.1a7.9 7.9 0 0 1-4.5-1.4v6.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.2a2.5 2.5 0 1 0 1.7 2.4V3z" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    bg: "#fde7e7",
    fg: "#cc0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.5zM10 15.5v-7l6 3.5z" />
      </svg>
    ),
  },
  x: {
    label: "X",
    bg: "#e7e7e7",
    fg: "#0a0a0a",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M18.244 2H21l-6.51 7.443L22 22h-6.797l-4.86-6.39L4.6 22H2l6.972-7.97L2 2h6.969l4.4 5.832zm-1.19 18h1.808L7.05 4H5.1z" />
      </svg>
    ),
  },
  voicy: {
    label: "Voicy",
    bg: "#fff1e0",
    fg: "#e87b0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v18m0 0a3 3 0 0 0 3-3v-3m-3 6a3 3 0 0 1-3-3v-3m6 0a6 6 0 0 1-12 0M19 12a7 7 0 0 1-14 0" />
      </svg>
    ),
  },
  note: {
    label: "note",
    bg: "#e6f7f0",
    fg: "#0c8b5c",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 8h8v2H8zm0 3h8v2H8zm0 3h5v2H8z" fill="#fff" />
      </svg>
    ),
  },
  press: {
    label: "Press",
    bg: "#e6f4ff",
    fg: "#0a2540",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h6m-6 4h10m-10 4h10" />
      </svg>
    ),
  },
};

function SocialCard({ item }: { item: SocialFeature }) {
  const meta = PLATFORM_META[item.platform];
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="soft-card bg-white p-4 sm:p-5 flex flex-col gap-3 hover:border-[#cfdfee] transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: meta.bg, color: meta.fg }}
        >
          {meta.icon}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#0a2540] truncate">
            {item.creatorName}
          </p>
          <p className="text-[11px] text-[#5a7090] truncate">
            {meta.label}
            {item.creatorHandle ? ` · ${item.creatorHandle}` : ""}
            {item.category ? ` · ${item.category}` : ""}
          </p>
        </div>
      </div>
      <p className="text-[12px] text-[#3d5a7a] leading-relaxed line-clamp-3">
        {item.caption}
      </p>
      {item.postedAt ? (
        <p className="text-[11px] text-[#90a4be]">{item.postedAt}</p>
      ) : null}
    </a>
  );
}

export default function MediaFeatures() {
  if (SOCIAL_FEATURES.length === 0 && PRESS_FEATURES.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="メディア・SNS掲載実績"
      className="py-16 sm:py-20 bg-white"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-12">
          <p className="section-label mb-3 inline-flex">As Featured In</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] mb-3">
            メディア・SNSで紹介されました
          </h2>
          <p className="text-[14px] text-[#5a7090] max-w-2xl mx-auto leading-relaxed">
            実際にご利用いただいたお客様・クリエイターの皆さまによる発信、
            メディア掲載をご紹介します。
          </p>
        </div>

        {PRESS_FEATURES.length > 0 ? (
          <div className="mb-10 sm:mb-12">
            <p className="text-[12px] font-bold text-[#5a7090] uppercase tracking-wider mb-4 text-center">
              Press
            </p>
            <ul className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {PRESS_FEATURES.map((press) => (
                <li key={press.href}>
                  <a
                    href={press.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="soft-card bg-white px-4 py-2.5 inline-flex items-center gap-2 hover:border-[#cfdfee] transition-colors"
                  >
                    <span className="text-[13px] font-bold text-[#0a2540]">
                      {press.outlet}
                    </span>
                    <span className="text-[11px] text-[#5a7090] hidden sm:inline">
                      {press.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {SOCIAL_FEATURES.length > 0 ? (
          <div>
            <p className="text-[12px] font-bold text-[#5a7090] uppercase tracking-wider mb-4 text-center">
              Social
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {SOCIAL_FEATURES.map((item) => (
                <SocialCard key={item.href} item={item} />
              ))}
            </div>
            <p className="mt-6 text-[11px] text-[#90a4be] text-center">
              掲載は本人のご了承を得たものです。投稿は #PR タイアップを含みます。
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
