import { requireAdminPage } from "@/lib/admin/auth";
import { LocalEditor } from "@/components/admin/LocalEditor";
import type { LocalInfo } from "@/lib/types";

export const metadata = { title: "SEO · Local business" };

export default async function LocalAdmin() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("site_settings").select("local").eq("id", 1).single();
  return <LocalEditor initial={(data?.local ?? {}) as LocalInfo} />;
}
