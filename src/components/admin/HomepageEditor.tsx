"use client";

import { useActionState, useState } from "react";
import { saveHomepage } from "@/app/admin/(panel)/content-actions";
import type { ActionResult } from "@/lib/admin/auth";
import type { Capability, HomepageSettings } from "@/lib/types";
import { SingleImageField } from "./SingleImageField";
import { Button, Card, Field, Input, Select, Textarea } from "./ui";

export function HomepageEditor({
  home,
  projects,
}: {
  home: HomepageSettings;
  projects: { id: string; name: string; status: string; published: boolean }[];
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveHomepage, { ok: true });
  const [caps, setCaps] = useState<Capability[]>(home.capabilities ?? []);
  const v = (k: keyof HomepageSettings) => (home[k] ?? "") as string;

  const moveCap = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= caps.length) return;
    const next = [...caps];
    [next[i], next[j]] = [next[j], next[i]];
    setCaps(next);
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="capabilities" value={JSON.stringify(caps)} />

      <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <p className="text-sm" aria-live="polite">
          {state.ok && state.message && <span className="text-emerald-700">✓ {state.message}</span>}
          {!state.ok && <span className="text-red-600">{state.message}</span>}
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save homepage"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Hero" className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow" htmlFor="hero_eyebrow" className="sm:col-span-2">
              <Input id="hero_eyebrow" name="hero_eyebrow" defaultValue={v("hero_eyebrow")} />
            </Field>
            <Field label="Headline *" htmlFor="hero_headline" className="sm:col-span-2" error={!state.ok ? state.errors?.hero_headline : undefined}>
              <Textarea id="hero_headline" name="hero_headline" rows={2} defaultValue={v("hero_headline")} />
            </Field>
            <Field label="Supporting text" htmlFor="hero_subheadline" className="sm:col-span-2" hint="Keep it to one or two sentences.">
              <Textarea id="hero_subheadline" name="hero_subheadline" rows={3} defaultValue={v("hero_subheadline")} />
            </Field>
            <Field label="Primary button label" htmlFor="hero_primary_label">
              <Input id="hero_primary_label" name="hero_primary_label" defaultValue={v("hero_primary_label")} />
            </Field>
            <Field label="Primary button link" htmlFor="hero_primary_href">
              <Input id="hero_primary_href" name="hero_primary_href" defaultValue={v("hero_primary_href")} />
            </Field>
            <Field label="Secondary button label" htmlFor="hero_secondary_label">
              <Input id="hero_secondary_label" name="hero_secondary_label" defaultValue={v("hero_secondary_label")} />
            </Field>
            <Field label="Secondary button link" htmlFor="hero_secondary_href">
              <Input id="hero_secondary_href" name="hero_secondary_href" defaultValue={v("hero_secondary_href")} />
            </Field>
          </div>
        </Card>
        <Card title="Hero image" description="Full-screen. Use a 2400px+ wide landscape photo of real Fortune work.">
          <SingleImageField name="hero_image_path" folder="site" initialPath={home.hero_image_path} />
        </Card>
      </div>

      <Card title="Featured project" description="The large editorial feature further down the homepage.">
        <Select name="featured_project_id" defaultValue={v("featured_project_id")} aria-label="Featured project">
          <option value="">Automatic (first project marked Featured)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id} disabled={!p.published}>
              {p.name} — {p.status}
              {p.published ? "" : " (draft)"}
            </option>
          ))}
        </Select>
      </Card>

      <Card title="Section headings">
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["current", "Current projects"],
              ["upcoming", "Upcoming projects"],
              ["portfolio", "Portfolio"],
              ["industries", "Industries"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="space-y-2 rounded-md border border-zinc-100 p-3">
              <Field label={`${label} — heading`} htmlFor={`${k}_heading`}>
                <Input id={`${k}_heading`} name={`${k}_heading`} defaultValue={v(`${k}_heading` as keyof HomepageSettings)} />
              </Field>
              <Field label="Intro" htmlFor={`${k}_intro`}>
                <Textarea id={`${k}_intro`} name={`${k}_intro`} rows={2} defaultValue={v(`${k}_intro` as keyof HomepageSettings)} />
              </Field>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Capabilities"
        description="Keep it concise — this section is secondary to projects."
        actions={
          <Button variant="secondary" onClick={() => setCaps([...caps, { title: "", body: "" }])}>
            + Add
          </Button>
        }
      >
        <Field label="Section heading" htmlFor="capabilities_heading" className="mb-4">
          <Input id="capabilities_heading" name="capabilities_heading" defaultValue={v("capabilities_heading")} />
        </Field>
        <ol className="space-y-3">
          {caps.map((c, i) => (
            <li key={i} className="grid gap-2 rounded-md border border-zinc-200 p-3 sm:grid-cols-[2rem_1fr_2fr_auto] sm:items-start">
              <span className="pt-2 text-xs text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
              <Input
                value={c.title}
                placeholder="Title"
                aria-label={`Capability ${i + 1} title`}
                onChange={(e) => setCaps(caps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
              />
              <Textarea
                value={c.body}
                rows={2}
                placeholder="One line"
                aria-label={`Capability ${i + 1} description`}
                onChange={(e) => setCaps(caps.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))}
              />
              <div className="flex gap-1">
                <Button variant="ghost" className="px-2" onClick={() => moveCap(i, -1)} aria-label="Move up">
                  ↑
                </Button>
                <Button variant="ghost" className="px-2" onClick={() => moveCap(i, 1)} aria-label="Move down">
                  ↓
                </Button>
                <Button variant="ghost" className="px-2 text-red-600" onClick={() => setCaps(caps.filter((_, j) => j !== i))} aria-label="Remove">
                  ×
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Closing call to action">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading" htmlFor="cta_heading" hint='"Let&apos;s talk." is added automatically.' className="sm:col-span-2">
            <Input id="cta_heading" name="cta_heading" defaultValue={v("cta_heading")} />
          </Field>
          <Field label="Supporting text" htmlFor="cta_subheading" className="sm:col-span-2">
            <Textarea id="cta_subheading" name="cta_subheading" rows={2} defaultValue={v("cta_subheading")} />
          </Field>
          <Field label="Button label" htmlFor="cta_button_label">
            <Input id="cta_button_label" name="cta_button_label" defaultValue={v("cta_button_label")} />
          </Field>
          <Field label="Button link" htmlFor="cta_button_href">
            <Input id="cta_button_href" name="cta_button_href" defaultValue={v("cta_button_href")} />
          </Field>
        </div>
      </Card>
    </form>
  );
}
