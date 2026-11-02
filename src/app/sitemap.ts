import type { MetadataRoute } from "next";
import { articles, informationPages } from "../lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!site) return [];
  return [
    "/",
    ...Object.keys(informationPages).map((p) => `/${p}/`),
    ...Object.keys(articles).map((s) => `/guias/${s}/`),
  ].map((path) => ({
    url: `${site}${path}`,
    lastModified: "2026-11-02",
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
