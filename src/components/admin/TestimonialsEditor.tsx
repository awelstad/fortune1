"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveTestimonials, type TestimonialInput } from "@/app/admin/(panel)/content-actions";
import type { Testimonial } from "@/lib/types";
import { Button, Input, Notice, Textarea } from "./ui";

type Row = TestimonialInput & { key: string };

export function TestimonialsEditor({ items }: { items: Testimonial[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    items.map((t) => ({
      key: t.id,
      id: t.id,
      quote: t.quote,
      author_name: t.author_name ?? "",
      author_title: t.author_title ?? "",
      company: t.company ?? "",
      is_active: t.is_active,
    })),
  );
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-4">
      <Notice tone="warn">
        Use real quotes only, with the person&apos;s permission. Placeholders can&apos;t be shown on the site — replace the text first,
        then tick <strong>Show on site</strong>.
      </Notice>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.key} className={`space-y-3 rounded-lg border bg-white p-4 ${r.is_active ? "border-zinc-200" : "border-dashed border-zinc-300"}`}>
            <Textarea rows={3} value={r.quote} aria-label="Quote" placeholder="The quote" onChange={(e) => set(i, { quote: e.target.value })} />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input value={r.author_name} placeholder="Name" aria-label="Name" onChange={(e) => set(i, { author_name: e.target.value })} />
              <Input value={r.author_title} placeholder="Title" aria-label="Title" onChange={(e) => set(i, { author_title: e.target.value })} />
              <Input value={r.company} placeholder="Company" aria-label="Company" onChange={(e) => set(i, { company: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.is_active} onChange={(e) => set(i, { is_active: e.target.checked })} className="size-4 rounded border-zinc-300" />
                Show on site
              </label>
              <Button
                variant="ghost"
                className="px-2 text-red-600"
                onClick={() => {
                  if (confirm("Remove this testimonial? (Takes effect when you save.)")) setRows(rows.filter((_, j) => j !== i));
                }}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            setRows([...rows, { key: crypto.randomUUID(), quote: "", author_name: "", author_title: "", company: "", is_active: false }])
          }
        >
          + Add testimonial
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveTestimonials(rows);
              setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
              if (res.ok) router.refresh();
            })
          }
        >
          {pending ? "Saving…" : "Save testimonials"}
        </Button>
      </div>
    </div>
  );
}
