import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/auth";
import { LandingEditor } from "@/components/admin/LandingEditor";
import { matchProjects } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";
import type { LandingPage, ProjectWithMedia } from "@/lib/types";

export const metadata = { title: "SEO · Edit landing page" };

const PATH = { service: "/services", market: "/markets", area: "/service-areas" } as const;

export default async function EditLanding({ params }: PageProps<"/admin/seo/landing/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdminPage();
  const [{ data: page }, { data: cats }, { data: projects }] = await Promise.all([
    supabase.from("landing_pages").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_categories").select("slug, name").order("sort_order"),
    supabase
      .from("projects")
      .select("*, category:project_categories(id, slug, name, short_name)")
      .eq("published", true)
      .is("archived_at", null),
  ]);
  if (!page) notFound();
  const lp = page as LandingPage;
  const list = ((projects ?? []) as ProjectWithMedia[]).map((p) => ({ ...p, images: [], hero: null }));
  const matched = matchProjects(lp, list).length;

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/admin/seo/landing" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← All landing pages
        </Link>
        {lp.published && (
          <a href={`${PATH[lp.kind]}/${lp.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-signal hover:underline">
            View on site ↗
          </a>
        )}
      </div>
      <LandingEditor page={lp} url={`${SITE_URL}${PATH[lp.kind]}/${lp.slug}`} categories={cats ?? []} matchedCount={matched} />
    </>
  );
}
