import Link from "next/link";
import type { ProjectWithMedia } from "@/lib/types";
import { cardMetrics, formatMonthYear, locationOf } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpRight } from "./Icons";

/**
 * Typographic project index — used for work that doesn't have photography yet.
 * Reads as an architecture firm's project list rather than a row of empty boxes.
 */
export function ProjectIndex({
  projects,
  start = 1,
  showStatus = false,
  title,
}: {
  projects: ProjectWithMedia[];
  start?: number;
  showStatus?: boolean;
  title?: string;
}) {
  if (!projects.length) return null;
  return (
    <div>
      {title && <p className="label mb-4 text-mute">{title}</p>}
      <ol className="border-t border-ink">
        {projects.map((p, i) => {
          const metric = cardMetrics(p, 1)[0];
          const expected = p.status === "upcoming" ? formatMonthYear(p.start_date) : null;
          const category = p.category?.short_name || p.category?.name;
          return (
            <li key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${Math.min(i, 6) * 60}ms` }}>
              <Link
                href={`/projects/${p.slug}`}
                className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-rule py-6 transition-colors hover:border-ink sm:grid-cols-[4rem_1fr_auto] sm:py-8 lg:grid-cols-[5rem_minmax(0,1fr)_16rem_auto]"
              >
                <span className="label self-start pt-2 text-mute sm:pt-3">{String(start + i).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="font-display block text-[clamp(1.9rem,4.6vw,4.25rem)] text-balance transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-navy">
                    {p.name}
                  </span>
                  <span className="label mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-mute lg:hidden">
                    {category && <span className="text-ink">{category}</span>}
                    <span>{locationOf(p)}</span>
                    {expected && <span>Expected {expected}</span>}
                  </span>
                </span>
                <span className="hidden flex-col gap-2 lg:flex">
                  {category && <span className="label text-ink">{category}</span>}
                  <span className="label text-mute">{locationOf(p)}</span>
                  {expected && <span className="label text-mute">Expected {expected}</span>}
                  {metric && metric.key !== "size" && (
                    <span className="numeral mt-1 text-3xl">
                      {metric.value}
                      {metric.unit && <span className="ml-1 text-xs">{metric.unit}</span>}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  {showStatus && (
                    <span className="hidden sm:inline-flex">
                      <StatusBadge status={p.status} variant="light" />
                    </span>
                  )}
                  <span className="grid size-10 place-items-center border border-rule transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:size-12">
                    <ArrowUpRight />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
