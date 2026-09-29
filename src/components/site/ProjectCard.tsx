import Link from "next/link";
import type { ProjectWithMedia } from "@/lib/types";
import { cardMetrics, formatMonthYear, locationOf } from "@/lib/format";
import { ProjectMedia } from "./ProjectMedia";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpRight } from "./Icons";

type Variant = "standard" | "feature" | "tall";

const aspect: Record<Variant, string> = {
  standard: "aspect-[4/3]",
  tall: "aspect-[4/5]",
  feature: "aspect-[4/5] sm:aspect-[16/10]",
};

/**
 * Portfolio card. The image dominates; scale is stated in large numerals over
 * the image so it registers before any text is read.
 */
export function ProjectCard({
  project,
  variant = "standard",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  showStatus = true,
  headingLevel = "h3",
}: {
  project: ProjectWithMedia;
  variant?: Variant;
  sizes?: string;
  priority?: boolean;
  showStatus?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const metrics = cardMetrics(project, variant === "feature" ? 3 : 2);
  const category = project.category?.short_name || project.category?.name;
  const Heading = headingLevel;
  const expected = project.status === "upcoming" ? formatMonthYear(project.start_date) : null;
  const isFeature = variant === "feature";

  return (
    <article className="group relative">
      <Link
        href={`/projects/${project.slug}`}
        className="block focus-visible:outline-offset-4"
        aria-label={`${project.name} — ${locationOf(project)}`}
      >
        <div className={`relative overflow-hidden bg-graphite ${aspect[variant]}`}>
          <ProjectMedia
            image={project.hero}
            alt={project.name}
            sizes={sizes}
            priority={priority}
            hiResWidth={isFeature ? 1000 : 600}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/10 transition-opacity duration-700 group-hover:opacity-90"
            aria-hidden
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
            {category ? (
              <span className="label bg-white px-2.5 py-1.5 text-ink">{category}</span>
            ) : (
              <span />
            )}
            {showStatus && <StatusBadge status={project.status} />}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            {isFeature && (
              <Heading className="font-display mb-5 max-w-[16ch] text-4xl text-white sm:text-6xl lg:text-7xl">
                {project.name}
              </Heading>
            )}
            {metrics.length > 0 && (
              <dl className={`flex flex-wrap gap-x-8 gap-y-3 ${isFeature ? "border-t border-white/20 pt-5" : ""}`}>
                {metrics.map((m) => (
                  <div key={m.key} className="min-w-0">
                    <dt className="sr-only">{m.label}</dt>
                    <dd
                      className={
                        m.key === "size"
                          ? "font-display-wide text-sm leading-tight text-white sm:text-base"
                          : `numeral text-white ${isFeature ? "text-5xl sm:text-6xl" : "text-4xl sm:text-[2.75rem]"}`
                      }
                    >
                      {m.value}
                      {m.unit && <span className="ml-1 text-[0.42em] tracking-normal">{m.unit}</span>}
                    </dd>
                    <dd className="label mt-1.5 text-white/65" aria-hidden>
                      {m.label}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {!isFeature ? (
          <div className="flex items-start justify-between gap-4 border-b border-rule pb-4 pt-4">
            <div className="min-w-0">
              <Heading className="font-display text-2xl text-balance sm:text-[1.75rem]">{project.name}</Heading>
              <p className="label mt-2 text-mute">
                {locationOf(project)}
                {expected && <span className="text-ink"> · Expected {expected}</span>}
              </p>
            </div>
            <span className="mt-1 grid size-9 shrink-0 place-items-center border border-rule transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
              <ArrowUpRight />
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 border-b border-rule py-4">
            <p className="label text-mute">{locationOf(project)}</p>
            <span className="label inline-flex items-center gap-2 text-ink">
              View Project <ArrowUpRight />
            </span>
          </div>
        )}
      </Link>
    </article>
  );
}
