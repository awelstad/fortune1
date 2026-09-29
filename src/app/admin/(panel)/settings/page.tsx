import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AlertEmailsCard } from "@/components/admin/AlertEmailsCard";
import type { SiteSettings } from "@/lib/types";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdminPage();
  const [{ data }, { data: admin }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("admin_settings").select("notification_emails").eq("id", 1).maybeSingle(),
  ]);
  return (
    <>
      <PageHeader title="Site settings" description="Company details used in the header, footer, contact page and search results." />
      <div className="mb-6 max-w-2xl">
        <AlertEmailsCard initial={admin?.notification_emails ?? ""} configured={!!process.env.RESEND_API_KEY} />
      </div>
      {data ? <SettingsForm site={data as SiteSettings} /> : <p className="text-sm text-red-600">Settings row missing. Run the import script.</p>}
    </>
  );
}
