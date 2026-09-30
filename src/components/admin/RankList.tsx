/** Ranked list with an inline single-hue bar — values are always printed, so nothing is color- or hover-gated. */
export function RankList({
  rows,
  empty = "No data yet.",
  unit = "",
}: {
  rows: { label: string; value: number; href?: string }[];
  empty?: string;
  unit?: string;
}) {
  if (!rows.length) return <p className="text-sm text-zinc-500">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            {r.href ? (
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="truncate text-zinc-800 hover:text-signal hover:underline">
                {r.label}
              </a>
            ) : (
              <span className="truncate text-zinc-800">{r.label}</span>
            )}
            <span className="shrink-0 tabular-nums text-zinc-900">
              {r.value.toLocaleString()}
              {unit}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-zinc-100" aria-hidden>
            <div className="h-1.5 rounded-full bg-[#2f7bea]" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}
