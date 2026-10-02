import Link from "next/link";
import type { ProjectWithMedia } from "@/lib/types";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ArrowRight } from "@/components/site/Icons";
import { SectionHeading } from "./SectionHeading";

/**
 * Curated completed work in an editorial layout — one large lead, two stacked
 * beside it, three below. No filters here: the homepage tells the story, the
 * Projects page does the searching.
 */
export function SelectedWork({
  projects,
  total,
  heading,
  intro,
}: {
  projects: ProjectWithMedia[];
  total: number;
  heading: string;
  intro: string | null;
}) {
  if (projects.length < 3) return null;
  const [lead, ...rest] = projects;
  const side = rest.slice(0, 2);
  const row = rest.slice(2, 5);

  return (
    <section aria-labelledby="work-heading" className="bg-paper pb-20 pt-4 sm:pb-28 lg:pb-36">
      <div className="shell">
        <SectionHeading
          id="work-heading"
          eyebrow="Completed Work"
          title={heading}
          count={total}
          intro={intro}
          link={{ href: "/projects", label: `Browse all ${total} projects` }}
        />

        <div className="grid gap-x-6 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8" data-reveal>
            <ProjectCard project={lead} variant="feature" fill sizes="(min-width: 1024px) 66vw, 100vw" />
          </div>
          <div className="grid gap-12 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            {side.map((p, i) => (
              <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i + 1) * 120}ms` }}>
                <ProjectCard project={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </div>
            ))}
          </div>
        </div>

        {row.length > 0 && (
          <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {row.map((p, i) => (
              <li
                key={p.id}
                className={i === 2 ? "max-lg:hidden" : ""}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
              >
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-16 flex justify-center sm:mt-20">
          <Link
            href="/projects"
            className="label group inline-flex min-h-14 items-center gap-4 bg-ink px-7 py-5 text-white transition-colors hover:bg-signal"
          >
            View all {total} projects
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
