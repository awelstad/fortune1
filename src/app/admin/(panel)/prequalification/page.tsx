import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { PrequalEditor } from "@/components/admin/PrequalEditor";
import type { Prequal, Safety } from "@/lib/types";

export const metadata = { title: "Prequal & Safety" };

export default async function PrequalAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("site_settings").select("prequal, safety, license_numbers").eq("id", 1).single();
  return (
    <>
      <PageHeader title="Prequalification & safety" description="Shown on /prequalification and in the homepage GC band." />
      <PrequalEditor
        prequal={(data?.prequal ?? {}) as Prequal}
        safety={(data?.safety ?? {}) as Safety}
        licenseNumbers={data?.license_numbers ?? null}
      />
    </>
  );
}
