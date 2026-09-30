import { requireAdminPage } from "@/lib/admin/auth";
import { SeoPagesEditor } from "@/components/admin/SeoPagesEditor";
import { STATIC_SEO } from "@/lib/seo-pages";
import { SITE_URL } from "@/lib/site-url";

export const metadata = { title: "SEO · Pages" };

export default async function SeoPagesAdmin() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("seo_pages").select("*");
  const saved = Object.fromEntries((data ?? []).map((r) => [r.path, r]));
  const rows = Object.entries(STATIC_SEO).map(([path, d]) => ({
    path,
    label: d.label,
    defTitle: d.title,
    defDesc: d.description,
    title: saved[path]?.title ?? "",
    description: saved[path]?.description ?? "",
    noindex: saved[path]?.noindex ?? false,
  }));
  return (
    <>
      <p className="mb-4 text-sm text-zinc-500">
        Each page already has a keyword-tuned title and description. Only change them if you want different wording — leave blank to keep the
        default. Projects are edited in each project; service, market and area pages under Landing pages.
      </p>
      <SeoPagesEditor rows={rows} siteUrl={SITE_URL} />
    </>
  );
}
