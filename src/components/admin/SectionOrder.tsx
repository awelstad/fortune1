"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reorderProjects } from "@/app/admin/(panel)/projects/actions";
import { Button } from "./ui";

type Item = { id: string; name: string };

/**
 * Reorders the projects inside one homepage section (current / upcoming /
 * completed). Saves the full project order so other sections keep theirs.
 */
export function SectionOrder({ title, items, allIds }: { title: string; items: Item[]; allIds: string[] }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  const [prev, setPrev] = useState(items);
  if (items !== prev) {
    setPrev(items);
    setList(items);
  }
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function commit(next: Item[]) {
    setList(next);
    // Place this section's ids into the slots they already occupy in the global order.
    const mine = new Set(next.map((i) => i.id));
    const queue = next.map((i) => i.id);
    const merged = allIds.map((id) => (mine.has(id) ? queue.shift()! : id));
    start(async () => {
      await reorderProjects(merged);
      router.refresh();
    });
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-zinc-400">{pending ? "Saving…" : `${list.length}`}</span>
      </div>
      {list.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400">None</p>
      ) : (
        <ol className="max-h-96 space-y-1 overflow-y-auto">
          {list.map((p, i) => (
            <li
              key={p.id}
              draggable
              onDragStart={() => setDragId(p.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!dragId || dragId === p.id) return;
                const rest = list.filter((x) => x.id !== dragId);
                rest.splice(rest.findIndex((x) => x.id === p.id), 0, list.find((x) => x.id === dragId)!);
                commit(rest);
              }}
              className={`flex cursor-grab items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm ${dragId === p.id ? "opacity-40" : ""}`}
            >
              <span className="w-5 text-xs text-zinc-400">{i + 1}</span>
              <span className="flex-1 truncate">{p.name}</span>
              <Button variant="ghost" className="px-1.5 py-0.5" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${p.name} up`}>
                ↑
              </Button>
              <Button variant="ghost" className="px-1.5 py-0.5" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Move ${p.name} down`}>
                ↓
              </Button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
