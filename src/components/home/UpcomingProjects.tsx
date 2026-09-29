import type { ProjectWithMedia } from "@/lib/types";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionHeading } from "./SectionHeading";

/** Pipeline: horizontally scrollable on phones, grid on desktop. */
export function UpcomingProjects({
  projects,
  heading,
  intro,
}: {
  projects: ProjectWithMedia[];
  heading: string;
  intro: string | null;
}) {
  if (!projects.length) return null;
  return (
    <section aria-labelledby="upcoming-heading" className="border-t border-rule bg-bone py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          id="upcoming-heading"
          eyebrow="Pipeline"
          title={heading}
          count={projects.length}
          intro={intro}
          link={{ href: "/projects?status=upcoming", label: "All upcoming projects" }}
        />
      </div>
      <div className="scrollbar-none -mb-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pl-4 sm:pl-8 lg:hidden">
        {projects.map((p) => (
          <div key={p.id} className="w-[82vw] shrink-0 snap-start sm:w-[44vw]">
            <ProjectCard project={p} variant="tall" sizes="82vw" />
          </div>
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
      <div className="shell hidden gap-6 lg:grid lg:grid-cols-3">
        {projects.map((p, i) => (
          <div key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 100}ms` }}>
            <ProjectCard project={p} variant="tall" />
          </div>
        ))}
      </div>
    </section>
  );
}
