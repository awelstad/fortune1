import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import { CurrentProjects } from "@/components/home/CurrentProjects";
import { UpcomingProjects } from "@/components/home/UpcomingProjects";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import { FeaturedSwitcher } from "@/components/home/FeaturedSwitcher";
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

  // Featured: every starred (★) project with photography, in display order; the
  // optional "lead" chosen on the Homepage admin goes first. Image-led, so no photo = not eligible.
  const photographed = projects.filter((p) => p.hero);
  const starred = photographed.filter((p) => p.featured);
  const lead = photographed.find((p) => p.id === home.featured_project_id);
  const featuredList = (lead ? [lead, ...starred.filter((p) => p.id !== lead.id)] : starred).slice(0, 5);
  if (!featuredList.length) {
    const fallback = best(photographed.filter((p) => p.status === "completed" && isHiRes(p.hero, 1000)));
    if (fallback) featuredList.push(fallback);
  }
  const current = projects.filter((p) => p.status === "current");
  const upcoming = projects.filter((p) => p.status === "upcoming");
  // Hero "Now Building" board: the strongest current project, then the next two in display order.
  const allCurrent = projects.filter((p) => p.status === "current");
  const top = best(allCurrent);
  const nowBuilding = top ? [top, ...allCurrent.filter((p) => p.id !== top.id)].slice(0, 5) : [];

  const tiles: IndustryTile[] = categories
    .filter((c) => c.show_on_home)
    .map((c) => {
      const inCat = projects.filter((p) => p.category_id === c.id);
      // Three best-documented projects as proof points for the market.
      const examples = [...inCat].sort((a, b) => showcaseScore(b) - showcaseScore(a)).slice(0, 3).map((p) => p.name);
      return { ...c, count: inCat.length, examples, href: marketSlugs.has(c.slug) ? `/markets/${c.slug}` : undefined };
    })
    .filter((t) => t.count > 0);

  // Completed work for the editorial grid: best documented first, skipping anything already shown above.
  const completed = projects.filter((p) => p.status === "completed");
  const selected = completed
    .filter((p) => p.hero && !featuredList.some((f) => f.id === p.id))
    .sort((a, b) => showcaseScore(b) - showcaseScore(a))
    .slice(0, 6);

  const locationLine = [site.city, site.service_area].filter(Boolean).join(" · ") || "Florida";

  return (
    <>
      <Hero home={home} nowBuilding={nowBuilding} projectCount={projects.length} currentCount={allCurrent.length} locationLine={locationLine} />
      <StatsBand stats={stats} />
      <CurrentProjects projects={current} heading={home.current_heading ?? "Current Projects"} intro={home.current_intro} />
      <UpcomingProjects projects={upcoming} heading={home.upcoming_heading ?? "Upcoming Projects"} intro={home.upcoming_intro} />
      {featuredList.length > 0 && (
        <FeaturedSwitcher names={featuredList.map((p) => p.name)}>
          {featuredList.map((p, i) => (
            <FeaturedProject key={p.id} project={p} index={i} />
          ))}
        </FeaturedSwitcher>
      )}

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

