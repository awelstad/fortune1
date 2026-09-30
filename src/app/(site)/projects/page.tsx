import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProjectBrowser } from "@/components/site/ProjectBrowser";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ClosingCta } from "@/components/site/ClosingCta";
import { getCategories, getHomepage, getProjects, getSite } from "@/lib/data";
import { compactNumber, fullNumber } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/projects");
}

export default async function ProjectsPage() {
  const [projects, categories, site, home] = await Promise.all([
    getProjects(),
    getCategories(),
    getSite(),
    getHomepage(),
  ]);

  const count = (s: string) => projects.filter((p) => p.status === s).length;
  const sf = projects.reduce((n, p) => n + (p.square_feet ?? 0), 0);
  const cities = new Set(projects.map((p) => p.city).filter(Boolean)).size;

  const facts = [
    { label: "Projects", value: fullNumber(projects.length) },
    { label: "Current", value: fullNumber(count("current")), live: true },
    { label: "Upcoming", value: fullNumber(count("upcoming")) },
    { label: "Square Feet", value: sf ? compactNumber(sf) : null },
    { label: "Florida Markets", value: cities ? fullNumber(cities) : null },
  ].filter((f) => f.value && f.value !== "0");

  return (
    <>
      <section className="blueprint relative bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              Portfolio
            </p>
            <h1 className="font-display text-[clamp(3.5rem,11vw,11rem)]" data-reveal>
              Our Projects
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-4" data-reveal>
            <p className="max-w-md text-lg leading-relaxed text-fog">
              Terminals, courthouses, campuses, senior living towers and multifamily communities — the work speaks for
              itself.
            </p>
            <Link
              href="/projects?view=map#browse"
              className="label group mt-6 inline-flex min-h-12 items-center gap-3 border border-white/30 px-5 py-3 text-white transition-colors hover:border-white hover:bg-white/10"
            >
              View on the Florida map
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
        {facts.length > 0 && (
          <div className="shell mt-14">
            <dl className="grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-3 lg:grid-cols-5">
              {facts.map((f) => (
                <div key={f.label} className="border-b border-r border-white/10 p-5 sm:p-6">
                  <dt className="label flex items-center gap-2 text-fog">
                    {f.live && <span className="size-1.5 animate-pulse-live rounded-full bg-live" aria-hidden />}
                    {f.label}
                  </dt>
                  <dd className="numeral mt-3 text-5xl sm:text-6xl">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <section id="browse" aria-label="Project browser" className="scroll-mt-20 bg-paper pb-24 sm:pb-32">
        <div className="shell">
          <Suspense
            fallback={
              <ul className="grid gap-x-6 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.id}>
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            }
          >
            <ProjectBrowser projects={projects} categories={categories} mode="full" />
          </Suspense>
        </div>
      </section>

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
