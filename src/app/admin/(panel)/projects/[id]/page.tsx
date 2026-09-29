import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/auth";
import { Badge, Card, Notice, PageHeader, buttonCls } from "@/components/admin/ui";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { ImageManager } from "@/components/admin/ImageManager";
import type { Category, Project, ProjectImage } from "@/lib/types";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdminPage();

  const [{ data: project }, { data: categories }, { data: images }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_categories").select("*").order("sort_order"),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
  ]);
  if (!project) notFound();
  const p = project as Project;

  return (
    <>
      <PageHeader
        title={p.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={p.status}>{p.status}</Badge>
            <Badge tone={p.published ? "live" : "draft"}>{p.published ? "Published" : "Draft"}</Badge>
            {p.archived_at && <Badge tone="draft">Archived</Badge>}
            <span className="text-zinc-400">Updated {new Date(p.updated_at).toLocaleString()}</span>
          </span>
        }
        actions={
          p.published && !p.archived_at ? (
            <Link href={`/projects/${p.slug}`} target="_blank" className={buttonCls("secondary")}>
              View on site ↗
            </Link>
          ) : undefined
        }
      />
      {sp.created && (
        <div className="mb-6">
          <Notice tone="success">Project created. Now add photos below, then publish when ready.</Notice>
        </div>
      )}
      <ProjectEditor project={p} categories={(categories ?? []) as Category[]} />
      <div className="mt-6">
        <Card
          title="Photos"
          description="Drag to reorder. The hero image is used on cards and at the top of the project page; the rest form the gallery."
        >
          <ImageManager projectId={p.id} projectName={p.name} images={(images ?? []) as ProjectImage[]} heroId={p.hero_image_id} />
        </Card>
      </div>
    </>
  );
}
