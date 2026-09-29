import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoriesEditor } from "@/components/admin/CategoriesEditor";
import type { Category } from "@/lib/types";

export const metadata = { title: "Industries" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdminPage();
  const [{ data: categories }, { data: projects }] = await Promise.all([
    supabase.from("project_categories").select("*").order("sort_order"),
    supabase.from("projects").select("category_id").is("archived_at", null),
  ]);
  const counts: Record<string, number> = {};
  for (const p of projects ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;

  return (
    <>
      <PageHeader
        title="Industries"
        description="Project categories. Used for filters on /projects and the Industries section on the homepage."
      />
      <CategoriesEditor categories={(categories ?? []) as Category[]} counts={counts} />
    </>
  );
}
