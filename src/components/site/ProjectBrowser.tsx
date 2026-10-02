"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, ProjectStatus, ProjectWithMedia } from "@/lib/types";
import { STATUSES } from "@/lib/types";
import { photoFirst } from "@/lib/rank";
import { ProjectCard } from "./ProjectCard";
import { ArrowRight } from "./Icons";
import { ProjectMap } from "./ProjectMap";

type Filters = { status: ProjectStatus | "all"; category: string; city: string; view: "grid" | "map" };

function readFilters(params: URLSearchParams): Filters {
  const s = params.get("status");
  return {
    status: s === "current" || s === "upcoming" || s === "completed" ? s : "all",
    category: params.get("category") ?? "all",
    city: params.get("city") ?? "all",
    view: params.get("view") === "map" ? "map" : "grid",
  };
}

function matches(p: ProjectWithMedia, f: Filters, ignore?: keyof Filters) {
  return (
    (ignore === "status" || f.status === "all" || p.status === f.status) &&
    (ignore === "category" || f.category === "all" || p.category?.slug === f.category) &&
    (ignore === "city" || f.city === "all" || p.city === f.city)
  );
}

export function ProjectBrowser({
  projects,
  categories,
  mode = "full",
  limit,
}: {
  projects: ProjectWithMedia[];
  categories: Category[];
  mode?: "full" | "preview";
  limit?: number;
}) {
  const params = useSearchParams();
  // Only the full /projects browser reads (and writes) filters from the URL.
  const filters = readFilters(mode === "full" ? new URLSearchParams(params.toString()) : new URLSearchParams());
  // Re-sync when the URL changes (e.g. a link to ?view=map from elsewhere on the page).
  const syncKey = mode === "full" ? params.toString() : "preview";
  return <BrowserInner key={syncKey} projects={projects} categories={categories} mode={mode} limit={limit} initial={filters} />;
}


function BrowserInner({
  projects,
  categories,
  mode,
  limit,
  initial,
}: {
  projects: ProjectWithMedia[];
  categories: Category[];
  mode: "full" | "preview";
  limit?: number;
  initial: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initial);

  const update = (next: Partial<Filters>) => {
    const f = { ...filters, ...next };
    setFilters(f);
    if (mode === "full") {
      const q = new URLSearchParams();
      if (f.status !== "all") q.set("status", f.status);
      if (f.category !== "all") q.set("category", f.category);
      if (f.city !== "all") q.set("city", f.city);
      if (f.view === "map") q.set("view", "map");
      const qs = q.toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    }
  };

  // Photography leads; admin display order is kept within each group.
  const results = useMemo(() => photoFirst(projects.filter((p) => matches(p, filters))), [projects, filters]);

  // facet counts respect the *other* active filters
  const statusCounts = useMemo(() => {
    const base = projects.filter((p) => matches(p, filters, "status"));
    return { all: base.length, ...Object.fromEntries(STATUSES.map((s) => [s.key, base.filter((p) => p.status === s.key).length])) } as Record<string, number>;
  }, [projects, filters]);

  const categoryCounts = useMemo(() => {
    const base = projects.filter((p) => matches(p, filters, "category"));
    const counts: Record<string, number> = { all: base.length };
    for (const p of base) if (p.category) counts[p.category.slug] = (counts[p.category.slug] ?? 0) + 1;
    return counts;
  }, [projects, filters]);

  const cities = useMemo(() => {
    const base = projects.filter((p) => matches(p, filters, "city"));
    const counts = new Map<string, number>();
    for (const p of base) if (p.city) counts.set(p.city, (counts.get(p.city) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects, filters]);

  const visibleCategories = categories.filter((c) => (categoryCounts[c.slug] ?? 0) > 0 || filters.category === c.slug);
  const shown = limit ? results.slice(0, limit) : results;
  const active = filters.status !== "all" || filters.category !== "all" || filters.city !== "all";
  const key = `${filters.status}|${filters.category}|${filters.city}`;

  const allHref = (() => {
    const q = new URLSearchParams();
    if (filters.status !== "all") q.set("status", filters.status);
    if (filters.category !== "all") q.set("category", filters.category);
    const qs = q.toString();
    return qs ? `/projects?${qs}` : "/projects";
  })();

  return (
    <div>
      <div
        className={
          mode === "full"
            ? "-mx-4 border-b border-rule bg-paper/90 px-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:sticky lg:top-20 lg:z-30 xl:-mx-12 xl:px-12"
            : "border-b border-rule"
        }
      >
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by status" className="flex gap-1 overflow-x-auto scrollbar-none max-lg:pr-8 max-lg:[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)]">
            {[{ key: "all", label: "All" }, ...STATUSES].map((s) => {
              const count = statusCounts[s.key] ?? 0;
              if (s.key !== "all" && count === 0 && filters.status !== s.key) return null;
              const on = filters.status === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ status: s.key as Filters["status"] })}
                  className={`label min-h-11 shrink-0 px-4 py-3 transition-colors ${
                    on ? "bg-ink text-white" : "text-mute hover:bg-bone hover:text-ink"
                  }`}
                >
                  {s.label} <span className={on ? "text-white/55" : "text-mute"}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {mode === "full" && (
              <div role="group" aria-label="View" className="flex border border-rule bg-white">
                {(["grid", "map"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={filters.view === v}
                    onClick={() => update({ view: v })}
                    className={`label min-h-11 px-4 transition-colors ${filters.view === v ? "bg-ink text-white" : "text-mute hover:text-ink"}`}
                  >
                    {v === "grid" ? "Grid" : "Map"}
                  </button>
                ))}
              </div>
            )}
            {mode === "full" && cities.length > 1 && (
              <label className="relative">
                <span className="sr-only">Filter by location</span>
                <select
                  value={filters.city}
                  onChange={(e) => update({ city: e.target.value })}
                  className="label min-h-11 appearance-none border border-rule bg-white py-3 pl-4 pr-10 text-ink hover:border-ink"
                >
                  <option value="all">All Locations</option>
                  {cities.map(([c, n]) => (
                    <option key={c} value={c}>
                      {c} ({n})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" aria-hidden>
                  ▾
                </span>
              </label>
            )}
            <p className="label whitespace-nowrap text-mute" aria-live="polite">
              {results.length} {results.length === 1 ? "Project" : "Projects"}
            </p>
            {active && (
              <button
                type="button"
                onClick={() => update({ status: "all", category: "all", city: "all" })}
                className="label min-h-11 whitespace-nowrap px-2 text-signal hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter by market"
          className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-4 pr-10 [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]"
        >
          {[{ slug: "all", name: "All Markets", short_name: null }, ...visibleCategories].map((c) => {
            const on = filters.category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() => update({ category: c.slug })}
                className={`label min-h-11 shrink-0 border px-3.5 py-2.5 transition-colors ${
                  on ? "border-ink bg-ink text-white" : "border-rule bg-white text-ink hover:border-ink"
                }`}
              >
                {c.name} <span className={on ? "text-white/55" : "text-mute"}>{categoryCounts[c.slug] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === "full" && filters.view === "map" && shown.length > 0 ? (
        <ProjectMap key={key} projects={results} />
      ) : shown.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-4xl">No projects match.</p>
          <button
            type="button"
            onClick={() => update({ status: "all", category: "all", city: "all" })}
            className="label mt-6 text-signal hover:text-ink"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul key={key} className="grid gap-x-6 gap-y-12 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <li
              key={p.id}
              // Lead card spans two rows on desktop so the next two cards stack beside it — no gap.
              className={`animate-fade-up ${mode === "full" && i === 0 && shown.length > 4 ? "sm:col-span-2 lg:row-span-2" : ""} ${mode === "preview" && i >= 5 ? "max-sm:hidden" : ""}`}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <ProjectCard
                project={p}
                variant={mode === "full" && i === 0 && shown.length > 4 ? "feature" : "standard"}
                fill={mode === "full" && i === 0 && shown.length > 4}
                headingLevel={mode === "full" ? "h2" : "h3"}
                sizes={
                  mode === "full" && i === 0 && shown.length > 4
                    ? "(min-width: 1024px) 66vw, 100vw"
                    : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                }
                priority={mode === "full" && i < 2}
              />
            </li>
          ))}
        </ul>
      )}

      {limit && results.length > limit && (
        <div className="mt-14 flex justify-center">
          <Link
            href={allHref}
            className="label group inline-flex items-center gap-4 bg-ink px-7 py-5 text-white transition-colors hover:bg-signal"
          >
            View all {results.length} projects
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
