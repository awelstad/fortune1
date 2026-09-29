import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { JobsEditor } from "@/components/admin/JobsEditor";
import type { JobOpening } from "@/lib/types";

export const metadata = { title: "Job openings" };

export default async function CareersAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("job_openings").select("*").order("sort_order").order("title");
  return (
    <>
      <PageHeader title="Job openings" description="Positions listed on the /careers page." />
      <JobsEditor jobs={(data ?? []) as JobOpening[]} />
    </>
  );
}
