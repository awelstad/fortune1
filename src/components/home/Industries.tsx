import Link from "next/link";
import type { Category, ProjectImage } from "@/lib/types";
import { ProjectMedia } from "@/components/site/ProjectMedia";
import { ArrowUpRight } from "@/components/site/Icons";
import { SectionHeading } from "./SectionHeading";

export type IndustryTile = Category & { count: number; image: ProjectImage | null };

export function Industries({
  heading,
  intro,
  tiles,
}: {
  heading: string;
  intro: string | null;
  tiles: IndustryTile[];
}) {
  if (!tiles.length) return null;
  return (
    <section id="industries" aria-labelledby="industries-heading" className="scroll-mt-20 bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <SectionHeading id="industries-heading" eyebrow="Markets We Serve" title={heading} intro={intro} />
      </div>
      <ul className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-8 lg:shell lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible">
        {tiles.map((t, i) => (
          <li
            key={t.id}
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto"
            data-reveal
            style={{ ["--reveal-delay" as string]: `${(i % 3) * 90}ms` }}
          >
            <Link
              href={`/projects?category=${t.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-graphite text-white lg:aspect-[5/4]"
            >
              <ProjectMedia image={t.image} alt="" sizes="(min-width: 1024px) 33vw, 78vw" hiResWidth={700} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-ink/20 transition-colors duration-500 group-hover:from-navy-deep/95 group-hover:via-navy/40" />
              <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="label text-white/75">
                    {String(t.count).padStart(2, "0")} {t.count === 1 ? "Project" : "Projects"}
                  </span>
                  <span className="grid size-10 place-items-center border border-white/30 transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-ink">
                    <ArrowUpRight />
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-4xl text-balance sm:text-5xl">{t.name}</h3>
                  {t.description && <p className="mt-3 max-w-xs text-sm text-white/70">{t.description}</p>}
                </div>
              </div>
            </Link>
          </li>
        ))}
        <li className="w-1 shrink-0 lg:hidden" aria-hidden />
      </ul>
    </section>
  );
}
