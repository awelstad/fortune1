import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { StatisticsEditor } from "@/components/admin/StatisticsEditor";
import type { AutoSource, CompanyStatistic } from "@/lib/types";

export const metadata = { title: "Statistics" };

export default async function StatisticsPage() {
  const { supabase } = await requireAdminPage();
  const [{ data: stats }, { data: projects }] = await Promise.all([
    supabase.from("company_statistics").select("*").order("sort_order"),
    supabase
      .from("projects")
      .select("square_feet, units, project_value, electrical_contract_value")
      .eq("published", true)
      .is("archived_at", null),
  ]);
  const list = projects ?? [];
  const sum = (k: "square_feet" | "units" | "project_value" | "electrical_contract_value") =>
    list.reduce((n, p) => n + (Number(p[k]) || 0), 0);
  const autoValues: Record<AutoSource, number> = {
    manual: 0,
    project_count: list.length,
    square_feet: sum("square_feet"),
    units: sum("units"),
    project_value: sum("project_value"),
    contract_value: sum("electrical_contract_value"),
  };

  return (
    <>
      <PageHeader title="Company statistics" description="The numbers band directly under the homepage hero." />
      <StatisticsEditor stats={(stats ?? []) as CompanyStatistic[]} autoValues={autoValues} />
    </>
  );
}
