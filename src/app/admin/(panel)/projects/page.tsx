import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader, buttonCls } from "@/components/admin/ui";
import { ProjectsTable, type AdminProjectRow } from "@/components/admin/ProjectsTable";
import type { Category } from "@/lib/types";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdminPage();
  const [{ data: projects }, { data: categories }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, slug, name, status, category_id, city, state, location_label, published, featured, archived_at, display_order, updated_at, hero:project_images!projects_hero_image_fk(storage_path, width), images:project_images!project_images_project_id_fkey(count)",
      )
      .order("display_order")
      .order("name"),
    supabase.from("project_categories").select("*").order("sort_order"),
  ]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Changes on this list save automatically. Drag rows to set display order; status controls which homepage section a project appears in; ★ puts a project in the homepage Featured section."
        actions={
          <Link href="/admin/projects/new" className={buttonCls("primary")}>
            + New project
          </Link>
        }
      />
      <ProjectsTable
        projects={(projects ?? []) as unknown as AdminProjectRow[]}
        categories={(categories ?? []) as Category[]}
      />
    </>
  );
}
