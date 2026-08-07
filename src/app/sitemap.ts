import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://davehomeassist.github.io/metagrid/";
  const pages = ["", "technology/", "roadmap/", "safety/", "team/", "faq/", "contact/"];

  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1.0 : 0.7,
  }));
}
