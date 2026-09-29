import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { InquiriesList } from "@/components/admin/InquiriesList";
import type { ContactSubmission } from "@/lib/types";

export const metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(500);
  return (
    <>
      <PageHeader title="Inquiries" description="Messages from the website contact form." />
      <InquiriesList items={(data ?? []) as ContactSubmission[]} />
    </>
  );
}
