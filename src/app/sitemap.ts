import type { MetadataRoute } from "next";
import { getLandingPages, getProjects } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600;

const KIND_PATH = { service: "/services", market: "/markets", area: "/service-areas" } as const;
type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, landing] = await Promise.all([getProjects(), getLandingPages()]);
  const page = (path: string, priority: number, changeFrequency: Freq) => ({ url: `${SITE_URL}${path}`, changeFrequency, priority });

  return [
    page("", 1, "weekly"),
    page("/projects", 0.9, "weekly"),
    page("/services", 0.9, "monthly"),
    page("/markets", 0.7, "monthly"),
    page("/service-areas", 0.8, "monthly"),
    page("/bid", 0.8, "yearly"),
    page("/prequalification", 0.7, "monthly"),
    page("/team", 0.5, "monthly"),
    page("/careers", 0.6, "weekly"),
    page("/contact", 0.6, "yearly"),
    page("/privacy", 0.2, "yearly"),
    ...landing.map((l) => ({
      url: `${SITE_URL}${KIND_PATH[l.kind]}/${l.slug}`,
      lastModified: l.updated_at,
      changeFrequency: "monthly" as const,
      priority: l.kind === "market" ? 0.7 : 0.8,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly" as const,
      priority: p.status === "current" ? 0.8 : 0.6,
      // Image sitemap entries help project photos appear in Google Images.
      images: p.images
        .slice(0, 10)
        .map((i) => mediaUrl(i.storage_path))
        .filter((u): u is string => !!u),
    })),
  ];
}
