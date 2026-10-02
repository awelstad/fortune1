import Link from "next/link";
import type { ProjectWithMedia } from "@/lib/types";
import { locationOf, projectMetrics } from "@/lib/format";
import { MetricBlock } from "@/components/site/MetricBlock";
import { ProjectMedia } from "@/components/site/ProjectMedia";
import { StatusBadge } from "@/components/site/StatusBadge";
import { ArrowRight } from "@/components/site/Icons";

/** Full-bleed editorial feature: enormous image, dominant numbers. */
export function FeaturedProject({ project, index = 0 }: { project: ProjectWithMedia; index?: number }) {
  const headingId = `featured-heading-${index}`;
  const metrics = projectMetrics(project).slice(0, 4);
  const category = project.category?.name;

  return (
    <section aria-labelledby={headingId} className="relative isolate overflow-hidden bg-ink text-white">
      <div className="grid lg:min-h-[92vh] lg:grid-cols-12">
        <Link
          href={`/projects/${project.slug}`}
          className="group relative block aspect-[4/3] overflow-hidden lg:order-2 lg:col-span-7 lg:aspect-auto"
          tabIndex={-1}
          aria-hidden
        >
          <div className="absolute inset-0" data-reveal="mask">
            <ProjectMedia image={project.hero} alt={project.name} sizes="(min-width: 1024px) 60vw, 100vw" hiResWidth={1000} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent lg:bg-gradient-to-r lg:from-ink lg:via-ink/10" />
        </Link>

        <div className="blueprint relative flex flex-col justify-center gap-10 px-4 py-14 sm:px-8 lg:order-1 lg:col-span-5 lg:py-24 lg:pl-12 lg:pr-4 xl:pl-16">
          <div data-reveal>
            <p className="label flex flex-wrap items-center gap-x-3 gap-y-2 text-fog">
              <span className="text-signal-bright">Featured Project</span>
              {category && (
                <>
                  <span aria-hidden>/</span>
                  {category}
                </>
              )}
              <span aria-hidden>/</span>
              {locationOf(project)}
            </p>
            <h2 id={headingId} className="font-display mt-6 text-[clamp(2.75rem,6vw,6.5rem)] text-balance">
              {project.name}
            </h2>
            <div className="mt-6">
              <StatusBadge status={project.status} variant="dark" />
            </div>
          </div>

          {metrics.length > 0 && (
            <dl className="grid grid-cols-2 gap-px bg-white/10" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
              {metrics.map((m, i) => (
                <div
                  key={m.key}
                  className={`bg-ink p-5 sm:p-6 ${i === metrics.length - 1 && metrics.length % 2 === 1 ? "col-span-2" : ""}`}
                >
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <MetricBlock metric={m} size="lg" tone="dark" />
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div data-reveal style={{ ["--reveal-delay" as string]: "200ms" }}>
            {project.project_size && <p className="label mb-5 text-white/60">{project.project_size}</p>}
            {project.summary && <p className="max-w-md leading-relaxed text-fog">{project.summary}</p>}
            <Link
              href={`/projects/${project.slug}`}
              className="label group mt-8 inline-flex items-center gap-4 bg-white px-6 py-5 text-ink transition-colors hover:bg-signal hover:text-white"
            >
              View Project
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
