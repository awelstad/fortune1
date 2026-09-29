import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/team`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/careers`, changeFrequency: "weekly", priority: 0.6 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly" as const,
      priority: p.status === "current" ? 0.8 : 0.6,
    })),
  ];
}
