import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { Badge, Card } from "@/components/admin/ui";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site-url";
import type { LocalInfo } from "@/lib/types";

export const metadata = { title: "SEO" };

type Issue = { ok: boolean; label: string; detail?: string; href?: string; weight?: number };

export default async function SeoOverview() {
  const { supabase } = await requireAdminPage();
  const [{ data: projects }, { data: images }, { data: site }, { data: landing }, { data: team }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, summary, description, city, location_label, hero_image_id, seo_title, published, archived_at")
      .eq("published", true)
      .is("archived_at", null),
    supabase.from("project_images").select("id, alt, project_id"),
    supabase.from("site_settings").select("license_numbers, email, phone, local").eq("id", 1).single(),
    supabase.from("landing_pages").select("id, kind, name, published, intro, seo_description"),
    supabase.from("team_members").select("name").eq("is_active", true),
  ]);

  const live = projects ?? [];
  const liveIds = new Set(live.map((p) => p.id));
  const local = (site?.local ?? {}) as LocalInfo;
  const noDesc = live.filter((p) => !p.summary && !p.description);
  const noCity = live.filter((p) => !p.city && !p.location_label);
  const noPhoto = live.filter((p) => !p.hero_image_id);
  const liveImages = (images ?? []).filter((i) => liveIds.has(i.project_id));
  const noAlt = liveImages.filter((i) => !i.alt?.trim());
  const longTitles = live.filter((p) => (p.seo_title?.length ?? 0) > 60);
  const placeholders = [
    ...live.filter((p) => /placeholder/i.test(p.name)).map((p) => p.name),
    ...(team ?? []).filter((m) => /["“”]/.test(m.name)).map((m) => m.name),
  ];
  const draftAreas = (landing ?? []).filter((l) => !l.published);

  const issues: Issue[] = [
    { ok: !!site?.license_numbers, label: "License number shown on the site", detail: "Florida requires contractors to show their license number in advertising.", href: "/admin/prequalification", weight: 3 },
    { ok: placeholders.length === 0, label: "No placeholder or test content is public", detail: placeholders.length ? `${placeholders.length} to fix: ${placeholders.slice(0, 4).join(", ")}${placeholders.length > 4 ? "…" : ""}` : undefined, href: "/admin/projects", weight: 3 },
    { ok: noDesc.length === 0, label: "Every project has a summary or description", detail: noDesc.length ? `${noDesc.length} projects missing — Google uses this for the snippet` : undefined, href: "/admin/projects", weight: 2 },
    { ok: noCity.length === 0, label: "Every project has a city", detail: noCity.length ? `${noCity.length} projects missing — needed for city pages and local ranking` : undefined, href: "/admin/projects", weight: 2 },
    { ok: noPhoto.length === 0, label: "Every project has a photo", detail: noPhoto.length ? `${noPhoto.length} projects without photos` : undefined, href: "/admin/projects", weight: 1 },
    { ok: noAlt.length === 0, label: "Every photo has alt text", detail: noAlt.length ? `${noAlt.length} of ${liveImages.length} photos missing alt text` : undefined, href: "/admin/projects", weight: 1 },
    { ok: longTitles.length === 0, label: "Project SEO titles fit on Google (≤ 60 characters)", detail: longTitles.length ? `${longTitles.length} too long` : undefined, href: "/admin/projects", weight: 1 },
    { ok: !!site?.email, label: "Company email listed", href: "/admin/settings", weight: 1 },
    { ok: !!local.gbp_url, label: "Google Business Profile linked", detail: "Add your profile URL so Google connects the site and the listing.", href: "/admin/seo/local", weight: 2 },
    { ok: (local.hours?.length ?? 0) > 0, label: "Office hours set", href: "/admin/seo/local", weight: 1 },
  ];
  const total = issues.reduce((n, i) => n + (i.weight ?? 1), 0);
  const score = Math.round((issues.filter((i) => i.ok).reduce((n, i) => n + (i.weight ?? 1), 0) / total) * 100);

  const launch: { done: boolean; label: string; note: string }[] = [
    { done: ALLOW_INDEXING, label: "Site live on fortuneelectrical.com", note: ALLOW_INDEXING ? "Search engines can index the site." : "Until then the site is hidden from Google on purpose, so it doesn't compete with the current WordPress site." },
    { done: !!local.verification?.google, label: "Google Search Console verified", note: "Add the verification code in Local business after the domain moves." },
    { done: !!local.verification?.bing, label: "Bing Webmaster Tools verified", note: "Also covers DuckDuckGo and Yahoo results." },
    { done: false, label: "Sitemap submitted", note: `Submit ${SITE_URL}/sitemap.xml in Search Console after launch.` },
    { done: !!local.gbp_url, label: "Google Business Profile claimed & linked", note: "Category “Electrical contractor”, website link, hours and project photos." },
    { done: false, label: "Directory listings match (name, address, phone)", note: "Some directories still show the old 2151 Andrea Ln address, and Yelp lists “Fire Protection Services”. Update BBB, Yelp, Procore, LinkedIn, ABC & ECF." },
    { done: false, label: "Vercel Analytics enabled", note: "Vercel → fortune project → Analytics → Enable (optional; the Traffic page already works)." },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">SEO health</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{score}%</p>
          <p className="mt-1 text-xs text-zinc-500">{issues.filter((i) => !i.ok).length} items to fix</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">Search engines</p>
          <p className="mt-2">
            {ALLOW_INDEXING ? <Badge tone="current">Indexable</Badge> : <Badge tone="upcoming">Hidden until launch</Badge>}
          </p>
          <p className="mt-2 text-xs text-zinc-500">{SITE_URL.replace(/^https?:\/\//, "")}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">Landing pages live</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{(landing ?? []).filter((l) => l.published).length}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {draftAreas.length ? `${draftAreas.length} drafts: ${draftAreas.map((d) => d.name).join(", ")}` : "services, markets & service areas"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="On-site checks" description="Computed from your content right now.">
          <ul className="divide-y divide-zinc-100">
            {issues.map((i) => (
              <li key={i.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                <span className="flex items-start gap-2.5">
                  <span aria-hidden className={i.ok ? "text-emerald-600" : "text-amber-600"}>
                    {i.ok ? "✓" : "!"}
                  </span>
                  <span>
                    <span className={i.ok ? "text-zinc-500" : "font-medium text-zinc-900"}>{i.label}</span>
                    {!i.ok && i.detail && <span className="block text-xs text-zinc-500">{i.detail}</span>}
                    <span className="sr-only">{i.ok ? "passing" : "needs attention"}</span>
                  </span>
                </span>
                {!i.ok && i.href && (
                  <Link href={i.href} className="shrink-0 text-xs text-signal hover:underline">
                    Fix →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Launch checklist" description="Off-site steps that decide local rankings.">
          <ol className="divide-y divide-zinc-100">
            {launch.map((l, n) => (
              <li key={l.label} className="flex items-start gap-3 py-3 text-sm">
                <span
                  aria-hidden
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${l.done ? "bg-emerald-600 text-white" : "border border-zinc-300 text-zinc-500"}`}
                >
                  {l.done ? "✓" : n + 1}
                </span>
                <span>
                  <span className={l.done ? "text-zinc-500 line-through" : "font-medium"}>{l.label}</span>
                  <span className="sr-only">{l.done ? "done" : "to do"}</span>
                  {!l.done && <span className="block text-xs text-zinc-500">{l.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card title="What's already built in" description="Technical SEO that runs automatically.">
        <ul className="grid gap-x-8 gap-y-2 text-sm text-zinc-700 sm:grid-cols-2">
          {[
            "Local business structured data (address, map pin, hours, service area, license)",
            "Sitemap with every page and project photo",
            "Service, market and service-area landing pages",
            "Breadcrumbs, FAQ and job-posting structured data",
            "Unique titles, descriptions and canonical URLs on every page",
            "Social share images and previews",
            "Redirects from every old WordPress URL",
            "/llms.txt summary for AI search tools",
            "Fast pages: static rendering, optimized images, no layout shift",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-emerald-600" aria-hidden>
                ✓
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
