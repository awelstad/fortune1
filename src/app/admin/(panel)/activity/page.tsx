import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { Card, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Activity log" };

const TABLES: Record<string, string> = {
  projects: "Project",
  project_images: "Project photo",
  project_categories: "Industry",
  company_statistics: "Statistic",
  homepage_settings: "Homepage",
  site_settings: "Site settings",
  admin_settings: "Alert settings",
  admin_users: "Admin access",
  team_members: "Team member",
  job_openings: "Job opening",
  testimonials: "Testimonial",
  landing_pages: "Landing page",
  seo_pages: "SEO page",
  contact_submissions: "Inquiry",
};
const VERB: Record<string, string> = { INSERT: "Added", UPDATE: "Changed", DELETE: "Deleted" };
const PAGE = 100;

type Entry = {
  id: number;
  at: string;
  actor_email: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  label: string | null;
  changed: string[] | null;
};

const when = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const page = Math.max(0, Number(sp.page) || 0);
  const { data, count } = await supabase
    .from("admin_audit_log")
    .select("id, at, actor_email, action, table_name, label, changed", { count: "exact" })
    .order("at", { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE - 1);
  const rows = (data ?? []) as Entry[];
  const total = count ?? 0;

  return (
    <>
      <PageHeader
        title="Activity log"
        description="Every change made in the admin — who, what and when. Recorded automatically by the database; entries can't be edited or deleted."
      />
      <Card>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">No admin changes recorded yet.</p>
        ) : (
          <div className="-m-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">When (ET)</th>
                  <th className="px-3 py-3 font-medium">Who</th>
                  <th className="px-3 py-3 font-medium">What</th>
                  <th className="px-5 py-3 font-medium">Fields changed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-zinc-600">{when.format(new Date(r.at))}</td>
                    <td className="px-3 py-3 text-zinc-700">{r.actor_email ?? "—"}</td>
                    <td className="px-3 py-3">
                      <span className={r.action === "DELETE" ? "font-medium text-red-700" : "font-medium text-zinc-900"}>{VERB[r.action]}</span>{" "}
                      <span className="text-zinc-600">{(TABLES[r.table_name] ?? r.table_name).toLowerCase()}</span>
                      {r.label && <span className="block text-zinc-900">{r.label}</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">{r.changed?.map((c) => c.replace(/_/g, " ")).join(", ") ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {total > PAGE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            {page * PAGE + 1}–{Math.min(total, (page + 1) * PAGE)} of {total}
          </span>
          <span className="flex gap-4">
            {page > 0 && (
              <Link href={`/admin/activity?page=${page - 1}`} className="text-signal hover:underline">
                ← Newer
              </Link>
            )}
            {(page + 1) * PAGE < total && (
              <Link href={`/admin/activity?page=${page + 1}`} className="text-signal hover:underline">
                Older →
              </Link>
            )}
          </span>
        </div>
      )}
    </>
  );
}
