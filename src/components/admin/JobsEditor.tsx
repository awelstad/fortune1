"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveJobs, type JobInput } from "@/app/admin/(panel)/content-actions";
import type { JobOpening } from "@/lib/types";
import { Button, Input, Notice, Select, Textarea } from "./ui";

type Row = JobInput & { key: string };
const TYPES = ["Full-time", "Part-time", "Apprenticeship", "Contract", "Seasonal"];

export function JobsEditor({ jobs }: { jobs: JobOpening[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    jobs.map((j) => ({
      key: j.id,
      id: j.id,
      title: j.title,
      department: j.department ?? "",
      location: j.location ?? "",
      employment_type: j.employment_type ?? "Full-time",
      summary: j.summary ?? "",
      is_active: j.is_active,
    })),
  );
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  return (
    <div className="space-y-4">
      <Notice tone="info">
        Only openings marked <strong>Open</strong> appear on the Careers page. Applications arrive in <strong>Inquiries</strong>.
      </Notice>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.key} className={`rounded-lg border bg-white p-4 ${r.is_active ? "border-zinc-200" : "border-dashed border-zinc-300 opacity-60"}`}>
            <div className="grid gap-3 md:grid-cols-12">
              <Input className="md:col-span-4" value={r.title} placeholder="Job title" aria-label="Job title" onChange={(e) => set(i, { title: e.target.value })} />
              <Input className="md:col-span-3" value={r.department} placeholder="Department" aria-label="Department" onChange={(e) => set(i, { department: e.target.value })} />
              <Input className="md:col-span-2" value={r.location} placeholder="Location" aria-label="Location" onChange={(e) => set(i, { location: e.target.value })} />
              <Select className="md:col-span-3" value={r.employment_type} aria-label="Employment type" onChange={(e) => set(i, { employment_type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
              <Textarea
                className="md:col-span-12"
                rows={2}
                value={r.summary}
                placeholder="One or two sentences about the role"
                aria-label="Summary"
                onChange={(e) => set(i, { summary: e.target.value })}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1">
              <label className="mr-auto flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.is_active} onChange={(e) => set(i, { is_active: e.target.checked })} className="size-4 rounded border-zinc-300" />
                Open (visible on Careers page)
              </label>
              <Button variant="ghost" className="px-2" onClick={() => move(i, -1)} aria-label="Move up">
                ↑
              </Button>
              <Button variant="ghost" className="px-2" onClick={() => move(i, 1)} aria-label="Move down">
                ↓
              </Button>
              <Button
                variant="ghost"
                className="px-2 text-red-600"
                aria-label="Remove"
                onClick={() => {
                  if (confirm(`Remove "${r.title || "this opening"}"? (Takes effect when you save.)`)) setRows(rows.filter((_, j) => j !== i));
                }}
              >
                ×
              </Button>
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
              { key: crypto.randomUUID(), title: "", department: "", location: "Florida", employment_type: "Full-time", summary: "", is_active: true },
            ])
          }
        >
          + Add opening
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveJobs(rows);
              setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
              if (res.ok) router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Save openings"}
        </Button>
      </div>
    </div>
  );
}
