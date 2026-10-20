"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { saveAffiliations } from "@/app/admin/(panel)/content-actions";
import { ACCEPT, uploadImage } from "@/lib/admin/upload";
import { mediaUrl } from "@/lib/media";
import type { Affiliation } from "@/lib/types";
import { Button, Card, Input, Notice } from "./ui";

/** Logos narrower than this look soft in the footer tile on sharp (2×) screens. */
const SHARP_WIDTH = 320;

type Row = Affiliation & { key: string };

export function AffiliationsEditor({ initial }: { initial: Affiliation[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial.map((a, i) => ({ ...a, key: `${i}-${a.image}` })));
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const addInput = useRef<HTMLInputElement>(null);
  const replaceFor = useRef<string | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  const patch = (key: string, p: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...p } : x)));
  const move = (key: string, dir: -1 | 1) =>
    setRows((r) => {
      const i = r.findIndex((x) => x.key === key);
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function upload(file: File, onDone: (u: { path: string; width: number; height: number }) => void) {
    setBusy(file.name);
    setMsg(null);
    try {
      onDone(await uploadImage(file, "site/affiliations"));
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  }

  const save = () =>
    start(async () => {
      const res = await saveAffiliations(rows.map(({ key: _key, ...a }) => (void _key, a)));
      setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
      if (res.ok) router.refresh();
    });

  const visible = rows.filter((r) => !r.hidden).length;

  return (
    <div className="space-y-6">
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <Card
        title="Footer logos"
        description="Shown in grey on every page and in full colour on hover. Use the organisation's official logo, ideally a PNG at least 600px wide with a white or transparent background."
        actions={
          <Button variant="secondary" disabled={!!busy} onClick={() => addInput.current?.click()}>
            {busy ? "Uploading…" : "+ Add logo"}
          </Button>
        }
      >
        <input
          ref={addInput}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f)
              upload(f, (u) =>
                setRows((r) => [
                  ...r,
                  { key: u.path, name: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), image: u.path, width: u.width, height: u.height },
                ]),
              );
          }}
        />
        <input
          ref={replaceInput}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            const key = replaceFor.current;
            e.target.value = "";
            if (f && key) upload(f, (u) => patch(key, { image: u.path, width: u.width, height: u.height }));
          }}
        />

        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">No logos yet — the footer hides this row until you add one.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {rows.map((a, i) => {
              const src = mediaUrl(a.image);
              const soft = (a.width ?? 0) > 0 && (a.width ?? 0) < SHARP_WIDTH;
              return (
                <li key={a.key} className={`grid gap-4 py-4 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-center ${a.hidden ? "opacity-60" : ""}`}>
                  <div className="space-y-1.5">
                    <div className="grid h-20 w-40 place-items-center rounded border border-zinc-200 bg-white px-3 py-2">
                      {src && <Image src={src} alt="" width={a.width ?? 240} height={a.height ?? 80} className="max-h-14 w-auto max-w-full object-contain" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs text-signal hover:underline"
                        onClick={() => {
                          replaceFor.current = a.key;
                          replaceInput.current?.click();
                        }}
                      >
                        Replace image
                      </button>
                      {soft && <span className="whitespace-nowrap text-[11px] font-medium text-orange-700">{a.width}px · low-res</span>}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-zinc-700">
                      Organization name
                      <Input className="mt-1" value={a.name} onChange={(e) => patch(a.key, { name: e.target.value })} />
                    </label>
                    <label className="text-xs font-medium text-zinc-700">
                      Link (optional)
                      <Input
                        className="mt-1"
                        type="url"
                        inputMode="url"
                        placeholder="https://"
                        value={a.href ?? ""}
                        onChange={(e) => patch(a.key, { href: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-1 md:flex-col md:items-end">
                    <label className="mr-3 flex items-center gap-2 text-xs text-zinc-700 md:mr-0 md:mb-1">
                      <input type="checkbox" checked={!a.hidden} onChange={(e) => patch(a.key, { hidden: !e.target.checked })} className="size-4 rounded border-zinc-300" />
                      Show
                    </label>
                    <div className="flex">
                      <Button variant="ghost" className="px-2" disabled={i === 0} aria-label={`Move ${a.name} earlier`} onClick={() => move(a.key, -1)}>
                        ▲
                      </Button>
                      <Button variant="ghost" className="px-2" disabled={i === rows.length - 1} aria-label={`Move ${a.name} later`} onClick={() => move(a.key, 1)}>
                        ▼
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 text-red-600"
                        aria-label={`Remove ${a.name}`}
                        onClick={() => confirm(`Remove ${a.name} from the footer?`) && setRows((r) => r.filter((x) => x.key !== a.key))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button disabled={pending || !!busy} onClick={save}>
          {pending ? "Saving…" : "Save affiliations"}
        </Button>
        <span className="text-sm text-zinc-500">
          {visible} of {rows.length} showing · order here = order in the footer
        </span>
      </div>
    </div>
  );
}
