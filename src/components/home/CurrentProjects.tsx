import type { ProjectWithMedia } from "@/lib/types";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SectionHeading } from "./SectionHeading";

const LIMIT = 9;

/**
 * "Now Building" board: every active job gets an equal card so the section
 * reads as a full workload, not a single showcase. Photographed jobs lead;
 * jobs awaiting photography get the designed pending panel. Phones swipe
 * through the cards; larger screens get a 2–3 column grid.
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
  // Photographed first, otherwise keep the admin's display order.
  const ordered = [...projects.filter((p) => p.hero), ...projects.filter((p) => !p.hero)];
  const shown = ordered.slice(0, LIMIT);
  const hidden = ordered.length - shown.length;
  const spans = rowSpans(shown.length);
  const oddLast = shown.length % 2 === 1;

  return (
    <section aria-labelledby="current-heading" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading
          id="current-heading"
          eyebrow="Now Building"
          title={heading}
          count={projects.length}
          intro={intro}
          link={{ href: "/projects?status=current", label: hidden > 0 ? `All ${projects.length} current projects` : "All current projects" }}
        />
      </div>

      {/* Phones: swipeable row */}
      <ul className="scrollbar-none -mb-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto pb-4 pl-4 sm:hidden" aria-label="Current projects">
        {shown.map((p) => (
          <li key={p.id} className="w-[82vw] shrink-0 snap-start">
            <ProjectCard project={p} sizes="82vw" />
          </li>
        ))}
        <li className="w-1 shrink-0" aria-hidden />
      </ul>
      {shown.length > 1 && (
        <p className="label shell mt-4 text-mute sm:hidden" aria-hidden>
          Swipe for {shown.length - 1} more →
        </p>
      )}

      {/* Tablet & desktop: equal grid */}
      <ul className="shell hidden gap-x-6 gap-y-12 sm:grid sm:grid-cols-2 lg:grid-cols-6">
        {shown.map((p, i) => (
          <li
            key={p.id}
            className={`${SPAN[spans[i]]} ${oddLast && i === shown.length - 1 ? "sm:col-span-2" : ""}`}
            data-reveal
            style={{ ["--reveal-delay" as string]: `${(i % 3) * 100}ms` }}
          >
            <ProjectCard project={p} sizes={`(min-width: 1024px) ${spans[i] === 3 ? "50vw" : "33vw"}, 50vw`} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const SPAN = { 2: "lg:col-span-2", 3: "lg:col-span-3", 6: "lg:col-span-6" } as const;

/** Column spans (of 6) that fill every desktop row — no empty slots. 5 → 2 wide + 3 narrow. */
function rowSpans(n: number): (2 | 3 | 6)[] {
  if (n === 1) return [6];
  const pairs = n % 3 === 0 ? 0 : n % 3 === 1 ? 2 : 1; // rows of two needed so the rest divide by three
  return Array.from({ length: n }, (_, i) => (i < pairs * 2 ? 3 : 2));
}
