import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const sections = [
    "",
    "#features",
    "#services",
    "#plans",
    "#how-it-works",
    "#areas",
    "#testimonials",
    "#faq",
    "#pro-recruit",
    "#cta",
  ];

  return sections.map((s, i) => ({
    url: `${SITE.url}/${s}`,
    lastModified,
    changeFrequency: "weekly",
    priority: i === 0 ? 1 : 0.7,
  }));
}
