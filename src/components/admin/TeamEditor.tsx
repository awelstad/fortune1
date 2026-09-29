"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveTeam, type TeamInput } from "@/app/admin/(panel)/content-actions";
import type { TeamMember } from "@/lib/types";
import { SingleImageField } from "./SingleImageField";
import { Button, Input, Notice } from "./ui";

type Row = TeamInput & { key: string };

export function TeamEditor({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    members.map((m) => ({
      key: m.id,
      id: m.id,
      name: m.name,
      title: m.title ?? "",
      group_name: m.group_name,
      email: m.email ?? "",
      photo_path: m.photo_path,
      is_active: m.is_active,
    })),
  );
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const groups = [...new Set(rows.map((r) => r.group_name).filter(Boolean))];

  const set = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };
  const save = () =>
    start(async () => {
      const res = await saveTeam(rows);
      setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
      if (res.ok) router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <p className="text-sm text-zinc-500">
          {rows.length} people · order here = order on the site (groups appear in the order of their first person)
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              setRows([
                ...rows,
                { key: crypto.randomUUID(), name: "", title: "", group_name: groups[0] ?? "Team", email: "", photo_path: null, is_active: true },
              ])
            }
          >
            + Add person
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save team"}
          </Button>
        </div>
      </div>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <datalist id="team-groups">
        {groups.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>

      <ol className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((r, i) => (
          <li
            key={r.key}
            className={`grid grid-cols-[7rem_1fr] gap-4 rounded-lg border bg-white p-4 ${r.is_active ? "border-zinc-200" : "border-dashed border-zinc-300 opacity-60"}`}
          >
            <SingleImageField
              name={`photo_${i}`}
              folder="team"
              initialPath={r.photo_path}
              aspect="aspect-[4/5]"
              minWidth={600}
              onChange={(p) => set(i, { photo_path: p })}
            />
            <div className="min-w-0 space-y-2">
              <Input value={r.name} placeholder="Full name" aria-label="Name" onChange={(e) => set(i, { name: e.target.value })} />
              <Input value={r.title} placeholder="Title" aria-label="Title" onChange={(e) => set(i, { title: e.target.value })} />
              <Input
                value={r.group_name}
                placeholder="Group (e.g. Leadership)"
                aria-label="Group"
                list="team-groups"
                onChange={(e) => set(i, { group_name: e.target.value })}
              />
              <Input value={r.email} type="email" placeholder="Email (optional)" aria-label="Email" onChange={(e) => set(i, { email: e.target.value })} />
              <div className="flex flex-wrap items-center gap-1 pt-1">
                <label className="mr-auto flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={r.is_active} onChange={(e) => set(i, { is_active: e.target.checked })} className="size-4 rounded border-zinc-300" />
                  Show on site
                </label>
                <Button variant="ghost" className="px-2" onClick={() => move(i, -1)} aria-label={`Move ${r.name} up`}>
                  ↑
                </Button>
                <Button variant="ghost" className="px-2" onClick={() => move(i, 1)} aria-label={`Move ${r.name} down`}>
                  ↓
                </Button>
                <Button
                  variant="ghost"
                  className="px-2 text-red-600"
                  aria-label={`Remove ${r.name}`}
                  onClick={() => {
                    if (confirm(`Remove ${r.name || "this person"}? (Takes effect when you save.)`)) setRows(rows.filter((_, j) => j !== i));
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex justify-end">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save team"}
        </Button>
      </div>
    </div>
  );
}
