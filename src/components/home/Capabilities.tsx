import Link from "next/link";
import type { Capability } from "@/lib/types";
import { ArrowRight } from "@/components/site/Icons";

/**
 * Supporting credibility, deliberately secondary to the projects: a compact
 * 3×2 drawing-sheet grid instead of a long list.
 */
export function Capabilities({ heading, items }: { heading: string; items: Capability[] }) {
  if (!items.length) return null;
  return (
    <section id="capabilities" aria-labelledby="capabilities-heading" className="blueprint scroll-mt-20 bg-graphite py-20 text-white sm:py-28">
      <div className="shell">
        <div className="grid gap-8 pb-12 sm:pb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label mb-5 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              What We Self-Perform
            </p>
            <h2 id="capabilities-heading" className="font-display text-[clamp(3rem,7vw,7rem)]" data-reveal>
              {heading}
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pb-3" data-reveal>
            <p className="max-w-sm leading-relaxed text-fog">
              One team for power distribution, lighting and emergency systems — from preconstruction through commissioning.
            </p>
            <Link
              href="/services"
              className="label group mt-2 inline-flex items-center gap-3 border-b border-white/30 pb-1.5 pt-3 text-white hover:border-white"
            >
              All services <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <ol className="grid border-l border-t border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <li
              key={c.title}
              className="group relative border-b border-r border-white/10 p-6 transition-colors duration-500 hover:bg-white/[0.03] sm:p-8 lg:min-h-64"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 3) * 80}ms` }}
            >
              <span
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal-bright transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                aria-hidden
              />
              <span className="label text-signal-bright">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display-wide mt-6 text-lg leading-tight sm:mt-10 sm:text-xl">{c.title}</h3>
              {c.body && <p className="mt-3 text-sm leading-relaxed text-fog">{c.body}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
