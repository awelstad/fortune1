import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import { CurrentProjects } from "@/components/home/CurrentProjects";
import { UpcomingProjects } from "@/components/home/UpcomingProjects";
import { FeaturedProject } from "@/components/home/FeaturedProject";
import { Capabilities } from "@/components/home/Capabilities";
import { Industries, type IndustryTile } from "@/components/home/Industries";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ClosingCta } from "@/components/site/ClosingCta";
import { ProjectBrowser } from "@/components/site/ProjectBrowser";
import { ProjectCard } from "@/components/site/ProjectCard";
import { getCategories, getHomepage, getProjects, getSite, getStatistics, getTestimonials } from "@/lib/data";
import { GcBand } from "@/components/home/GcBand";
import { safetyFacts } from "@/lib/format";
import { best, photoFirst } from "@/lib/rank";

export const revalidate = 300;

const PORTFOLIO_LIMIT = 9;

export default async function HomePage() {
  const [home, site, projects, categories, stats, testimonials] = await Promise.all([
    getHomepage(),
    getSite(),
    getProjects(),
    getCategories(),
    getStatistics(),
    getTestimonials(),
  ]);

  const featured =
    projects.find((p) => p.id === home.featured_project_id) ?? projects.find((p) => p.featured) ?? null;
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
      return { ...c, count: inCat.length, image };
    })
    .filter((t) => t.count > 0);

  const locationLine = [site.city, site.service_area].filter(Boolean).join(" · ") || "Florida";

  return (
    <>
      <Hero home={home} nowBuilding={nowBuilding} projectCount={projects.length} locationLine={locationLine} />
      <StatsBand stats={stats} />
      <CurrentProjects projects={current} heading={home.current_heading ?? "Current Projects"} intro={home.current_intro} />
      <UpcomingProjects projects={upcoming} heading={home.upcoming_heading ?? "Upcoming Projects"} intro={home.upcoming_intro} />
      {featured && <FeaturedProject project={featured} />}

      {projects.length > 0 && (
        <section aria-labelledby="work-heading" className="bg-paper py-20 sm:py-28 lg:py-36">
          <div className="shell">
            <SectionHeading
              id="work-heading"
              eyebrow="Portfolio"
              title={home.portfolio_heading ?? "Our Work"}
              count={projects.length}
              intro={home.portfolio_intro}
              link={{ href: "/projects", label: "Browse all projects" }}
            />
            <Suspense fallback={<StaticGrid projects={photoFirst(projects).slice(0, PORTFOLIO_LIMIT)} />}>
              <ProjectBrowser projects={projects} categories={categories} mode="preview" limit={PORTFOLIO_LIMIT} />
            </Suspense>
          </div>
        </section>
      )}

      <Capabilities
        heading={home.capabilities_heading ?? "Capabilities"}
        items={home.capabilities}
        imagePath="site/electrical-construction.webp"
      />
      <Industries heading={home.industries_heading ?? "Industries"} intro={home.industries_intro} tiles={tiles} />
      <GcBand testimonials={testimonials} safety={safetyFacts(site.safety ?? {})} />
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

function StaticGrid({ projects }: { projects: Awaited<ReturnType<typeof getProjects>> }) {
  return (
    <ul className="grid gap-x-6 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <li key={p.id}>
          <ProjectCard project={p} />
        </li>
      ))}
    </ul>
  );
}
