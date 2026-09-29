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

export function StatsBand({ stats }: { stats: ResolvedStat[] }) {
  if (!stats.length) return null;
  return (
    <section aria-label="Company scale" className="blueprint relative bg-ink text-white">
      <div className="shell">
        <div className={`grid grid-cols-2 border-l border-white/10 ${cols[Math.min(stats.length, 6)]}`}>
          {stats.map((s, i) => (
            <div
              key={s.id}
              className="border-b border-r border-white/10 px-4 py-10 sm:px-8 sm:py-14 lg:py-20"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <p className="numeral text-[clamp(3rem,7vw,7rem)] text-white">
                <Counter value={s.display} />
              </p>
              <p className="label mt-4 text-fog">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
