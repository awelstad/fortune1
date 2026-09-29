import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { TeamEditor } from "@/components/admin/TeamEditor";
import type { TeamMember } from "@/lib/types";

export const metadata = { title: "Team" };

export default async function TeamAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("team_members").select("*").order("sort_order").order("name");
  return (
    <>
      <PageHeader title="Team" description="People and photos on the /team page. Portrait photos (4:5) look best." />
      <TeamEditor members={(data ?? []) as TeamMember[]} />
    </>
  );
}
