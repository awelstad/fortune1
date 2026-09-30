import "server-only";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingIndex, LandingView, KIND_PATH } from "@/components/site/LandingView";
import { JsonLd } from "@/components/site/JsonLd";
import { getLandingPage, getLandingPages, getProjects, getSite, matchProjects } from "./data";
import { breadcrumbLd, pageMeta } from "./seo";
import { SITE_URL } from "./site-url";
import type { LandingKind } from "./types";

const INDEX = {
  service: {
    title: "Services",
    seoTitle: "Commercial Electrical Services in Southwest Florida",
    intro: "Commercial electrical construction, power distribution, emergency power, lighting, multifamily and tenant improvements.",
    description:
      "Commercial electrical services from Fortune Electrical in Fort Myers: construction, switchgear and power distribution, generators, lighting, multifamily and tenant improvements across Southwest Florida.",
  },
  market: {
    title: "Markets",
    seoTitle: "Markets We Serve | Commercial Electrical in Southwest Florida",
    intro: "Aviation, education, government, senior living, multifamily, commercial and community projects.",
    description:
      "Electrical construction for aviation, education, government, senior living, multifamily, commercial and community projects in Southwest Florida.",
  },
  area: {
    title: "Service Areas",
    seoTitle: "Service Areas | Commercial Electrical Contractor in Southwest Florida",
    intro: "Headquartered in Fort Myers, serving Lee, Collier, Charlotte and Sarasota counties.",
    description:
      "Commercial electrical contractor serving Fort Myers, Cape Coral, Naples, Bonita Springs, Estero, Punta Gorda, Port Charlotte and all of Southwest Florida.",
  },
} as const;

export async function landingIndexMeta(kind: LandingKind): Promise<Metadata> {
  return pageMeta(KIND_PATH[kind]);
}

export async function LandingIndexPage({ kind }: { kind: LandingKind }) {
  const [pages, projects] = await Promise.all([getLandingPages(kind), getProjects()]);
  const counts = Object.fromEntries(pages.map((p) => [p.slug, matchProjects(p, projects).length]));
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: INDEX[kind].title, path: KIND_PATH[kind] }])} />
      <LandingIndex kind={kind} title={INDEX[kind].title} intro={INDEX[kind].intro} pages={pages} counts={counts} />
    </>
  );
}

export async function landingParams(kind: LandingKind) {
  return (await getLandingPages(kind)).map((p) => ({ slug: p.slug }));
}

export async function landingMeta(kind: LandingKind, slug: string): Promise<Metadata> {
  const page = await getLandingPage(kind, slug);
  if (!page) return { title: "Not found" };
  const path = `${KIND_PATH[kind]}/${slug}`;
  const title = page.seo_title || page.headline || page.name;
  const description = page.seo_description || page.intro || undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export async function LandingDetailPage({ kind, slug }: { kind: LandingKind; slug: string }) {
  const [page, all, projects, site, services, areas] = await Promise.all([
    getLandingPage(kind, slug),
    getLandingPages(kind),
    getProjects(),
    getSite(),
    getLandingPages("service"),
    getLandingPages("area"),
  ]);
  if (!page) notFound();

  const matched = matchProjects(page, projects);
  const siblings = all.filter((p) => p.id !== page.id);
  const path = `${KIND_PATH[kind]}/${slug}`;

  // Cross-link to the other dimension: services ↔ areas, markets → services.
  const cross =
    kind === "area"
      ? { title: "Services", items: services.map((s) => ({ name: s.name, href: `/services/${s.slug}` })) }
      : kind === "service"
        ? { title: "Service areas", items: areas.map((a) => ({ name: a.name, href: `/service-areas/${a.slug}` })) }
        : { title: "Services", items: services.map((s) => ({ name: s.name, href: `/services/${s.slug}` })) };

  const allHref =
    kind === "market" ? `/projects?category=${slug}` : kind === "area" && page.match.cities?.length === 1 ? `/projects?city=${encodeURIComponent(page.match.cities[0])}` : undefined;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: INDEX[kind].title, path: KIND_PATH[kind] },
          { name: page.name, path },
        ])}
      />
      {kind === "service" && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Service",
            name: page.name,
            serviceType: page.name,
            description: page.intro ?? undefined,
            url: `${SITE_URL}${path}`,
            provider: { "@id": `${SITE_URL}/#business` },
            areaServed: (site.local?.areas ?? []).map((a) => ({ "@type": "AdministrativeArea", name: `${a}, Florida` })),
          }}
        />
      )}
      <LandingView page={page} projects={matched} siblings={siblings} crossLinks={cross} allProjectsHref={allHref} />
    </>
  );
}
