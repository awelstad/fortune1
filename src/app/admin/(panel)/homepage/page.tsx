import { requireAdminPage } from "@/lib/admin/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { SectionOrder } from "@/components/admin/SectionOrder";
import { NowBuildingEditor } from "@/components/admin/NowBuildingEditor";
import { byJobSize, jobValue } from "@/lib/now-building";
import type { HomepageSettings } from "@/lib/types";

export const metadata = { title: "Homepage" };

export default async function HomepageAdmin() {
  const { supabase } = await requireAdminPage();
  const [{ data: home }, { data: projects }] = await Promise.all([
    supabase.from("homepage_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("projects")
      .select("id, name, status, published, archived_at, city, display_order, project_value, electrical_contract_value, square_feet, images:project_images!project_images_project_id_fkey(id)")
      .order("display_order")
      .order("name"),
  ]);
  const active = (projects ?? []).filter((p) => !p.archived_at);
  const live = active.filter((p) => p.published);
  const allIds = active.map((p) => p.id);
  const nowJobs = live
    .filter((p) => p.status === "current")
    .sort(byJobSize)
    .map((p) => ({ id: p.id, name: p.name, value: jobValue(p), sf: p.square_feet, city: p.city }));
  const section = (s: string) => live.filter((p) => p.status === s).map((p) => ({ id: p.id, name: p.name }));

  return (
    <>
      <PageHeader title="Homepage" description="Everything on the homepage except the projects themselves." />
      {home && (
        <div className="mb-6">
          <NowBuildingEditor
            jobs={nowJobs}
            initial={{ count: home.now_building_count ?? 5, mode: home.now_building_mode ?? "auto", ids: home.now_building_ids ?? [] }}
          />
        </div>
      )}
      {home ? (
        <HomepageEditor
          home={home as HomepageSettings}
          projects={active.map((p) => ({ ...p, hasPhoto: (p.images?.length ?? 0) > 0 }))}
        />
      ) : (
        <p className="text-sm text-red-600">Homepage settings row is missing. Run the import script.</p>
      )}
      <div className="mt-6">
        <Card title="Project order by section" description="Drag to reorder what appears first in each homepage section and on /projects.">
          <div className="grid gap-6 lg:grid-cols-3">
            <SectionOrder title="Current" items={section("current")} allIds={allIds} />
            <SectionOrder title="Upcoming" items={section("upcoming")} allIds={allIds} />
            <SectionOrder title="Completed" items={section("completed")} allIds={allIds} />
          </div>
        </Card>
      </div>
    </>
  );
}
