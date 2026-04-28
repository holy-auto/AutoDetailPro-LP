import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { prefectures } from "@/data/prefectures";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const top: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const sections = [
    "#features",
    "#services",
    "#plans",
    "#how-it-works",
    "#areas",
    "#stories",
    "#faq",
    "#pro-recruit",
    "#cta",
  ].map((s) => ({
    url: `${SITE.url}/${s}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const guidePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/guide/mobile-wash`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const areaIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/areas`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const areaPages: MetadataRoute.Sitemap = prefectures.map((p) => ({
    url: `${SITE.url}/areas/${p.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: p.status === "active" ? 0.8 : 0.6,
  }));

  const legalPages: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/tokushoho`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [...top, ...sections, ...guidePages, ...areaIndex, ...areaPages, ...legalPages];
}
