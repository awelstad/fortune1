"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveLanding } from "@/app/admin/(panel)/seo/actions";
import type { LandingPage } from "@/lib/types";
import { Button, Card, Checkbox, Field, Input, Notice, Textarea } from "./ui";
import { LengthHint, SerpPreview } from "./SerpPreview";

export function LandingEditor({
  page,
  url,
  categories,
  matchedCount,
}: {
  page: LandingPage;
  url: string;
  categories: { slug: string; name: string }[];
  matchedCount: number;
}) {
  const router = useRouter();
  const [p, setP] = useState(page);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (patch: Partial<LandingPage>) => setP({ ...p, ...patch });
  const setMatch = (patch: Partial<LandingPage["match"]>) => set({ match: { ...p.match, ...patch } });
  const csv = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const title = (p.seo_title || p.headline || p.name) + " | Fortune Electrical";

  return (
    <div className="space-y-6">
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Page content">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name (menus & cards)" htmlFor="name">
                  <Input id="name" value={p.name} onChange={(e) => set({ name: e.target.value })} />
                </Field>
                <Field label="Headline (H1)" htmlFor="headline">
                  <Input id="headline" value={p.headline ?? ""} onChange={(e) => set({ headline: e.target.value })} />
                </Field>
              </div>
              <Field label="Intro" htmlFor="intro" hint="One or two sentences under the headline.">
                <Textarea id="intro" rows={3} value={p.intro ?? ""} onChange={(e) => set({ intro: e.target.value })} />
              </Field>
              <Field label="How we work (body)" htmlFor="body" hint="Short paragraphs; separate with a blank line.">
                <Textarea id="body" rows={6} value={p.body ?? ""} onChange={(e) => set({ body: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card
            title="Questions & answers"
            description="Real questions GCs and owners ask. Only true statements."
            actions={
              <Button variant="secondary" onClick={() => set({ faqs: [...(p.faqs ?? []), { q: "", a: "" }] })}>
                + Add
              </Button>
            }
          >
            <ul className="space-y-3">
              {(p.faqs ?? []).map((f, i) => (
                <li key={i} className="space-y-2 rounded-md border border-zinc-200 p-3">
                  <Input
                    value={f.q}
                    placeholder="Question"
                    aria-label={`Question ${i + 1}`}
                    onChange={(e) => set({ faqs: p.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })}
                  />
                  <Textarea
                    rows={2}
                    value={f.a}
                    placeholder="Answer"
                    aria-label={`Answer ${i + 1}`}
                    onChange={(e) => set({ faqs: p.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })}
                  />
                  <Button variant="ghost" className="px-2 text-xs text-red-600" onClick={() => set({ faqs: p.faqs.filter((_, j) => j !== i) })}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Google">
            <div className="grid gap-4">
              <Field label="SEO title" htmlFor="seo_title" hint={<LengthHint n={title.length} min={30} max={60} />}>
                <Input id="seo_title" value={p.seo_title ?? ""} onChange={(e) => set({ seo_title: e.target.value })} />
              </Field>
              <Field label="SEO description" htmlFor="seo_description" hint={<LengthHint n={(p.seo_description ?? "").length} min={110} max={160} />}>
                <Textarea id="seo_description" rows={4} value={p.seo_description ?? ""} onChange={(e) => set({ seo_description: e.target.value })} />
              </Field>
              <SerpPreview url={url} title={title} description={p.seo_description || p.intro || ""} />
            </div>
          </Card>

          <Card title="Which projects appear" description={`${matchedCount} projects match right now.`}>
            <div className="grid gap-4">
              {page.kind !== "area" && (
                <fieldset>
                  <legend className="mb-1.5 text-xs font-medium text-zinc-700">Industries</legend>
                  <div className="grid gap-1.5">
                    {categories.map((c) => (
                      <label key={c.slug} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-zinc-300"
                          checked={p.match.categories?.includes(c.slug) ?? false}
                          onChange={(e) =>
                            setMatch({
                              categories: e.target.checked
                                ? [...(p.match.categories ?? []), c.slug]
                                : (p.match.categories ?? []).filter((x) => x !== c.slug),
                            })
                          }
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              {page.kind === "service" && (
                <Field label="Scope keywords" htmlFor="scope" hint="Comma-separated; matches project scope, name and description.">
                  <Input id="scope" value={(p.match.scope ?? []).join(", ")} onChange={(e) => setMatch({ scope: csv(e.target.value) })} />
                </Field>
              )}
              {page.kind === "area" && (
                <Field label="Cities" htmlFor="cities" hint="Comma-separated, exactly as entered on projects.">
                  <Input id="cities" value={(p.match.cities ?? []).join(", ")} onChange={(e) => setMatch({ cities: csv(e.target.value) })} />
                </Field>
              )}
              <p className="text-xs text-zinc-500">Save, then reload to see the updated count.</p>
            </div>
          </Card>

          <Card title="Visibility">
            <Checkbox
              label="Published"
              hint="Only publish pages with real projects to show — thin pages can hurt rankings."
              checked={p.published}
              onChange={(e) => set({ published: e.target.checked })}
            />
          </Card>

          <Button
            className="w-full"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await saveLanding(p);
                setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
                if (res.ok) router.refresh();
              })
            }
          >
            {pending ? "Saving…" : "Save page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
