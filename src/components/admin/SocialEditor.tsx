"use client";

import { useState, useTransition } from "react";
import { saveSocial } from "@/app/admin/(panel)/social/actions";
import { SOCIAL_KEYS, SOCIAL_LABELS } from "@/components/site/SocialLinks";
import type { PhotoStrip, StripPage } from "@/lib/types";
import { Badge, Button, Card, Checkbox, Field, Input, Notice } from "./ui";

const PLACEHOLDER: Record<string, string> = {
  linkedin: "https://www.linkedin.com/company/…",
  instagram: "https://www.instagram.com/…",
  facebook: "https://www.facebook.com/…",
  youtube: "https://www.youtube.com/@…",
};

const PAGES: { id: StripPage; label: string; hint: string }[] = [
  { id: "home", label: "Homepage", hint: "A thin bar near the bottom, above the final call to action." },
  { id: "careers", label: "Careers", hint: "Shows crews and culture to people thinking about applying." },
];

export function SocialEditor({
  initialLinks,
  initialStrip,
  instagramConnected,
}: {
  initialLinks: Record<string, string>;
  initialStrip: PhotoStrip;
  instagramConnected: boolean;
}) {
  const [links, setLinks] = useState(initialLinks);
  const [strip, setStrip] = useState<PhotoStrip>({
    enabled: false,
    source: "instagram",
    heading: "On the job",
    pages: ["home"],
    ...initialStrip,
  });
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const pages = strip.pages ?? [];
  const needsInstagram = strip.source === "instagram" && !instagramConnected;

  return (
    <div className="space-y-6">
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Social links" description="Leave blank to hide. Also tells Google these profiles belong to Fortune.">
          <div className="grid gap-4">
            {SOCIAL_KEYS.map((k) => (
              <Field key={k} label={SOCIAL_LABELS[k]} htmlFor={`social_${k}`}>
                <Input
                  id={`social_${k}`}
                  type="url"
                  inputMode="url"
                  placeholder={PLACEHOLDER[k]}
                  value={links[k] ?? ""}
                  onChange={(e) => setLinks({ ...links, [k]: e.target.value })}
                />
              </Field>
            ))}
          </div>
        </Card>

        <Card
          title="Photo bar"
          description="A slow-scrolling strip of photos that pauses when someone hovers over it."
          actions={strip.enabled ? <Badge tone="live">On</Badge> : <Badge tone="draft">Off</Badge>}
        >
          <div className="grid gap-5">
            <Checkbox
              label="Show the photo bar on the website"
              hint="Leave off until you're happy with the preview below."
              checked={!!strip.enabled}
              onChange={(e) => setStrip({ ...strip, enabled: e.target.checked })}
            />

            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-zinc-700">Photos from</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["instagram", "Instagram posts", "Latest posts from your account; each links to the post."],
                    ["projects", "Project photos", "One photo per project; each links to the project page."],
                  ] as const
                ).map(([id, label, hint]) => (
                  <label
                    key={id}
                    className={`cursor-pointer rounded-md border p-3 text-sm ${strip.source === id ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200"}`}
                  >
                    <input
                      type="radio"
                      name="strip_source"
                      value={id}
                      checked={strip.source === id}
                      onChange={() => setStrip({ ...strip, source: id })}
                      className="sr-only"
                    />
                    <span className="block font-medium text-zinc-900">{label}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{hint}</span>
                  </label>
                ))}
              </div>
              {needsInstagram && <p className="mt-2 text-xs text-amber-700">Instagram isn&apos;t connected yet — the bar stays hidden until it is.</p>}
            </fieldset>

            <Field label="Heading" htmlFor="strip_heading" hint="Small label above the photos. Leave blank for none.">
              <Input
                id="strip_heading"
                maxLength={60}
                value={strip.heading ?? ""}
                onChange={(e) => setStrip({ ...strip, heading: e.target.value })}
              />
            </Field>

            <fieldset className="grid gap-3">
              <legend className="mb-1.5 text-xs font-medium text-zinc-700">Show on</legend>
              {PAGES.map((p) => (
                <Checkbox
                  key={p.id}
                  label={p.label}
                  hint={p.hint}
                  checked={pages.includes(p.id)}
                  onChange={(e) =>
                    setStrip({ ...strip, pages: e.target.checked ? [...pages, p.id] : pages.filter((x) => x !== p.id) })
                  }
                />
              ))}
            </fieldset>
          </div>
        </Card>
      </div>

      <Button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await saveSocial({ links, strip });
            setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
          })
        }
      >
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
