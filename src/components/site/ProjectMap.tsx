"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FL_CITIES, FL_PATH, FL_REGIONS, FL_VIEWBOX, projectFL } from "@/lib/florida-map";
import { cardMetrics, locationOf } from "@/lib/format";
import type { ProjectWithMedia } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpRight } from "./Icons";

type Pin = { key: string; label: string; x: number; y: number; projects: ProjectWithMedia[]; current: number };

function pointFor(p: ProjectWithMedia): { key: string; label: string; ll: [number, number] } | null {
  if (p.location_label && FL_REGIONS[p.location_label]) {
    return { key: p.location_label, label: p.location_label.replace(/, FL$/, ""), ll: FL_REGIONS[p.location_label] };
  }
  if (p.city && FL_CITIES[p.city] && (!p.state || p.state === "FL")) return { key: p.city, label: p.city, ll: FL_CITIES[p.city] };
  return null;
}

/**
 * Lightweight SVG map of Florida with a pin per city, sized by project count.
 * No map service, API key or large script. Tap a pin to list that city's work.
 */
export function ProjectMap({ projects }: { projects: ProjectWithMedia[] }) {
  const { pins, unmapped } = useMemo(() => {
    const byKey = new Map<string, Pin>();
    const unmapped: ProjectWithMedia[] = [];
    for (const p of projects) {
      const pt = pointFor(p);
      if (!pt) {
        unmapped.push(p);
        continue;
      }
      const pin = byKey.get(pt.key);
      if (pin) {
        pin.projects.push(p);
        if (p.status === "current") pin.current++;
      } else {
        const [x, y] = projectFL(pt.ll[0], pt.ll[1]);
        byKey.set(pt.key, { key: pt.key, label: pt.label, x, y, projects: [p], current: p.status === "current" ? 1 : 0 });
      }
    }
    // Draw big pins first so small ones stay clickable on top.
    return { pins: [...byKey.values()].sort((a, b) => b.projects.length - a.projects.length), unmapped };
  }, [projects]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = pins.find((p) => p.key === selectedKey) ?? pins[0] ?? null;

  // Zoom to where the work is (with a minimum area so the state stays recognizable),
  // and scale pins/labels with the zoom so they look the same size on screen.
  const view = useMemo(() => {
    const [fx, fy, fw, fh] = FL_VIEWBOX.split(" ").map(Number);
    if (!pins.length) return { box: FL_VIEWBOX, side: fw };
    const xs = pins.map((p) => p.x), ys = pins.map((p) => p.y);
    const size = Math.min(Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 110, fw, fh, Infinity);
    const side = Math.max(size, 300);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const x = Math.min(Math.max(cx - side / 2, fx), fx + fw - side);
    const y = Math.min(Math.max(cy - side / 2, fy), fy + fh - side);
    return { box: `${x.toFixed(1)} ${y.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`, side };
  }, [pins]);
  // Map units per on-screen pixel, so pins and labels keep a readable pixel size at any width.
  const svgRef = useRef<SVGSVGElement>(null);
  const [px, setPx] = useState(560);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPx(Math.max(200, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const s = view.side / px;
  const radius = (n: number) => (6 + Math.sqrt(n) * 3.4) * s;

  // Greedy label placement: biggest cities first, right side then left, skip if it collides.
  const labels = useMemo(() => {
    type Box = { x1: number; y1: number; x2: number; y2: number };
    const placed: Box[] = pins.map((p) => {
      const r = radius(p.projects.length);
      return { x1: p.x - r, y1: p.y - r, x2: p.x + r, y2: p.y + r };
    });
    const hit = (b: Box) => placed.some((o) => b.x1 < o.x2 && b.x2 > o.x1 && b.y1 < o.y2 && b.y2 > o.y1);
    const out = new Map<string, "start" | "end">();
    for (const p of pins) {
      if (p.projects.length < 2 && p.key !== selected?.key) continue;
      const r = radius(p.projects.length);
      const w = p.label.length * 8.4 * s, h = 14 * s, gap = 6 * s;
      const right = { x1: p.x + r + gap, y1: p.y - h / 2, x2: p.x + r + gap + w, y2: p.y + h / 2 };
      const left = { x1: p.x - r - gap - w, y1: p.y - h / 2, x2: p.x - r - gap, y2: p.y + h / 2 };
      if (!hit(right)) {
        placed.push(right);
        out.set(p.key, "start");
      } else if (!hit(left)) {
        placed.push(left);
        out.set(p.key, "end");
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- radius depends only on s
  }, [pins, s, selected?.key]);

  if (!pins.length) {
    return <p className="py-24 text-center text-lg text-mute">No mapped projects match these filters.</p>;
  }

  return (
    <div className="grid gap-8 pt-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <div className="blueprint relative overflow-hidden bg-ink p-3 sm:p-6">
          <svg ref={svgRef} viewBox={view.box} className="aspect-square h-auto w-full" role="group" aria-label="Map of Fortune Electrical projects in Florida">
            <path d={FL_PATH} fill="#151a22" stroke="#6aa5ff" strokeOpacity="0.55" strokeWidth={1.2 * s} strokeLinejoin="round" />
            {pins.map((pin) => {
              const r = radius(pin.projects.length);
              const on = selected?.key === pin.key;
              const anchor = labels.get(pin.key);
              return (
                <g
                  key={pin.key}
                  transform={`translate(${pin.x} ${pin.y})`}
                  className="cursor-pointer outline-none"
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`${pin.label}: ${pin.projects.length} project${pin.projects.length === 1 ? "" : "s"}`}
                  onClick={() => setSelectedKey(pin.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedKey(pin.key);
                    }
                  }}
                >
                  {/* generous invisible hit area for fingers */}
                  <circle r={Math.max(r, 16 * s)} fill="transparent" />
                  {pin.current > 0 && <circle r={r + 5 * s} fill="none" stroke="#5fcf86" strokeWidth={1.5 * s} strokeOpacity="0.8" />}
                  <circle
                    r={r}
                    fill={on ? "#ffffff" : "#2f7bea"}
                    fillOpacity={on ? 1 : 0.9}
                    stroke={on ? "#2f7bea" : "#07090d"}
                    strokeWidth={2 * s}
                    className="transition-[fill] duration-200"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={(r > 13 * s ? 12 : 10.5) * s}
                    fontWeight="700"
                    fill={on ? "#07090d" : "#ffffff"}
                    style={{ fontFamily: "var(--font-mona)", pointerEvents: "none" }}
                  >
                    {pin.projects.length}
                  </text>
                  {anchor && (
                    <text
                      x={anchor === "start" ? r + 6 * s : -(r + 6 * s)}
                      textAnchor={anchor}
                      dominantBaseline="central"
                      fontSize={12 * s}
                      fill="#ffffff"
                      fillOpacity={on ? 1 : 0.75}
                      style={{ fontFamily: "var(--font-geist-mono)", letterSpacing: "0.08em", textTransform: "uppercase", pointerEvents: "none" }}
                    >
                      {pin.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-white/60">
            <span className="label flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-signal" aria-hidden /> Projects per city
            </span>
            <span className="label flex items-center gap-2">
              <span className="size-3 rounded-full border-[1.5px] border-live" aria-hidden /> Current work
            </span>
          </div>
        </div>
        {unmapped.length > 0 && (
          <p className="label mt-3 text-mute">
            + {unmapped.length} project{unmapped.length === 1 ? "" : "s"} without a mapped city
          </p>
        )}
      </div>

      {selected && (
        <div className="lg:col-span-5" aria-live="polite">
          <div className="flex items-end justify-between gap-4 border-b border-ink pb-4">
            <h3 className="font-display text-4xl sm:text-5xl">{selected.label}</h3>
            <p className="label shrink-0 text-mute">
              {selected.projects.length} project{selected.projects.length === 1 ? "" : "s"}
            </p>
          </div>
          <ul className="lg:max-h-[34rem] lg:overflow-y-auto">
            {selected.projects.map((p) => {
              const m = cardMetrics(p, 1)[0];
              return (
                <li key={p.id} className="border-b border-rule">
                  <Link href={`/projects/${p.slug}`} className="group flex min-h-16 items-center justify-between gap-4 py-4">
                    <span className="min-w-0">
                      <span className="font-display block text-xl transition-colors group-hover:text-navy sm:text-2xl">{p.name}</span>
                      <span className="label mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
                        {p.category?.short_name || p.category?.name}
                        <span>{locationOf(p)}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {m && m.key !== "size" && (
                        <span className="numeral hidden text-2xl sm:block">
                          {m.value}
                          {m.unit && <span className="ml-0.5 text-[0.5em]">{m.unit}</span>}
                        </span>
                      )}
                      {p.status !== "completed" && <StatusBadge status={p.status} variant="light" />}
                      <ArrowUpRight />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
