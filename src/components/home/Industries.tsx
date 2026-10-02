import Link from "next/link";
import type { Category } from "@/lib/types";
import { ArrowUpRight } from "@/components/site/Icons";
import { SectionHeading } from "./SectionHeading";

export type IndustryTile = Category & { count: number; examples: string[]; href?: string };

/**
 * Typographic market index — answers "have they built projects like mine?"
 * with names and real project examples instead of a wall of image tiles.
 */
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
        <ol className="border-t border-ink">
          {tiles.map((t, i) => (
            <li key={t.id} data-reveal style={{ ["--reveal-delay" as string]: `${Math.min(i, 6) * 50}ms` }}>
              <Link
                href={t.href ?? `/projects?category=${t.slug}`}
                className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-rule py-5 transition-colors hover:border-ink sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:py-6 lg:grid-cols-[4rem_minmax(0,5fr)_minmax(0,4fr)_auto] lg:gap-x-8"
              >
                <span className="label text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="font-display block text-[clamp(1.85rem,4vw,3.75rem)] leading-[0.95] text-balance transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-navy">
                    {t.name}
                  </span>
                  <span className="label mt-2 block text-mute lg:hidden">
                    {t.count} {t.count === 1 ? "project" : "projects"}
                  </span>
                </span>
                <span className="hidden text-sm leading-relaxed text-mute lg:block">{t.examples.join(" · ")}</span>
                <span className="flex items-center gap-5">
                  <span className="hidden text-right lg:block">
                    <span className="numeral block text-4xl">{String(t.count).padStart(2, "0")}</span>
                    <span className="label text-mute">{t.count === 1 ? "Project" : "Projects"}</span>
                  </span>
                  <span className="grid size-10 place-items-center border border-rule transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:size-12">
                    <ArrowUpRight />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
