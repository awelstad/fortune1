"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveCategories, type CategoryInput } from "@/app/admin/(panel)/content-actions";
import { slugify } from "@/lib/format";
import type { Category } from "@/lib/types";
import { SingleImageField } from "./SingleImageField";
import { Button, Input, Notice } from "./ui";

export function CategoriesEditor({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [rows, setRows] = useState<(CategoryInput & { key: string })[]>(
    categories.map((c) => ({
      key: c.id,
      id: c.id,
      slug: c.slug,
      name: c.name,
      short_name: c.short_name ?? "",
      description: c.description ?? "",
      image_path: c.image_path,
      is_active: c.is_active,
      show_on_home: c.show_on_home,
    })),
  );
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (i: number, patch: Partial<CategoryInput>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  return (
    <div className="space-y-4">
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.key} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-[14rem_1fr]">
            <div>
              <SingleImageField
                name={`image_${i}`}
                folder="categories"
                initialPath={r.image_path}
                aspect="aspect-[5/4]"
                minWidth={1200}
                onChange={(p) => set(i, { image_path: p })}
              />
              <p className="mt-1 text-xs text-zinc-500">Optional. Otherwise the best project photo in this industry is used.</p>
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <label>
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Name</span>
                  <Input
                    value={r.name}
                    onChange={(e) => set(i, { name: e.target.value, ...(r.id ? {} : { slug: slugify(e.target.value) }) })}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Short name (cards)</span>
                  <Input value={r.short_name} onChange={(e) => set(i, { short_name: e.target.value })} />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-zinc-600">URL slug</span>
                  <Input value={r.slug} onChange={(e) => set(i, { slug: slugify(e.target.value) })} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-600">Description (industry tile)</span>
                <Input value={r.description} onChange={(e) => set(i, { description: e.target.value })} />
              </label>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={r.is_active} onChange={(e) => set(i, { is_active: e.target.checked })} className="size-4 rounded border-zinc-300" />
                  Active (filterable)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={r.show_on_home} onChange={(e) => set(i, { show_on_home: e.target.checked })} className="size-4 rounded border-zinc-300" />
                  Show on homepage
                </label>
                <span className="text-zinc-500">{r.id ? counts[r.id] ?? 0 : 0} projects</span>
                <span className="ml-auto flex gap-1">
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
                      const n = r.id ? counts[r.id] ?? 0 : 0;
                      if (n === 0 || confirm(`${n} projects use "${r.name}". They'll become uncategorized. Remove anyway?`))
                        setRows(rows.filter((_, j) => j !== i));
                    }}
                  >
                    ×
                  </Button>
                </span>
              </div>
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
              { key: crypto.randomUUID(), slug: "", name: "", short_name: "", description: "", image_path: null, is_active: true, show_on_home: true },
            ])
          }
        >
          + Add industry
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveCategories(rows);
              setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
              if (res.ok) router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Save industries"}
        </Button>
      </div>
    </div>
  );
}
