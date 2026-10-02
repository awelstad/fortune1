import type { ResolvedStat } from "@/lib/data";
import { Counter } from "@/components/site/Counter";

const cols: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/** "Fortune by the numbers" — verified figures only, set as the page's loudest type after the hero. */
export function StatsBand({ stats }: { stats: ResolvedStat[] }) {
  if (!stats.length) return null;
  return (
    <section aria-labelledby="numbers-heading" className="blueprint relative bg-ink pb-16 pt-14 text-white sm:pb-24 sm:pt-20">
      <div className="shell">
        <h2 id="numbers-heading" className="label mb-10 flex items-center gap-3 text-fog sm:mb-14" data-reveal>
          <span className="h-px w-8 bg-signal-bright" aria-hidden />
          Fortune by the Numbers
        </h2>
        <dl className={`grid grid-cols-2 gap-y-12 ${cols[Math.min(stats.length, 6)]}`}>
          {stats.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-col-reverse border-t border-white/15 pr-4 pt-6 sm:pr-8 ${i % 2 === 1 ? "max-lg:pl-4 max-lg:sm:pl-8" : ""} ${
                i > 0 ? "lg:border-l lg:pl-8" : ""
              }`}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <dt className="label mt-4 text-fog">{s.label}</dt>
              <dd className="numeral text-[clamp(3.25rem,7.5vw,7.5rem)] text-white">
                <Counter value={s.display} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
