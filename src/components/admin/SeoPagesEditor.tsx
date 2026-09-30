"use client";

import { useState, useTransition } from "react";
import { saveSeoPage } from "@/app/admin/(panel)/seo/actions";
import { Button, Checkbox, Field, Input, Notice, Textarea } from "./ui";
import { LengthHint, SerpPreview } from "./SerpPreview";

type Row = { path: string; label: string; defTitle: string; defDesc: string; title: string; description: string; noindex: boolean };

export function SeoPagesEditor({ rows, siteUrl }: { rows: Row[]; siteUrl: string }) {
  const [open, setOpen] = useState<string>(rows[0]?.path ?? "/");
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.path} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <button
            type="button"
            aria-expanded={open === r.path}
            onClick={() => setOpen(open === r.path ? "" : r.path)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-zinc-50"
          >
            <span>
              <span className="font-medium">{r.label}</span>
              <span className="ml-2 text-xs text-zinc-400">{r.path}</span>
            </span>
            <span className="text-xs text-zinc-500">{r.title || r.description ? "Customized" : "Default"}</span>
          </button>
          {open === r.path && <PageRow row={r} siteUrl={siteUrl} />}
        </li>
      ))}
    </ul>
  );
}

function PageRow({ row, siteUrl }: { row: Row; siteUrl: string }) {
  const [title, setTitle] = useState(row.title);
  const [desc, setDesc] = useState(row.description);
  const [noindex, setNoindex] = useState(row.noindex);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const effTitle = (title.trim() || row.defTitle) + (row.path === "/" ? "" : " | Fortune Electrical");

  return (
    <div className="grid gap-6 border-t border-zinc-100 p-5 lg:grid-cols-2">
      <div className="space-y-4">
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Field label="Title" htmlFor={`t-${row.path}`} hint={<LengthHint n={effTitle.length} min={30} max={60} />}>
          <Input id={`t-${row.path}`} value={title} placeholder={row.defTitle} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Description" htmlFor={`d-${row.path}`} hint={<LengthHint n={(desc.trim() || row.defDesc).length} min={110} max={160} />}>
          <Textarea id={`d-${row.path}`} rows={3} value={desc} placeholder={row.defDesc} onChange={(e) => setDesc(e.target.value)} maxLength={320} />
        </Field>
        <Checkbox label="Hide this page from search engines" hint="Rarely needed." checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
        <div className="flex gap-2">
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await saveSeoPage({ path: row.path, title, description: desc, noindex });
                setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
              })
            }
          >
            {pending ? "Saving…" : "Save"}
          </Button>
          {(title || desc) && (
            <Button
              variant="ghost"
              onClick={() => {
                setTitle("");
                setDesc("");
              }}
            >
              Reset to default
            </Button>
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium text-zinc-500">Preview on Google</p>
        <SerpPreview url={`${siteUrl}${row.path}`} title={effTitle} description={desc.trim() || row.defDesc} />
      </div>
    </div>
  );
}
