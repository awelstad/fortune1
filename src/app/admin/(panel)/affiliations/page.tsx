import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { AffiliationsEditor } from "@/components/admin/AffiliationsEditor";
import type { Affiliation } from "@/lib/types";

export const metadata = { title: "Affiliations" };

export default async function AffiliationsAdmin() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("site_settings").select("affiliations").eq("id", 1).single();
  return (
    <>
      <PageHeader
        title="Affiliations"
        description="Certification and association logos in the website footer. Add, replace, reorder, link or hide them — then save."
      />
      <AffiliationsEditor initial={(data?.affiliations ?? []) as Affiliation[]} />
    </>
  );
}
