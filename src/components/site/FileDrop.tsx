"use client";

import { useId, useRef, useState } from "react";
import { DOC_TYPES, checkDoc, uploadDoc } from "@/lib/doc-upload";

type Item = { name: string; size: number; status: "uploading" | "done" | "error"; path?: string; error?: string };

/**
 * File picker that uploads immediately to the private drop folder and writes the
 * resulting paths into a hidden input. Large tap target; on phones it opens the
 * native Files / Drive / iCloud picker.
 */
export function FileDrop({
  name,
  folder,
  label,
  hint,
  accept,
  maxFiles = 1,
  maxMB = 10,
  onBusyChange,
}: {
  name: string;
  folder: "resumes" | "bids";
  label: string;
  hint: string;
  accept: string[];
  maxFiles?: number;
  maxMB?: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const paths = items.filter((i) => i.status === "done").map((i) => i.path!);

  async function add(files: File[]) {
    const room = maxFiles - items.filter((i) => i.status !== "error").length;
    const batch = files.slice(0, Math.max(0, room));
    if (!batch.length) return;
    const start = items.length;
    setItems((cur) => [...cur, ...batch.map((f) => ({ name: f.name, size: f.size, status: "uploading" as const }))]);
    onBusyChange?.(true);
    await Promise.all(
      batch.map(async (f, k) => {
        const err = checkDoc(f, accept, maxMB);
        const update = (patch: Partial<Item>) => setItems((cur) => cur.map((it, j) => (j === start + k ? { ...it, ...patch } : it)));
        if (err) return update({ status: "error", error: err });
        try {
          update({ status: "done", path: await uploadDoc(f, folder) });
        } catch (e) {
          update({ status: "error", error: e instanceof Error ? e.message : "Upload failed" });
        }
      }),
    );
    onBusyChange?.(false);
  }

  const types = [...new Set(accept.map((t) => DOC_TYPES[t]).filter(Boolean))].join(", ");
  const full = items.filter((i) => i.status !== "error").length >= maxFiles;

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(paths)} />
      <label htmlFor={id} className="label text-mute">
        {label}
      </label>
      {!full && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add([...e.dataTransfer.files]);
          }}
          className={`mt-2 flex min-h-20 w-full flex-col items-center justify-center gap-1 border border-dashed px-4 py-5 text-center transition-colors ${
            drag ? "border-signal bg-signal/5" : "border-ink/30 hover:border-ink"
          }`}
        >
          <span className="label text-ink">＋ Choose file{maxFiles > 1 ? "s" : ""}</span>
          <span className="text-sm text-mute">
            {types} · up to {maxMB} MB{maxFiles > 1 ? ` · max ${maxFiles}` : ""}
          </span>
        </button>
      )}
      <input
        id={id}
        ref={input}
        type="file"
        hidden
        multiple={maxFiles > 1}
        accept={accept.join(",")}
        onChange={(e) => {
          if (e.target.files?.length) add([...e.target.files]);
          e.target.value = "";
        }}
      />
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between gap-3 border border-rule bg-white px-3 py-2.5 text-sm">
              <span className="min-w-0 truncate">
                {it.status === "done" ? "✓ " : it.status === "error" ? "⚠ " : "… "}
                {it.name}
                {it.error && <span className="block text-xs text-red-700">{it.error}</span>}
              </span>
              <button
                type="button"
                onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}
                className="label -my-2 shrink-0 px-2 py-3 text-mute hover:text-ink"
                aria-label={`Remove ${it.name}`}
              >
                {it.status === "uploading" ? "Uploading…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-sm text-mute">{hint}</p>
    </div>
  );
}
