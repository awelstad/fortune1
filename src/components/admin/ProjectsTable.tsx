"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  archiveProject,
  deleteProject,
  duplicateProject,
  patchProject,
  reorderProjects,
} from "@/app/admin/(panel)/projects/actions";
import { mediaUrl } from "@/lib/media";
import type { Category, ProjectStatus } from "@/lib/types";
import { Badge, Button, Input, Notice, Select } from "./ui";

export type AdminProjectRow = {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  category_id: string | null;
  city: string | null;
  state: string | null;
  location_label: string | null;
  published: boolean;
  featured: boolean;
  archived_at: string | null;
  display_order: number;
  updated_at: string;
  hero: { storage_path: string; width: number | null } | null;
  images: { count: number }[];
};

export function ProjectsTable({ projects, categories }: { projects: AdminProjectRow[]; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rows, setRows] = useState(projects);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState<"all" | "published" | "draft" | "archived">("all");
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  // keep local rows in sync after server refreshes
  const [prevProjects, setPrevProjects] = useState(projects);
  if (projects !== prevProjects) {
    setPrevProjects(projects);
    setRows(projects);
  }

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  const filtered = rows.filter((p) => {
    if (visibility === "archived" ? !p.archived_at : p.archived_at) return false;
    if (visibility === "published" && !p.published) return false;
    if (visibility === "draft" && p.published) return false;
    if (status !== "all" && p.status !== status) return false;
    if (category !== "all" && p.category_id !== category) return false;
    if (q) {
      const hay = `${p.name} ${p.city ?? ""} ${p.slug}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const act = (fn: () => Promise<{ ok: boolean; message?: string }>, optimistic?: () => void) => {
    optimistic?.();
    start(async () => {
      const res = await fn();
      if (!res.ok || res.message) setFlash({ tone: res.ok ? "success" : "error", text: res.message ?? "Done." });
      router.refresh();
    });
  };

  const update = (id: string, patch: Partial<AdminProjectRow>) =>
    setRows((r) => r.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const move = (id: string, dir: -1 | 1) => {
    const idx = filtered.findIndex((p) => p.id === id);
    const j = idx + dir;
    if (j < 0 || j >= filtered.length) return;
    reorderVisible(filtered[idx].id, filtered[j].id, dir === 1 ? "after" : "before");
  };

  function reorderVisible(sourceId: string, targetId: string, where: "before" | "after") {
    if (sourceId === targetId) return;
    const visible = filtered.map((p) => p.id).filter((id) => id !== sourceId);
    const t = visible.indexOf(targetId);
    visible.splice(where === "before" ? t : t + 1, 0, sourceId);
    // merge the visible order back into the full list, keeping hidden rows' relative positions
    const slots = rows.map((p, i) => (visible.includes(p.id) || p.id === sourceId ? i : -1)).filter((i) => i >= 0);
    const next = [...rows];
    slots.forEach((slot, k) => (next[slot] = rows.find((p) => p.id === visible[k])!));
    setRows(next);
    act(() => reorderProjects(next.map((p) => p.id)));
  }

  return (
    <div className="space-y-4">
      {flash && <Notice tone={flash.tone}>{flash.text}</Notice>}

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          placeholder="Search projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="lg:max-w-xs"
          aria-label="Search projects"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status" className="lg:w-40">
          <option value="all">All statuses</option>
          <option value="current">Current</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="lg:w-56">
          <option value="all">All industries</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value as typeof visibility)} aria-label="Filter by visibility" className="lg:w-40">
          <option value="all">Active</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="archived">Archived</option>
        </Select>
        <p className="text-sm text-zinc-500 lg:ml-auto" aria-live="polite">
          {pending ? "Saving…" : `${filtered.length} of ${rows.filter((r) => !r.archived_at).length}`}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="w-10 px-3 py-2.5 font-medium">
                <span className="sr-only">Order</span>
              </th>
              <th className="px-3 py-2.5 font-medium">Project</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Industry</th>
              <th className="px-3 py-2.5 text-center font-medium">Published</th>
              <th className="px-3 py-2.5 text-center font-medium">Featured</th>
              <th className="px-3 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const thumb = mediaUrl(p.hero?.storage_path);
              const imageCount = p.images?.[0]?.count ?? 0;
              const lowRes = p.hero && (p.hero.width ?? 0) < 1200;
              return (
                <tr
                  key={p.id}
                  draggable
                  onDragStart={() => setDragId(p.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!dragId) return;
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    reorderVisible(dragId, p.id, e.clientY > rect.top + rect.height / 2 ? "after" : "before");
                  }}
                  className={`border-b border-zinc-100 last:border-0 ${dragId === p.id ? "opacity-40" : ""} ${
                    p.archived_at ? "bg-zinc-50 text-zinc-400" : "hover:bg-zinc-50/60"
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-center text-zinc-400">
                      <button type="button" aria-label={`Move ${p.name} up`} disabled={i === 0} onClick={() => move(p.id, -1)} className="hover:text-zinc-900 disabled:opacity-30">
                        ▲
                      </button>
                      <span className="cursor-grab select-none text-xs" aria-hidden>
                        ⋮⋮
                      </span>
                      <button
                        type="button"
                        aria-label={`Move ${p.name} down`}
                        disabled={i === filtered.length - 1}
                        onClick={() => move(p.id, 1)}
                        className="hover:text-zinc-900 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-zinc-100">
                        {thumb && <Image src={thumb} alt="" fill sizes="64px" className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/projects/${p.id}`} className="font-medium text-zinc-900 hover:text-signal">
                          {p.name}
                        </Link>
                        <p className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span>{p.location_label || [p.city, p.state].filter(Boolean).join(", ") || "No location"}</span>
                          <span>· {imageCount} img</span>
                          {!p.hero && <Badge tone="warn">No image</Badge>}
                          {lowRes && <Badge tone="warn">Low-res hero</Badge>}
                          {p.archived_at && <Badge tone="draft">Archived</Badge>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={p.status}
                      aria-label={`Status for ${p.name}`}
                      className="w-32 py-1"
                      onChange={(e) => {
                        const s = e.target.value as ProjectStatus;
                        act(() => patchProject(p.id, { status: s }), () => update(p.id, { status: s }));
                      }}
                    >
                      <option value="current">Current</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={p.category_id ?? ""}
                      aria-label={`Industry for ${p.name}`}
                      className="w-48 py-1"
                      onChange={(e) => {
                        const c = e.target.value || null;
                        act(() => patchProject(p.id, { category_id: c }), () => update(p.id, { category_id: c }));
                      }}
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    <span className="sr-only">{p.category_id ? catName[p.category_id] : ""}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={p.published}
                      aria-label={`Published: ${p.name}`}
                      className="size-4 rounded border-zinc-300 text-signal"
                      onChange={(e) => {
                        const v = e.target.checked;
                        act(() => patchProject(p.id, { published: v }), () => update(p.id, { published: v }));
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      aria-pressed={p.featured}
                      aria-label={`Featured: ${p.name}`}
                      className={`text-lg ${p.featured ? "text-amber-500" : "text-zinc-300 hover:text-zinc-500"}`}
                      onClick={() => act(() => patchProject(p.id, { featured: !p.featured }), () => update(p.id, { featured: !p.featured }))}
                    >
                      ★
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Link href={`/admin/projects/${p.id}`} className="rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                        Edit
                      </Link>
                      {p.published && !p.archived_at && (
                        <Link href={`/projects/${p.slug}`} target="_blank" className="rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                          View
                        </Link>
                      )}
                      <Button variant="ghost" className="px-2 py-1" onClick={() => act(() => duplicateProject(p.id))}>
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 py-1"
                        onClick={() => act(() => archiveProject(p.id, !p.archived_at), () => update(p.id, { archived_at: p.archived_at ? null : new Date().toISOString() }))}
                      >
                        {p.archived_at ? "Restore" : "Archive"}
                      </Button>
                      {p.archived_at && (
                        <Button
                          variant="ghost"
                          className="px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            if (confirm(`Permanently delete "${p.name}" and all its images? This cannot be undone.`))
                              act(() => deleteProject(p.id), () => setRows((r) => r.filter((x) => x.id !== p.id)));
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-zinc-500">
                  No projects match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">Delete is available for archived projects only — archive first.</p>
    </div>
  );
}
