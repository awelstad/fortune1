"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveNowBuilding } from "@/app/admin/(panel)/content-actions";
import { Badge, Button, Card, Notice, Select } from "./ui";

export type NowBuildingJob = { id: string; name: string; value: number; sf: number | null; city: string | null };

const money = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M` : n ? `$${Math.round(n / 1e3)}K` : "");

/**
 * Controls the hero "Now Building" board — the first proof of scale a GC sees.
 * Automatic shows the biggest current jobs; Choose lets the team hand-pick and order them.
 */
export function NowBuildingEditor({
  jobs,
  initial,
}: {
  jobs: NowBuildingJob[]; // current + published, biggest first
  initial: { count: number; mode: "auto" | "manual"; ids: string[] };
}) {
  const router = useRouter();
  const [count, setCount] = useState(initial.count);
  const [mode, setMode] = useState(initial.mode);
  const known = new Set(jobs.map((j) => j.id));
  const [picked, setPicked] = useState<string[]>(
    initial.ids.filter((id) => known.has(id)).length ? initial.ids.filter((id) => known.has(id)) : jobs.slice(0, initial.count).map((j) => j.id),
  );
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const byId = new Map(jobs.map((j) => [j.id, j]));

  const shown = mode === "auto" ? jobs.slice(0, count) : picked.map((id) => byId.get(id)!).filter(Boolean).slice(0, count);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 8 ? p : [...p, id]));
  const move = (id: string, dir: -1 | 1) =>
    setPicked((p) => {
      const i = p.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <Card
      title="Now Building (homepage hero)"
      description="The live-jobs board beside the headline — usually the first thing a GC sees. Only current, published projects can appear."
      actions={<Badge tone="live">{shown.length} showing</Badge>}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="text-xs font-medium text-zinc-700">
              Jobs to show
              <Select value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1.5 w-28!">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </label>
            <div role="radiogroup" aria-label="How jobs are chosen" className="flex rounded-md border border-zinc-300 p-0.5 text-sm">
              {(
                [
                  ["auto", "Automatic — biggest first"],
                  ["manual", "Choose jobs"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={mode === id}
                  onClick={() => setMode(id)}
                  className={`min-h-9 rounded px-3 ${mode === id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            {mode === "auto"
              ? "Ranks current jobs by project value (or electrical contract), then square footage. Updates itself as jobs are added or completed."
              : "Tick the jobs to feature and use the arrows to set their order. Jobs marked Completed drop off automatically."}{" "}
            Phones show the first job; tablets the first three.
          </p>

          {mode === "manual" && (
            <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto rounded-md border border-zinc-200">
              {jobs.length === 0 && <li className="p-3 text-sm text-zinc-500">No current, published projects.</li>}
              {jobs.map((j) => {
                const on = picked.includes(j.id);
                return (
                  <li key={j.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <input type="checkbox" checked={on} onChange={() => toggle(j.id)} aria-label={`Show ${j.name}`} className="size-4 rounded border-zinc-300" />
                    <span className="min-w-0 flex-1 truncate">{j.name}</span>
                    <span className="w-14 text-right text-xs tabular-nums text-zinc-500">{money(j.value)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-700">Preview — in this order</p>
          <ol className="overflow-hidden rounded-md bg-zinc-950 text-white">
            {shown.length === 0 && <li className="p-4 text-sm text-zinc-400">Nothing selected.</li>}
            {shown.map((j, i) => (
              <li key={j.id} className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5 last:border-0">
                <span className="w-5 text-xs text-zinc-500">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold uppercase tracking-tight">{j.name}</span>
                  {j.city && <span className="block text-[11px] uppercase tracking-wider text-zinc-500">{j.city}</span>}
                </span>
                <span className="text-sm font-semibold tabular-nums">{money(j.value)}</span>
                {mode === "manual" && (
                  <span className="flex">
                    <button type="button" onClick={() => move(j.id, -1)} disabled={i === 0} aria-label={`Move ${j.name} up`} className="grid size-8 place-items-center text-zinc-400 hover:text-white disabled:opacity-25">
                      ▲
                    </button>
                    <button type="button" onClick={() => move(j.id, 1)} disabled={i === shown.length - 1} aria-label={`Move ${j.name} down`} className="grid size-8 place-items-center text-zinc-400 hover:text-white disabled:opacity-25">
                      ▼
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ol>
          {mode === "manual" && picked.length > count && (
            <p className="mt-2 text-xs text-amber-700">
              {picked.length} ticked but only {count} show — raise &ldquo;Jobs to show&rdquo; or untick some.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveNowBuilding({ count, mode, ids: picked });
              setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
              if (res.ok) router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Save Now Building"}
        </Button>
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      </div>
    </Card>
  );
}
