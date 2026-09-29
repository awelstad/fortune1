import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import type { Category } from "@/lib/types";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { supabase } = await requireAdminPage();
  const { data: categories } = await supabase.from("project_categories").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="New project" description="Create the project first — you can add photos right after." />
      <ProjectEditor project={null} categories={(categories ?? []) as Category[]} />
    </>
  );
}
