import type { Project, ProjectStatus } from "./types";

const nf = new Intl.NumberFormat("en-US");

/** 331000000 -> "331M", 2100000 -> "2.1M", 15500000 -> "15.5M", 950000 -> "950K" */
export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  const fmt = (v: number, unit: string) => `${Number(v.toFixed(v >= 100 ? 0 : 1))}${unit}`;
  if (abs >= 1e9) return fmt(n / 1e9, "B");
  if (abs >= 1e6) return fmt(n / 1e6, "M");
  if (abs >= 1e4) return fmt(n / 1e3, "K");
  return nf.format(n);
}

export function fullNumber(n: number): string {
  return nf.format(n);
}

export function money(n: number): string {
  return n >= 1e5 ? `$${compactNumber(n)}` : `$${nf.format(n)}`;
}

/** Square feet: keep the full figure until a million — "291,345" reads bigger than "291K". */
export function squareFeet(n: number): string {
  return n >= 1e6 ? compactNumber(n) : nf.format(n);
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
export function formatMonthYear(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : monthYear.format(d);
}

export function locationOf(p: Pick<Project, "city" | "state" | "location_label">): string {
  if (p.location_label) return p.location_label;
  if (p.city) return p.state ? `${p.city}, ${p.state}` : p.city;
  return p.state === "FL" || !p.state ? "Florida" : p.state;
}

export const statusLabel: Record<ProjectStatus, string> = {
  current: "Current",
  upcoming: "Upcoming",
  completed: "Completed",
};

export type Metric = {
  key: string;
  value: string;
  unit?: string;
  label: string;
};

/**
 * Every metric that actually applies to a project, in order of how strongly it
 * communicates scale. Empty fields never produce a metric.
 */
export function projectMetrics(p: Project): Metric[] {
  const m: Metric[] = [];
  if (p.project_value) m.push({ key: "value", value: money(p.project_value), label: "Project Value" });
  if (p.square_feet) m.push({ key: "sf", value: squareFeet(p.square_feet), unit: "SF", label: "Square Feet" });
  if (p.units) m.push({ key: "units", value: fullNumber(p.units), label: "Units" });
  if (p.stories) m.push({ key: "stories", value: String(p.stories), label: p.stories === 1 ? "Story" : "Stories" });
  if (p.electrical_contract_value)
    m.push({ key: "contract", value: money(p.electrical_contract_value), label: "Electrical Contract" });
  return m;
}

/** Timeline facts for the detail page, only when present. */
export function projectTimeline(p: Project): Metric[] {
  const m: Metric[] = [];
  const start = formatMonthYear(p.start_date);
  const end = formatMonthYear(p.completion_date);
  if (start) m.push({ key: "start", value: start, label: p.status === "upcoming" ? "Expected Start" : "Start" });
  if (end)
    m.push({
      key: "end",
      value: end,
      label: p.status === "completed" ? "Completed" : "Est. Completion",
    });
  return m;
}

/**
 * Below these, a figure undersells on a card (a "$30,000" headline reads as a
 * small shop). The project page still lists every fact.
 */
const CARD_FLOOR: Partial<Record<string, (p: Project) => boolean>> = {
  sf: (p) => (p.square_feet ?? 0) >= 10_000,
  stories: (p) => (p.stories ?? 0) >= 3,
  contract: (p) => (p.electrical_contract_value ?? 0) >= 250_000,
};

/** Up to `n` headline metrics for cards — only ones that communicate scale. Falls back to free-form project size. */
export function cardMetrics(p: Project, n = 2): Metric[] {
  const m = projectMetrics(p).filter((x) => CARD_FLOOR[x.key]?.(p) ?? true);
  if (m.length < n && p.project_size) m.push({ key: "size", value: p.project_size, label: "Scale" });
  return m.slice(0, n);
}

export function paragraphs(text: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Safety figures that have been filled in, in display order. */
export function safetyFacts(s: {
  emr?: string;
  trir?: string;
  dart?: string;
  lost_time_free?: string;
}): { key: string; value: string; label: string }[] {
  const out: { key: string; value: string; label: string }[] = [];
  if (s.emr?.trim()) out.push({ key: "emr", value: s.emr.trim(), label: "EMR" });
  if (s.trir?.trim()) out.push({ key: "trir", value: s.trir.trim(), label: "TRIR" });
  if (s.lost_time_free?.trim()) out.push({ key: "ltf", value: s.lost_time_free.trim(), label: "Without a lost-time incident" });
  if (s.dart?.trim()) out.push({ key: "dart", value: s.dart.trim(), label: "DART rate" });
  return out;
}

/** Default documents a GC can request when none are configured. */
export const DEFAULT_PREQUAL_DOCS = [
  "Prequalification questionnaire",
  "Certificate of insurance",
  "W-9",
  "Contractor license(s)",
  "Safety program / EMR letter",
  "Bonding letter",
];
