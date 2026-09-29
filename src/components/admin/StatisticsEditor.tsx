"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveStatistics, type StatInput } from "@/app/admin/(panel)/content-actions";
import { compactNumber, fullNumber } from "@/lib/format";
import type { AutoSource, CompanyStatistic } from "@/lib/types";
import { Button, Input, Notice, Select } from "./ui";

const SOURCES: { value: AutoSource; label: string }[] = [
  { value: "manual", label: "Manual value" },
  { value: "project_count", label: "Auto: # published projects" },
  { value: "square_feet", label: "Auto: total square feet" },
  { value: "units", label: "Auto: total units" },
  { value: "project_value", label: "Auto: total project value" },
  { value: "contract_value", label: "Auto: total electrical contracts" },
];

export function StatisticsEditor({
  stats,
  autoValues,
}: {
  stats: CompanyStatistic[];
  autoValues: Record<AutoSource, number>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<StatInput[]>(
    stats.map((s) => ({
      id: s.id,
      label: s.label,
      value: s.value === null ? "" : String(Number(s.value)),
      prefix: s.prefix ?? "",
      suffix: s.suffix ?? "",
      auto_source: s.auto_source,
      compact: s.compact,
      description: s.description ?? "",
      is_active: s.is_active,
    })),
  );
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set = (i: number, patch: Partial<StatInput>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  const preview = (r: StatInput) => {
    const n = r.auto_source === "manual" ? Number(r.value.replace(/[,\s$]/g, "")) : autoValues[r.auto_source];
    if (!n || !Number.isFinite(n)) return "— (hidden until a value exists)";
    return `${r.prefix}${r.compact ? compactNumber(n) : fullNumber(n)}${r.suffix}`;
  };

  return (
    <div className="space-y-4">
      <Notice tone="info">
        Never enter estimates. Stats without a value are hidden automatically. &ldquo;Auto&rdquo; stats are calculated live from your
        published projects.
      </Notice>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.id ?? `new-${i}`} className={`rounded-lg border bg-white p-4 ${r.is_active ? "border-zinc-200" : "border-dashed border-zinc-300 opacity-70"}`}>
            <div className="grid gap-3 md:grid-cols-12 md:items-end">
              <label className="md:col-span-3">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Label</span>
                <Input value={r.label} onChange={(e) => set(i, { label: e.target.value })} />
              </label>
              <label className="md:col-span-3">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Source</span>
                <Select value={r.auto_source} onChange={(e) => set(i, { auto_source: e.target.value as AutoSource })}>
                  {SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Value</span>
                <Input
                  value={r.auto_source === "manual" ? r.value : ""}
                  placeholder={r.auto_source === "manual" ? "e.g. 20" : "auto"}
                  disabled={r.auto_source !== "manual"}
                  inputMode="decimal"
                  onChange={(e) => set(i, { value: e.target.value })}
                />
              </label>
              <label className="md:col-span-1">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Prefix</span>
                <Input value={r.prefix} placeholder="$" onChange={(e) => set(i, { prefix: e.target.value })} />
              </label>
              <label className="md:col-span-1">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Suffix</span>
                <Input value={r.suffix} placeholder="+" onChange={(e) => set(i, { suffix: e.target.value })} />
              </label>
              <div className="flex gap-1 md:col-span-2 md:justify-end">
                <Button variant="ghost" className="px-2" onClick={() => move(i, -1)} aria-label="Move up">
                  ↑
                </Button>
                <Button variant="ghost" className="px-2" onClick={() => move(i, 1)} aria-label="Move down">
                  ↓
                </Button>
                <Button variant="ghost" className="px-2 text-red-600" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove">
                  ×
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={r.is_active} onChange={(e) => set(i, { is_active: e.target.checked })} className="size-4 rounded border-zinc-300" />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={r.compact} onChange={(e) => set(i, { compact: e.target.checked })} className="size-4 rounded border-zinc-300" />
                Compact (2.1M)
              </label>
              <span className="text-zinc-500">
                Preview: <strong className="text-zinc-900">{preview(r)}</strong>
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            setRows([
              ...rows,
              { label: "", value: "", prefix: "", suffix: "", auto_source: "manual", compact: false, description: "", is_active: true },
            ])
          }
        >
          + Add statistic
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveStatistics(rows);
              setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
              if (res.ok) router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Save statistics"}
        </Button>
      </div>
    </div>
  );
}
