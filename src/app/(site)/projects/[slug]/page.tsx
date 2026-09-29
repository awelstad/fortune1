import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Gallery } from "@/components/site/Gallery";
import { JsonLd } from "@/components/site/JsonLd";
import { MetricBlock } from "@/components/site/MetricBlock";
import { ProjectCard } from "@/components/site/ProjectCard";
import { PendingMedia, ProjectMedia } from "@/components/site/ProjectMedia";
import { StatusBadge } from "@/components/site/StatusBadge";
import { ArrowRight } from "@/components/site/Icons";
import { getHomepage, getProject, getProjects, getSite } from "@/lib/data";
import { locationOf, paragraphs, projectMetrics, projectTimeline } from "@/lib/format";
import { isHiRes, mediaUrl } from "@/lib/media";
import { SITE_URL } from "@/lib/site-url";
import type { ProjectWithMedia } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return { title: "Project not found" };
  const where = locationOf(p);
  const description =
    p.seo_description ||
    p.summary ||
    `${p.name} in ${where} — ${p.category?.name ?? "commercial"} electrical construction by Fortune Electrical.`;
  const image = mediaUrl(p.hero?.storage_path);
  return {
    title: p.seo_title || `${p.name} — ${where}`,
    description,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      type: "article",
      title: p.name,
      description,
      url: `/projects/${p.slug}`,
      images: image ? [{ url: image, width: p.hero?.width ?? undefined, height: p.hero?.height ?? undefined, alt: p.name }] : undefined,
    },
  };
}

const bandCols: Record<number, string> = {
  1: "md:grid-cols-2",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-3 xl:grid-cols-5",
};

function related(all: ProjectWithMedia[], p: ProjectWithMedia, n = 3) {
  const others = all.filter((o) => o.id !== p.id);
  const score = (o: ProjectWithMedia) =>
    (o.category_id && o.category_id === p.category_id ? 4 : 0) +
    (o.status === p.status ? 1 : 0) +
    (o.hero ? 3 : 0) +
    (o.city && o.city === p.city ? 1 : 0);
  return others
    .map((o) => ({ o, s: score(o) }))
    .sort((a, b) => b.s - a.s || a.o.display_order - b.o.display_order)
    .slice(0, n)
    .map((x) => x.o);
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, all, site, home] = await Promise.all([getProject(slug), getProjects(), getSite(), getHomepage()]);
  if (!project) notFound();

  const metrics = projectMetrics(project);
  const timeline = projectTimeline(project);
  const body = paragraphs(project.description);
  const team = [
    { label: "General Contractor / CM", value: project.general_contractor },
    { label: "Owner", value: project.owner },
    { label: "Architect / Engineer", value: project.architect },
  ].filter((t) => t.value);
  const gallery = project.images.filter((i) => i.id !== project.hero?.id);
  const more = related(all, project);
  const bigHero = isHiRes(project.hero, 1000);
  const where = locationOf(project);
  const tileCount = metrics.length + timeline.length + (project.project_size ? 1 : 0);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
            { "@type": "ListItem", position: 3, name: project.name, item: `${SITE_URL}/projects/${project.slug}` },
          ],
        }}
      />

      {/* HERO — full-bleed for high-resolution photography; split editorial layout otherwise */}
      {bigHero ? (
        <section className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden bg-ink text-white">
          <div className="absolute inset-0 -z-10">
            <ProjectMedia image={project.hero} alt={project.name} sizes="100vw" priority zoom={false} hiResWidth={1000} className="animate-ken-burns" />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-ink/30" aria-hidden />
          <HeroText project={project} where={where} />
        </section>
      ) : project.hero ? (
        <section className="blueprint relative bg-ink pt-28 text-white sm:pt-36">
          <div className="shell grid gap-10 pb-12 lg:grid-cols-12 lg:items-end lg:pb-16">
            <div className="lg:col-span-7">
              <HeroText project={project} where={where} inline />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-graphite lg:col-span-5" data-reveal="mask">
              <ProjectMedia image={project.hero} alt={project.name} sizes="(min-width: 1024px) 40vw, 100vw" priority zoom={false} />
            </div>
          </div>
        </section>
      ) : (
        // No photography yet: a full-width typographic hero rather than an empty frame.
        <section className="relative isolate overflow-hidden text-white">
          <PendingMedia hero text={project.category?.short_name || project.category?.name} className="-z-10" />
          <div className="shell pb-14 pt-32 sm:pb-20 sm:pt-44">
            <HeroText project={project} where={where} inline />
          </div>
        </section>
      )}

      {/* METRICS — only what applies */}
      {(metrics.length > 0 || timeline.length > 0 || project.project_size) && (
        <section aria-label="Project metrics" className="border-b border-rule bg-paper">
          <div className="shell">
            <dl className={`grid grid-cols-2 border-l border-rule ${bandCols[Math.min(tileCount, 5)]}`}>
              {[...metrics, ...timeline].map((m, i, arr) => (
                <div
                  key={m.key}
                  className={`border-b border-r border-rule p-5 sm:p-8 ${
                    !project.project_size && i === arr.length - 1 && tileCount % 2 === 1 ? "col-span-2 md:col-span-1" : ""
                  }`}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
                >
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <MetricBlock metric={m} size={m.key === "start" || m.key === "end" ? "md" : "lg"} />
                  </dd>
                </div>
              ))}
              {project.project_size && (
                <div className={`border-b border-r border-rule p-5 sm:p-8 ${tileCount % 2 === 1 ? "col-span-2 md:col-span-1" : ""}`} data-reveal>
                  <dt className="sr-only">Scale</dt>
                  <dd>
                    <MetricBlock metric={{ key: "size", value: project.project_size, label: "Scale" }} />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

      {/* Nothing documented yet — say so deliberately instead of leaving a gap. */}
      {metrics.length === 0 && timeline.length === 0 && !project.project_size && body.length === 0 && team.length === 0 && (
        <section className="border-b border-rule bg-paper">
          <div className="shell flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-16">
            <p className="max-w-xl text-lg leading-relaxed text-mute">
              Full project details and photography are being prepared. Want to know more about our work on{" "}
              <span className="text-ink">{project.name}</span>?
            </p>
            <Link
              href="/contact"
              className="label group inline-flex shrink-0 items-center gap-4 bg-ink px-6 py-5 text-white transition-colors hover:bg-signal"
            >
              Talk to our team
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {/* STORY + SCOPE + TEAM */}
      {(body.length > 0 || project.scope.length > 0 || team.length > 0) && (
        <section className="bg-paper py-20 sm:py-28">
          <div className="shell grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {body.length > 0 && (
                <>
                  <h2 className="label mb-8 text-mute">The Project</h2>
                  <div className="space-y-6">
                    {body.slice(0, 4).map((para, i) => (
                      <p
                        key={i}
                        className={i === 0 ? "text-xl leading-relaxed text-ink sm:text-2xl sm:leading-snug" : "text-lg leading-relaxed text-mute"}
                        data-reveal
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
            <aside className="space-y-12 lg:col-span-4 lg:col-start-9">
              {project.scope.length > 0 && (
                <div data-reveal>
                  <h2 className="label border-b border-ink pb-3 text-ink">Fortune&apos;s Scope</h2>
                  <ul>
                    {project.scope.map((s, i) => (
                      <li key={s} className="flex items-baseline gap-4 border-b border-rule py-4">
                        <span className="label text-mute">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-display-wide text-base">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {team.length > 0 && (
                <div data-reveal>
                  <h2 className="label border-b border-ink pb-3 text-ink">Project Team</h2>
                  <dl>
                    {team.map((t) => (
                      <div key={t.label} className="border-b border-rule py-4">
                        <dt className="label text-mute">{t.label}</dt>
                        <dd className="mt-1.5 text-base font-medium">{t.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section aria-labelledby="gallery-heading" className="bg-bone py-20 sm:py-28">
          <div className="shell">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 id="gallery-heading" className="font-display text-5xl sm:text-7xl">
                Gallery
              </h2>
              <p className="label text-mute">{gallery.length} Images</p>
            </div>
            <Gallery images={gallery} name={project.name} />
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="more-heading" className="bg-paper py-20 sm:py-28">
          <div className="shell">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <h2 id="more-heading" className="font-display text-5xl sm:text-7xl">
                More Projects
              </h2>
              <Link href="/projects" className="label group inline-flex items-center gap-3 border-b border-ink/30 pb-1.5 pt-3 hover:border-ink">
                All projects <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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

function HeroText({ project, where, inline = false }: { project: ProjectWithMedia; where: string; inline?: boolean }) {
  return (
    <div className={inline ? "" : "shell pb-12 pt-32 sm:pb-16"}>
      <nav aria-label="Breadcrumb" className="label mb-8 text-white/60" data-reveal>
        <Link href="/projects" className="-my-3 inline-block py-3 hover:text-white">
          Projects
        </Link>
        {project.category && (
          <>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <Link href={`/projects?category=${project.category.slug}`} className="-my-3 inline-block py-3 hover:text-white">
              {project.category.name}
            </Link>
          </>
        )}
      </nav>
      <h1 className="font-display max-w-[18ch] text-[clamp(2.75rem,7.5vw,8rem)] text-balance" data-reveal>
        {project.name}
      </h1>
      <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
        <StatusBadge status={project.status} variant="dark" />
        {project.category && <span className="label bg-white px-2.5 py-1.5 text-ink">{project.category.name}</span>}
        <span className="label px-1 text-white/75">{where}</span>
      </div>
      {project.summary && (
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75" data-reveal style={{ ["--reveal-delay" as string]: "180ms" }}>
          {project.summary}
        </p>
      )}
    </div>
  );
}
