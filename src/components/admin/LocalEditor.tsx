"use client";

import { useState, useTransition } from "react";
import { saveLocal } from "@/app/admin/(panel)/seo/actions";
import type { LocalInfo } from "@/lib/types";
import { Button, Card, Field, Input, Notice } from "./ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function LocalEditor({ initial }: { initial: LocalInfo }) {
  const [l, setL] = useState<LocalInfo>(initial);
  const [areasText, setAreasText] = useState((initial.areas ?? []).join(", "));
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const hours = l.hours ?? [];
  const setHours = (h: NonNullable<LocalInfo["hours"]>) => setL({ ...l, hours: h });

  return (
    <div className="space-y-6">
      <Notice tone="info">
        These details feed Google&apos;s understanding of the business (structured data on every page). Keep them identical to your Google
        Business Profile and directory listings.
      </Notice>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Office hours"
          description={l.hours_source ? `Source: ${l.hours_source}` : undefined}
          actions={
            <Button variant="secondary" onClick={() => setHours([...hours, { days: [], opens: "08:00", closes: "17:00" }])}>
              + Add
            </Button>
          }
        >
          <ul className="space-y-4">
            {hours.map((h, i) => (
              <li key={i} className="space-y-2 rounded-md border border-zinc-200 p-3">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days">
                  {DAYS.map((d) => {
                    const on = h.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setHours(hours.map((x, j) => (j === i ? { ...x, days: on ? x.days.filter((y) => y !== d) : [...x.days, d] } : x)))}
                        className={`min-h-9 rounded px-2.5 text-xs ${on ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-600"}`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Input type="time" value={h.opens} aria-label="Opens" onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, opens: e.target.value } : x)))} />
                  <span>to</span>
                  <Input type="time" value={h.closes} aria-label="Closes" onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, closes: e.target.value } : x)))} />
                  <Button variant="ghost" className="px-2 text-red-600" aria-label="Remove" onClick={() => setHours(hours.filter((_, j) => j !== i))}>
                    ×
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Location & service area">
          <div className="grid gap-4">
            <Field label="Counties served" htmlFor="areas" hint="Comma-separated, e.g. Lee County, Collier County">
              <Input id="areas" value={areasText} onChange={(e) => setAreasText(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" htmlFor="lat">
                <Input id="lat" inputMode="decimal" value={l.geo?.lat ?? ""} onChange={(e) => setL({ ...l, geo: { lat: Number(e.target.value), lng: l.geo?.lng ?? 0 } })} />
              </Field>
              <Field label="Longitude" htmlFor="lng">
                <Input id="lng" inputMode="decimal" value={l.geo?.lng ?? ""} onChange={(e) => setL({ ...l, geo: { lat: l.geo?.lat ?? 0, lng: Number(e.target.value) } })} />
              </Field>
            </div>
            <p className="text-xs text-zinc-500">Map pin for 2950 Van Buren St (from OpenStreetMap). Only change if the office moves.</p>
          </div>
        </Card>

        <Card title="Profiles">
          <div className="grid gap-4">
            <Field label="Google Business Profile URL" htmlFor="gbp" hint="On Google Maps: your listing → Share → Copy link.">
              <Input id="gbp" type="url" placeholder="https://maps.app.goo.gl/…" value={l.gbp_url ?? ""} onChange={(e) => setL({ ...l, gbp_url: e.target.value })} />
            </Field>
            <Field label="LinkedIn" htmlFor="li">
              <Input id="li" type="url" value={l.linkedin_url ?? ""} onChange={(e) => setL({ ...l, linkedin_url: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="Search engine verification" description="Paste only the code (content=&quot;…&quot;) — used after the domain moves.">
          <div className="grid gap-4">
            <Field label="Google Search Console" htmlFor="gv">
              <Input id="gv" value={l.verification?.google ?? ""} onChange={(e) => setL({ ...l, verification: { ...l.verification, google: e.target.value } })} />
            </Field>
            <Field label="Bing Webmaster Tools" htmlFor="bv">
              <Input id="bv" value={l.verification?.bing ?? ""} onChange={(e) => setL({ ...l, verification: { ...l.verification, bing: e.target.value } })} />
            </Field>
          </div>
        </Card>
      </div>

      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await saveLocal({ ...l, areas: areasText.split(",").map((a) => a.trim()).filter(Boolean) });
            setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
          })
        }
      >
        {pending ? "Saving…" : "Save local business info"}
      </Button>
    </div>
  );
}
