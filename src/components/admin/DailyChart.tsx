"use client";

import { useState } from "react";

type Point = { day: string; views: number; visitors: number };

const fmtDay = (d: string, long = false) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(long ? { weekday: "short" } : {}),
  });

function niceMax(n: number) {
  if (n <= 10) return n <= 2 ? 2 : n <= 4 ? 4 : 10; // keep the midpoint tick a whole number
  const p = 10 ** Math.floor(Math.log10(n));
  const s = n / p;
  return (s <= 1 ? 1 : s <= 2 ? 2 : s <= 5 ? 5 : 10) * p;
}

/**
 * Daily visitors as columns (single series → no legend; the card title names it).
 * Each column is its own hit target with a hover/focus tooltip; a table view
 * carries every value without hovering.
 */
export function DailyChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = niceMax(Math.max(1, ...data.map((d) => d.visitors)));
  const W = 720, H = 220, padL = 36, padB = 24, padT = 12;
  const plotW = W - padL, plotH = H - padB - padT;
  const slot = plotW / Math.max(1, data.length);
  const bar = Math.min(24, Math.max(3, slot - 2)); // ≤24px, 2px surface gap between neighbours
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(data.length / 8);
  const a = active !== null ? data[active] : null;

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={() => setTable(!table)} className="text-xs text-zinc-500 underline hover:text-zinc-900">
          {table ? "Show chart" : "Show table"}
        </button>
      </div>
      {table ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500">
              <tr>
                <th className="py-1 font-medium">Day</th>
                <th className="py-1 text-right font-medium">Visitors</th>
                <th className="py-1 text-right font-medium">Page views</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-t border-zinc-100">
                  <td className="py-1">{fmtDay(d.day, true)}</td>
                  <td className="py-1 text-right tabular-nums">{d.visitors.toLocaleString()}</td>
                  <td className="py-1 text-right tabular-nums text-zinc-500">{d.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Daily visitors">
            {ticks.map((t) => {
              const y = padT + plotH - (t / max) * plotH;
              return (
                <g key={t}>
                  <line x1={padL} x2={W} y1={y} y2={y} stroke="#e4e4e7" strokeWidth="1" />
                  <text x={padL - 6} y={y} textAnchor="end" dominantBaseline="central" fontSize="10" fill="#71717a">
                    {Math.round(t).toLocaleString()}
                  </text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const h = (d.visitors / max) * plotH;
              const x = padL + i * slot + (slot - bar) / 2;
              const y = padT + plotH - h;
              const r = Math.min(4, bar / 2, h);
              // rounded data-end, square at the baseline
              const path =
                h <= 0
                  ? ""
                  : `M${x},${padT + plotH}V${y + r}Q${x},${y} ${x + r},${y}H${x + bar - r}Q${x + bar},${y} ${x + bar},${y + r}V${padT + plotH}Z`;
              return (
                <g
                  key={d.day}
                  tabIndex={0}
                  role="img"
                  aria-label={`${fmtDay(d.day, true)}: ${d.visitors} visitors, ${d.views} page views`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="outline-none"
                >
                  {/* hit target: the full column slot */}
                  <rect x={padL + i * slot} y={padT} width={slot} height={plotH} fill="transparent" />
                  {path && <path d={path} fill="#2f7bea" fillOpacity={active === null || active === i ? 1 : 0.45} />}
                  {i % labelEvery === 0 && (
                    <text x={padL + i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#71717a">
                      {fmtDay(d.day)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {a && active !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm"
              style={{ left: `${((padL + active * slot + slot / 2) / W) * 100}%` }}
            >
              <p className="text-zinc-500">{fmtDay(a.day, true)}</p>
              <p className="mt-1 flex items-center gap-2">
                <span className="inline-block h-0.5 w-3 bg-[#2f7bea]" aria-hidden />
                <strong className="text-sm text-zinc-900">{a.visitors.toLocaleString()}</strong> visitors
              </p>
              <p className="mt-0.5 pl-5 text-zinc-500">{a.views.toLocaleString()} page views</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
