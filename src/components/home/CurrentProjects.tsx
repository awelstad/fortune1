import type { ProjectWithMedia } from "@/lib/types";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionHeading } from "./SectionHeading";

/**
 * Editorial, non-uniform layout: the lead project is shown large, the next two
 * stack beside it, and the rest fall into a three-column grid.
 */
export function CurrentProjects({
  projects,
  heading,
  intro,
}: {
  projects: ProjectWithMedia[];
  heading: string;
  intro: string | null;
}) {
  if (!projects.length) return null;
  const [lead, ...rest] = projects;
  const side = rest.slice(0, 2);
  const more = rest.slice(2);

  return (
    <section aria-labelledby="current-heading" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading
          id="current-heading"
          eyebrow="Now Building"
          title={heading}
          count={projects.length}
          intro={intro}
          link={{ href: "/projects?status=current", label: "All current projects" }}
        />

        {side.length === 0 ? (
          <div data-reveal>
            <ProjectCard project={lead} variant="feature" sizes="100vw" />
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-8" data-reveal>
              <ProjectCard project={lead} variant="feature" sizes="(min-width: 1024px) 66vw, 100vw" />
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
              {side.map((p, i) => (
                <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i + 1) * 120}ms` }}>
                  <ProjectCard project={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </div>
              ))}
            </div>
          </div>
        )}

        {more.length > 0 && (
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 100}ms` }}>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
