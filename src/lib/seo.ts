import "server-only";
import type { Metadata } from "next";
import { getSeoPages } from "./data";
import { STATIC_SEO } from "./seo-pages";
import { SITE_URL } from "./site-url";
import type { SiteSettings } from "./types";

/**
 * Metadata for a static page, applying any title/description the admin set in
 * SEO → Pages. Defaults live in STATIC_SEO.
 */
export async function pageMeta(path: string): Promise<Metadata> {
  const defaults = STATIC_SEO[path] ?? { title: "Fortune Electrical Construction", description: "" };
  const o = (await getSeoPages())[path];
  const title = o?.title?.trim() || defaults.title;
  const description = o?.description?.trim() || defaults.description;
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    ...(o?.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

const DAY: Record<string, string> = {
  Monday: "https://schema.org/Monday",
  Tuesday: "https://schema.org/Tuesday",
  Wednesday: "https://schema.org/Wednesday",
  Thursday: "https://schema.org/Thursday",
  Friday: "https://schema.org/Friday",
  Saturday: "https://schema.org/Saturday",
  Sunday: "https://schema.org/Sunday",
};

/** Organization / local business structured data (schema.org Electrician). */
export function localBusinessLd(site: SiteSettings) {
  const local = site.local ?? {};
  const sameAs = [local.gbp_url, local.linkedin_url, ...Object.values(site.social_links ?? {})].filter(
    (u): u is string => !!u && /^https?:\/\//.test(u),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": `${SITE_URL}/#business`,
    name: site.company_name,
    legalName: site.legal_name ?? undefined,
    description:
      site.default_seo_description ??
      "Commercial electrical contractor serving Southwest Florida — Fort Myers, Cape Coral, Naples and beyond.",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/fortune-logo-dark.png`,
    image: `${SITE_URL}/brand/fortune-logo-dark.png`,
    telephone: site.phone ?? undefined,
    email: site.email ?? undefined,
    address: site.address_line1
      ? {
          "@type": "PostalAddress",
          streetAddress: site.address_line1,
          addressLocality: site.city ?? undefined,
          addressRegion: site.state ?? undefined,
          postalCode: site.postal_code ?? undefined,
          addressCountry: "US",
        }
      : undefined,
    geo: local.geo ? { "@type": "GeoCoordinates", latitude: local.geo.lat, longitude: local.geo.lng } : undefined,
    openingHoursSpecification: (local.hours ?? []).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => DAY[d] ?? d),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: [
      ...(local.areas ?? []).map((a) => ({ "@type": "AdministrativeArea", name: `${a}, Florida` })),
      { "@type": "State", name: "Florida" },
    ],
    hasCredential: site.license_numbers
      ? { "@type": "EducationalOccupationalCredential", credentialCategory: "license", name: site.license_numbers }
      : undefined,
    knowsAbout: [
      "Commercial electrical construction",
      "Power distribution and switchgear",
      "Emergency and standby power",
      "Commercial and site lighting",
      "Multifamily electrical construction",
      "Tenant improvements",
    ],
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
