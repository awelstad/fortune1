"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProject } from "@/app/admin/(panel)/projects/actions";
import type { ActionResult } from "@/lib/admin/auth";
import { slugify } from "@/lib/format";
import type { Category, Project } from "@/lib/types";
import { Button, Card, Checkbox, Field, Input, Notice, Select, Textarea, buttonCls } from "./ui";

const SCOPE_SUGGESTIONS = [
  "Electrical",
  "Power Distribution",
  "Switchgear",
  "Lighting",
  "Site Lighting",
  "Sports Lighting",
  "Fire Alarm",
  "Low Voltage",
  "Structured Cabling",
  "Access Control & CCTV",
  "ERRCS / BDA",
  "Emergency Power",
  "Generators",
  "Design-Build",
  "Solar PV",
];

export function ProjectEditor({
  project,
  categories,
}: {
  project: Partial<Project> | null;
  categories: Category[];
}) {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }>, FormData>(saveProject, { ok: true });
  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!project?.slug);
  const [scope, setScope] = useState<string[]>(project?.scope ?? []);
  const [scopeDraft, setScopeDraft] = useState("");
  const errors = !state.ok ? (state.errors ?? {}) : {};
  const v = (k: keyof Project) => (project?.[k] ?? "") as string | number;

  const addScope = (s: string) => {
    const t = s.trim();
    if (t && !scope.includes(t)) setScope([...scope, t]);
    setScopeDraft("");
  };

  return (
    <form action={action} className="space-y-6">
      {project?.id && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="scope" value={JSON.stringify(scope)} />

      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div className="min-w-0 text-sm" aria-live="polite">
          {state.ok && state.message && <span className="text-emerald-700">✓ {state.message}</span>}
          {!state.ok && <span className="text-red-600">{state.message}</span>}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/projects" className={buttonCls("secondary")}>
            Back
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : project?.id ? "Save changes" : "Create project"}
          </Button>
        </div>
      </div>

      {!state.ok && Object.keys(errors).length > 0 && <Notice tone="error">{state.message}</Notice>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Project" description="Only fill in what's true. Empty fields are hidden on the website.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project name *" htmlFor="name" error={errors.name} className="sm:col-span-2">
                <Input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="URL slug *" htmlFor="slug" error={errors.slug} hint={`/projects/${slug || "…"}`} className="sm:col-span-2">
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Status *" htmlFor="status" error={errors.status} hint="Moves the project between Current / Upcoming / Completed sections.">
                <Select id="status" name="status" defaultValue={(v("status") as string) || "current"}>
                  <option value="current">Current</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </Select>
              </Field>
              <Field label="Industry" htmlFor="category_id">
                <Select id="category_id" name="category_id" defaultValue={(v("category_id") as string) || ""}>
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Card summary" htmlFor="summary" error={errors.summary} hint="One sentence. Used on cards, the featured section and search results." className="sm:col-span-2">
                <Textarea id="summary" name="summary" rows={2} maxLength={400} defaultValue={v("summary")} />
              </Field>
              <Field
                label="Description"
                htmlFor="description"
                error={errors.description}
                hint="2–4 short paragraphs. Separate paragraphs with a blank line."
                className="sm:col-span-2"
              >
                <Textarea id="description" name="description" rows={8} defaultValue={v("description")} />
              </Field>
            </div>
          </Card>

          <Card title="Scale & metrics" description="Numbers are the headline on every card. Leave blank if unknown.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Project value ($)" htmlFor="project_value" error={errors.project_value} hint="Total construction value">
                <Input id="project_value" name="project_value" inputMode="numeric" defaultValue={v("project_value")} placeholder="331000000" />
              </Field>
              <Field label="Electrical contract ($)" htmlFor="electrical_contract_value" error={errors.electrical_contract_value} hint="Fortune's contract">
                <Input id="electrical_contract_value" name="electrical_contract_value" inputMode="numeric" defaultValue={v("electrical_contract_value")} />
              </Field>
              <Field label="Square feet" htmlFor="square_feet" error={errors.square_feet}>
                <Input id="square_feet" name="square_feet" inputMode="numeric" defaultValue={v("square_feet")} />
              </Field>
              <Field label="Stories" htmlFor="stories" error={errors.stories}>
                <Input id="stories" name="stories" inputMode="numeric" defaultValue={v("stories")} />
              </Field>
              <Field label="Units" htmlFor="units" error={errors.units}>
                <Input id="units" name="units" inputMode="numeric" defaultValue={v("units")} />
              </Field>
              <Field label="Project size (text)" htmlFor="project_size" error={errors.project_size} hint="e.g. 2 buildings · 580-space garage">
                <Input id="project_size" name="project_size" defaultValue={v("project_size")} />
              </Field>
            </div>
          </Card>

          <Card title="Fortune's scope" description="What Fortune actually performed on this project.">
            <div className="flex flex-wrap gap-2">
              {scope.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs text-white">
                  {s}
                  <button type="button" aria-label={`Remove ${s}`} onClick={() => setScope(scope.filter((x) => x !== s))} className="text-zinc-400 hover:text-white">
                    ×
                  </button>
                </span>
              ))}
              {!scope.length && <span className="text-sm text-zinc-400">No scope items yet.</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={scopeDraft}
                placeholder="Add scope item and press Enter"
                aria-label="Add scope item"
                onChange={(e) => setScopeDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addScope(scopeDraft);
                  }
                }}
              />
              <Button variant="secondary" onClick={() => addScope(scopeDraft)}>
                Add
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SCOPE_SUGGESTIONS.filter((s) => !scope.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => addScope(s)} className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-zinc-400">
                  + {s}
                </button>
              ))}
            </div>
            {errors.scope && <p className="mt-2 text-xs text-red-600">{errors.scope}</p>}
          </Card>

        </div>

        <div className="space-y-6">
          <Card title="Visibility">
            <div className="space-y-4">
              <Checkbox name="published" label="Published" hint="Visible on the public website" defaultChecked={project?.published ?? false} />
              <Checkbox name="featured" label="Featured" hint="Eligible for the homepage feature" defaultChecked={project?.featured ?? false} />
              <Field label="Display order" htmlFor="display_order" hint="Lower numbers appear first. Or drag rows in the project list.">
                <Input id="display_order" name="display_order" inputMode="numeric" defaultValue={v("display_order") || 1000} />
              </Field>
            </div>
          </Card>

          <Card title="Location">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-3">
                <Field label="City" htmlFor="city" className="col-span-2">
                  <Input id="city" name="city" defaultValue={v("city")} />
                </Field>
                <Field label="State" htmlFor="state">
                  <Input id="state" name="state" defaultValue={v("state") || "FL"} />
                </Field>
              </div>
              <Field label="Location label (optional)" htmlFor="location_label" hint='Overrides city/state, e.g. "Statewide, FL"'>
                <Input id="location_label" name="location_label" defaultValue={v("location_label")} />
              </Field>
            </div>
          </Card>

          <Card title="Timeline">
            <div className="grid gap-4">
              <Field label="Start date" htmlFor="start_date" error={errors.start_date} hint="For upcoming projects: expected start">
                <Input id="start_date" name="start_date" type="date" defaultValue={v("start_date")} />
              </Field>
              <Field label="Completion date" htmlFor="completion_date" error={errors.completion_date}>
                <Input id="completion_date" name="completion_date" type="date" defaultValue={v("completion_date")} />
              </Field>
              <Field label="Timeline note" htmlFor="timeline_note">
                <Input id="timeline_note" name="timeline_note" defaultValue={v("timeline_note")} placeholder="Phase 2 of 3" />
              </Field>
            </div>
          </Card>

          <Card title="Project team">
            <div className="grid gap-4">
              <Field label="General contractor / CM" htmlFor="general_contractor">
                <Input id="general_contractor" name="general_contractor" defaultValue={v("general_contractor")} />
              </Field>
              <Field label="Owner / client" htmlFor="owner">
                <Input id="owner" name="owner" defaultValue={v("owner")} />
              </Field>
              <Field label="Architect / engineer" htmlFor="architect">
                <Input id="architect" name="architect" defaultValue={v("architect")} />
              </Field>
            </div>
          </Card>

          <Card title="Search engines" description="Optional overrides.">
            <div className="grid gap-4">
              <Field label="SEO title" htmlFor="seo_title">
                <Input id="seo_title" name="seo_title" maxLength={120} defaultValue={v("seo_title")} />
              </Field>
              <Field label="SEO description" htmlFor="seo_description">
                <Textarea id="seo_description" name="seo_description" rows={3} maxLength={300} defaultValue={v("seo_description")} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
