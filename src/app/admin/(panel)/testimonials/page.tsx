import { requireAdminPage } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialsEditor } from "@/components/admin/TestimonialsEditor";
import type { Testimonial } from "@/lib/types";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  return (
    <>
      <PageHeader title="Testimonials" description="Shown one at a time in the homepage GC band." />
      <TestimonialsEditor items={(data ?? []) as Testimonial[]} />
    </>
  );
}
