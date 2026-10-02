import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import { CurrentProjects } from "@/components/home/CurrentProjects";
import { UpcomingProjects } from "@/components/home/UpcomingProjects";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import { Capabilities } from "@/components/home/Capabilities";
import { Industries, type IndustryTile } from "@/components/home/Industries";
import { ClosingCta } from "@/components/site/ClosingCta";
import { SelectedWork } from "@/components/home/SelectedWork";
import { getCategories, getHomepage, getLandingPages, getProjects, getSite, getStatistics, getTestimonials } from "@/lib/data";
import { GcBand } from "@/components/home/GcBand";
import { SitePhotoStrip } from "@/components/site/SitePhotoStrip";
import { safetyFacts } from "@/lib/format";
import { best, showcaseScore } from "@/lib/rank";
import { isHiRes } from "@/lib/media";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/");
}

export default async function HomePage() {
  const [home, site, projects, categories, stats, testimonials, marketPages] = await Promise.all([
    getHomepage(),
    getSite(),
    getProjects(),
    getCategories(),
    getStatistics(),
    getTestimonials(),
    getLandingPages("market"),
  ]);
  const marketSlugs = new Set(marketPages.map((m) => m.slug));

  // The featured section is image-led, so it only uses a project with real photography.
  const photographed = projects.filter((p) => p.hero);
  const featured =
    photographed.find((p) => p.id === home.featured_project_id) ??
    best(photographed.filter((p) => p.status === "completed" && isHiRes(p.hero, 1000)));
  const current = projects.filter((p) => p.status === "current" && p.id !== featured?.id);
  const upcoming = projects.filter((p) => p.status === "upcoming" && p.id !== featured?.id);
  // Hero "Now Building" board: the strongest current project, then the next two in display order.
  const allCurrent = projects.filter((p) => p.status === "current");
  const top = best(allCurrent);
  const nowBuilding = top ? [top, ...allCurrent.filter((p) => p.id !== top.id)].slice(0, 3) : [];

  const tiles: IndustryTile[] = categories
    .filter((c) => c.show_on_home)
    .map((c) => {
      const inCat = projects.filter((p) => p.category_id === c.id);
      const best = [...inCat].filter((p) => p.hero).sort((a, b) => (b.hero!.width ?? 0) - (a.hero!.width ?? 0))[0];
      const image = c.image_path
        ? { id: c.id, project_id: "", storage_path: c.image_path, width: 1600, height: 1000, alt: "", caption: null, sort_order: 0 }
        : (best?.hero ?? null);
      return { ...c, count: inCat.length, image, href: marketSlugs.has(c.slug) ? `/markets/${c.slug}` : undefined };
    })
    .filter((t) => t.count > 0);

  // Completed work for the editorial grid: best documented first, skipping anything already shown above.
  const completed = projects.filter((p) => p.status === "completed");
  const selected = completed
    .filter((p) => p.hero && p.id !== featured?.id)
    .sort((a, b) => showcaseScore(b) - showcaseScore(a))
    .slice(0, 6);

  const locationLine = [site.city, site.service_area].filter(Boolean).join(" · ") || "Florida";

  return (
    <>
      <Hero home={home} nowBuilding={nowBuilding} projectCount={projects.length} locationLine={locationLine} />
      <StatsBand stats={stats} />
      <CurrentProjects projects={current} heading={home.current_heading ?? "Current Projects"} intro={home.current_intro} />
      <UpcomingProjects projects={upcoming} heading={home.upcoming_heading ?? "Upcoming Projects"} intro={home.upcoming_intro} />
      {featured && <FeaturedProject project={featured} />}

      <SelectedWork
        projects={selected}
        total={projects.length}
        heading={home.portfolio_heading ?? "Selected Work"}
        intro={home.portfolio_intro}
      />
      <Capabilities heading={home.capabilities_heading ?? "Capabilities"} items={home.capabilities} />
      <Industries heading={home.industries_heading ?? "Industries"} intro={home.industries_intro} tiles={tiles} />
      {/* Proof band only once real testimonials or safety figures exist; the closing CTA carries the bid ask. */}
      {(testimonials.length > 0 || safetyFacts(site.safety ?? {}).length > 0) && (
        <GcBand testimonials={testimonials} safety={safetyFacts(site.safety ?? {})} />
      )}
      <SitePhotoStrip site={site} page="home" />
      <ClosingCta
        heading={home.cta_heading}
        subheading={home.cta_subheading}
        buttonLabel={home.cta_button_label}
        buttonHref={home.cta_button_href}
        phone={site.phone}
      />
    </>
  );
}

