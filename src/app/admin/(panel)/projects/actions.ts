"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateSite, run, type ActionResult } from "@/lib/admin/auth";
import { slugify } from "@/lib/format";
import type { ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = ["current", "upcoming", "completed"];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function refresh(slug?: string) {
  revalidateSite();
  revalidatePath("/admin", "layout");
  if (slug) revalidatePath(`/projects/${slug}`);
}

// ---------------------------------------------------------------------------
// Create / update from the editor form
// ---------------------------------------------------------------------------
export async function saveProject(_prev: ActionResult<{ id: string }>, form: FormData): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const errors: Record<string, string> = {};
    const str = (k: string, max = 500) => {
      const v = String(form.get(k) ?? "").trim();
      if (v.length > max) errors[k] = `Must be ${max} characters or fewer.`;
      return v || null;
    };
    const int = (k: string) => {
      const raw = String(form.get(k) ?? "").replace(/[,\s$]/g, "");
      if (!raw) return null;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
        errors[k] = "Enter a whole number.";
        return null;
      }
      return n;
    };
    const date = (k: string) => {
      const v = String(form.get(k) ?? "").trim();
      if (!v) return null;
      if (!DATE.test(v)) errors[k] = "Use a valid date.";
      return v;
    };

    const id = str("id", 64);
    const name = str("name", 200);
    if (!name) errors.name = "Project name is required.";
    const slug = str("slug", 100) ?? (name ? slugify(name) : null);
    if (!slug || !SLUG.test(slug)) errors.slug = "Use lowercase letters, numbers and hyphens.";
    const status = String(form.get("status")) as ProjectStatus;
    if (!STATUSES.includes(status)) errors.status = "Choose a status.";

    let scope: string[] = [];
    try {
      const parsed = JSON.parse(String(form.get("scope") ?? "[]"));
      if (!Array.isArray(parsed)) throw new Error();
      scope = parsed.map((s) => String(s).trim().slice(0, 80)).filter(Boolean).slice(0, 30);
    } catch {
      errors.scope = "Invalid scope list.";
    }

    const row = {
      name,
      slug,
      status,
      category_id: str("category_id", 64),
      city: str("city", 100),
      state: str("state", 50),
      location_label: str("location_label", 120),
      summary: str("summary", 400),
      description: str("description", 8000),
      scope,
      project_value: int("project_value"),
      electrical_contract_value: int("electrical_contract_value"),
      project_size: str("project_size", 160),
      square_feet: int("square_feet") || null,
      stories: int("stories") || null,
      units: int("units") || null,
      start_date: date("start_date"),
      completion_date: date("completion_date"),
      timeline_note: str("timeline_note", 160),
      general_contractor: str("general_contractor", 200),
      owner: str("owner", 200),
      architect: str("architect", 200),
      featured: form.get("featured") === "on",
      published: form.get("published") === "on",
      display_order: int("display_order") ?? 1000,
      seo_title: str("seo_title", 120),
      seo_description: str("seo_description", 300),
    };

    if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

    // slug must be unique
    const { data: clash } = await supabase.from("projects").select("id").eq("slug", slug!).maybeSingle();
    if (clash && clash.id !== id) {
      return { ok: false, message: "Another project already uses that URL slug.", errors: { slug: "Already in use." } };
    }

    if (id) {
      const { data: before } = await supabase.from("projects").select("slug").eq("id", id).single();
      const { error } = await supabase.from("projects").update(row).eq("id", id);
      if (error) throw error;
      refresh(slug!);
      if (before && before.slug !== slug) revalidatePath(`/projects/${before.slug}`);
      return { ok: true, message: "Saved.", data: { id } };
    }

    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) throw error;
    refresh(slug!);
    redirect(`/admin/projects/${data.id}?created=1`);
  });
}

// ---------------------------------------------------------------------------
// Quick actions from the list
// ---------------------------------------------------------------------------
type Patch = Partial<{ status: ProjectStatus; published: boolean; featured: boolean; category_id: string | null }>;

export async function patchProject(id: string, patch: Patch): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const clean: Patch = {};
    if (patch.status !== undefined) {
      if (!STATUSES.includes(patch.status)) return { ok: false, message: "Invalid status." };
      clean.status = patch.status;
    }
    if (patch.published !== undefined) clean.published = !!patch.published;
    if (patch.featured !== undefined) clean.featured = !!patch.featured;
    if (patch.category_id !== undefined) clean.category_id = patch.category_id || null;
    const { data, error } = await supabase.from("projects").update(clean).eq("id", id).select("slug").single();
    if (error) throw error;
    refresh(data.slug);
    return { ok: true };
  });
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const results = await Promise.all(
      ids.slice(0, 500).map((id, i) => supabase.from("projects").update({ display_order: (i + 1) * 10 }).eq("id", id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    refresh();
    return { ok: true, message: "Order saved." };
  });
}

export async function archiveProject(id: string, archived: boolean): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("projects")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id)
      .select("slug")
      .single();
    if (error) throw error;
    refresh(data.slug);
    return { ok: true, message: archived ? "Archived." : "Restored." };
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data: images } = await supabase.from("project_images").select("storage_path").eq("project_id", id);
    const { data, error } = await supabase.from("projects").delete().eq("id", id).select("slug").single();
    if (error) throw error;
    if (images?.length) await supabase.storage.from("media").remove(images.map((i) => i.storage_path));
    refresh(data.slug);
    return { ok: true, message: "Deleted." };
  });
}

export async function duplicateProject(id: string): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data: src, error } = await supabase.from("projects").select("*").eq("id", id).single();
    if (error) throw error;

    let slug = `${src.slug}-copy`;
    for (let n = 2; ; n++) {
      const { data: taken } = await supabase.from("projects").select("id").eq("slug", slug).maybeSingle();
      if (!taken) break;
      slug = `${src.slug}-copy-${n}`;
    }

    const { id: _id, created_at: _c, updated_at: _u, hero_image_id: heroId, ...rest } = src;
    void _id;
    void _c;
    void _u;
    const { data: copy, error: insErr } = await supabase
      .from("projects")
      .insert({ ...rest, slug, name: `${src.name} (Copy)`, published: false, featured: false, archived_at: null })
      .select("id")
      .single();
    if (insErr) throw insErr;

    // copy images into the new project's folder
    const { data: images } = await supabase.from("project_images").select("*").eq("project_id", id).order("sort_order");
    let newHero: string | null = null;
    for (const img of images ?? []) {
      const ext = img.storage_path.split(".").pop();
      const path = `projects/${copy.id}/${crypto.randomUUID()}.${ext}`;
      const { error: cpErr } = await supabase.storage.from("media").copy(img.storage_path, path);
      if (cpErr) continue;
      const { data: row } = await supabase
        .from("project_images")
        .insert({
          project_id: copy.id,
          storage_path: path,
          width: img.width,
          height: img.height,
          alt: img.alt,
          caption: img.caption,
          sort_order: img.sort_order,
        })
        .select("id")
        .single();
      if (row && img.id === heroId) newHero = row.id;
    }
    if (newHero) await supabase.from("projects").update({ hero_image_id: newHero }).eq("id", copy.id);

    refresh();
    return { ok: true, message: "Duplicated as a draft.", data: { id: copy.id } };
  });
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
type Uploaded = { path: string; width: number; height: number; alt?: string };

async function assertUploaded(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], projectId: string, path: string) {
  const prefix = `projects/${projectId}/`;
  if (!path.startsWith(prefix) || path.includes("..") || !/\.(jpe?g|png|webp|avif|gif)$/i.test(path)) {
    throw new Error("Invalid upload path.");
  }
  const file = path.slice(prefix.length);
  const { data } = await supabase.storage.from("media").list(prefix.slice(0, -1), { search: file, limit: 1 });
  const obj = data?.find((o) => o.name === file);
  if (!obj) throw new Error("Upload not found in storage.");
  const mime = (obj.metadata as { mimetype?: string } | null)?.mimetype ?? "";
  if (!mime.startsWith("image/")) {
    await supabase.storage.from("media").remove([path]);
    throw new Error("Only image files are allowed.");
  }
}

async function projectSlug(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], projectId: string) {
  const { data } = await supabase.from("projects").select("slug, hero_image_id").eq("id", projectId).single();
  return data;
}

export async function addProjectImages(projectId: string, items: Uploaded[]): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    if (!items.length || items.length > 50) return { ok: false, message: "Upload between 1 and 50 images." };
    for (const it of items) await assertUploaded(supabase, projectId, it.path);

    const { data: last } = await supabase
      .from("project_images")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const base = (last?.sort_order ?? -1) + 1;
    const { data: inserted, error } = await supabase
      .from("project_images")
      .insert(
        items.map((it, i) => ({
          project_id: projectId,
          storage_path: it.path,
          width: Math.round(it.width) || null,
          height: Math.round(it.height) || null,
          alt: it.alt?.slice(0, 300) || null,
          sort_order: base + i,
        })),
      )
      .select("id");
    if (error) throw error;

    const proj = await projectSlug(supabase, projectId);
    if (proj && !proj.hero_image_id && inserted?.[0]) {
      await supabase.from("projects").update({ hero_image_id: inserted[0].id }).eq("id", projectId);
    }
    refresh(proj?.slug);
    return { ok: true, message: `${items.length} image${items.length === 1 ? "" : "s"} added.` };
  });
}

export async function updateProjectImage(id: string, patch: { alt?: string; caption?: string }): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("project_images")
      .update({ alt: patch.alt?.slice(0, 300) ?? null, caption: patch.caption?.slice(0, 300) ?? null })
      .eq("id", id)
      .select("project_id")
      .single();
    if (error) throw error;
    const proj = await projectSlug(supabase, data.project_id);
    refresh(proj?.slug);
    return { ok: true };
  });
}

export async function reorderProjectImages(projectId: string, ids: string[]): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    await Promise.all(
      ids.map((id, i) => supabase.from("project_images").update({ sort_order: i }).eq("id", id).eq("project_id", projectId)),
    );
    const proj = await projectSlug(supabase, projectId);
    refresh(proj?.slug);
    return { ok: true };
  });
}

export async function setHeroImage(projectId: string, imageId: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data: img } = await supabase.from("project_images").select("id").eq("id", imageId).eq("project_id", projectId).single();
    if (!img) return { ok: false, message: "Image not found." };
    const { data, error } = await supabase.from("projects").update({ hero_image_id: imageId }).eq("id", projectId).select("slug").single();
    if (error) throw error;
    refresh(data.slug);
    return { ok: true, message: "Hero image updated." };
  });
}

export async function deleteProjectImage(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data: img, error } = await supabase.from("project_images").select("*").eq("id", id).single();
    if (error) throw error;
    const proj = await projectSlug(supabase, img.project_id);
    const { error: delErr } = await supabase.from("project_images").delete().eq("id", id);
    if (delErr) throw delErr;
    await supabase.storage.from("media").remove([img.storage_path]);

    if (proj?.hero_image_id === id) {
      const { data: next } = await supabase
        .from("project_images")
        .select("id")
        .eq("project_id", img.project_id)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      await supabase.from("projects").update({ hero_image_id: next?.id ?? null }).eq("id", img.project_id);
    }
    refresh(proj?.slug);
    return { ok: true, message: "Image deleted." };
  });
}

export async function replaceProjectImage(id: string, upload: Uploaded): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { data: img, error } = await supabase.from("project_images").select("*").eq("id", id).single();
    if (error) throw error;
    await assertUploaded(supabase, img.project_id, upload.path);
    const { error: upErr } = await supabase
      .from("project_images")
      .update({ storage_path: upload.path, width: Math.round(upload.width) || null, height: Math.round(upload.height) || null })
      .eq("id", id);
    if (upErr) throw upErr;
    await supabase.storage.from("media").remove([img.storage_path]);
    const proj = await projectSlug(supabase, img.project_id);
    refresh(proj?.slug);
    return { ok: true, message: "Image replaced." };
  });
}
