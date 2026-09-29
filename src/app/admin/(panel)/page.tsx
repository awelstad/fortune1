import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { Badge, Card, PageHeader, buttonCls } from "@/components/admin/ui";
import { compactNumber, fullNumber } from "@/lib/format";

export const metadata = { title: "Dashboard" };

type Row = {
  id: string;
  name: string;
  status: string;
  published: boolean;
  featured: boolean;
  archived_at: string | null;
  city: string | null;
  location_label: string | null;
  category_id: string | null;
  summary: string | null;
  project_value: number | null;
  electrical_contract_value: number | null;
  square_feet: number | null;
  units: number | null;
  updated_at: string;
  hero: { width: number | null } | null;
};

export default async function Dashboard() {
  const { supabase } = await requireAdminPage();
  const [{ data }, { count: inquiries }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, name, status, published, featured, archived_at, city, location_label, category_id, summary, project_value, electrical_contract_value, square_feet, units, updated_at, hero:project_images!projects_hero_image_fk(width)",
      )
      .order("updated_at", { ascending: false }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const all = ((data ?? []) as unknown as Row[]).filter((p) => !p.archived_at);
  const live = all.filter((p) => p.published);
  const sum = (f: (p: Row) => number | null) => live.reduce((n, p) => n + (Number(f(p)) || 0), 0);

  const tiles = [
    { label: "Total projects", value: fullNumber(all.length), href: "/admin/projects" },
    { label: "Current", value: fullNumber(all.filter((p) => p.status === "current").length) },
    { label: "Upcoming", value: fullNumber(all.filter((p) => p.status === "upcoming").length) },
    { label: "Completed", value: fullNumber(all.filter((p) => p.status === "completed").length) },
    { label: "Featured", value: fullNumber(all.filter((p) => p.featured).length) },
    { label: "Drafts", value: fullNumber(all.filter((p) => !p.published).length) },
    { label: "Project volume (published)", value: sum((p) => p.project_value) ? `$${compactNumber(sum((p) => p.project_value))}` : "—" },
    { label: "Electrical contracts (published)", value: sum((p) => p.electrical_contract_value) ? `$${compactNumber(sum((p) => p.electrical_contract_value))}` : "—" },
    { label: "Square feet (published)", value: sum((p) => p.square_feet) ? compactNumber(sum((p) => p.square_feet)) : "—" },
    { label: "Units (published)", value: sum((p) => p.units) ? fullNumber(sum((p) => p.units)) : "—" },
    { label: "New inquiries", value: fullNumber(inquiries ?? 0), href: "/admin/inquiries" },
  ];

  const issues = [
    ...live.filter((p) => !p.hero).map((p) => ({ p, text: "No photos" })),
    ...live.filter((p) => p.hero && (p.hero.width ?? 0) < 1200).map((p) => ({ p, text: `Low-res hero (${p.hero!.width}px)` })),
    ...live.filter((p) => !p.city && !p.location_label).map((p) => ({ p, text: "No location" })),
    ...live.filter((p) => !p.category_id).map((p) => ({ p, text: "No industry" })),
    ...live
      .filter((p) => !p.project_value && !p.square_feet && !p.units && !p.electrical_contract_value)
      .map((p) => ({ p, text: "No scale metrics" })),
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of what's on the website."
        actions={
          <Link href="/admin/projects/new" className={buttonCls("primary")}>
            + New project
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {tiles.map((t) => {
          const inner = (
            <>
              <p className="text-xs font-medium text-zinc-500">{t.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{t.value}</p>
            </>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400">
              {inner}
            </Link>
          ) : (
            <div key={t.label} className="rounded-lg border border-zinc-200 bg-white p-4">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card title="Needs attention" description="Published projects missing things that sell the work.">
          {issues.length === 0 ? (
            <p className="text-sm text-zinc-500">Everything looks complete.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {issues.slice(0, 25).map(({ p, text }, i) => (
                <li key={`${p.id}-${i}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link href={`/admin/projects/${p.id}`} className="truncate hover:text-signal">
                    {p.name}
                  </Link>
                  <Badge tone="warn">{text}</Badge>
                </li>
              ))}
            </ul>
          )}
          {issues.length > 25 && <p className="mt-3 text-xs text-zinc-500">+ {issues.length - 25} more</p>}
        </Card>

        <Card title="Recently updated">
          <ul className="divide-y divide-zinc-100">
            {all.slice(0, 10).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link href={`/admin/projects/${p.id}`} className="truncate hover:text-signal">
                  {p.name}
                </Link>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge tone={p.status as "current" | "upcoming" | "completed"}>{p.status}</Badge>
                  <span className="text-xs text-zinc-400">{new Date(p.updated_at).toLocaleDateString()}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
