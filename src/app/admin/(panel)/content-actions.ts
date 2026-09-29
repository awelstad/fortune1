"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateSite, run, type ActionResult } from "@/lib/admin/auth";
import type { AutoSource, Capability } from "@/lib/types";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const AUTO: AutoSource[] = ["manual", "project_count", "square_feet", "units", "project_value", "contract_value"];

function refresh() {
  revalidateSite();
  revalidatePath("/admin", "layout");
}

const text = (form: FormData, k: string, max = 500) => {
  const v = String(form.get(k) ?? "").trim().slice(0, max);
  return v || null;
};

/** Only same-site paths or http(s) URLs are allowed in CMS-editable links. */
function safeHref(v: string | null) {
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? v : null;
  } catch {
    return null;
  }
}

function safeMediaPath(v: string | null) {
  if (!v) return null;
  return /^(site|projects|categories|team)\/[\w\-./]+\.(jpe?g|png|webp|avif|gif)$/i.test(v) && !v.includes("..") ? v : null;
}

function safeVideoPath(v: string | null) {
  if (!v) return null;
  return /^site\/[\w\-./]+\.(mp4|webm)$/i.test(v) && !v.includes("..") ? v : null;
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------
export async function saveHomepage(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    let capabilities: Capability[] = [];
    try {
      capabilities = (JSON.parse(String(form.get("capabilities") ?? "[]")) as Capability[])
        .map((c) => ({ title: String(c.title ?? "").trim().slice(0, 120), body: String(c.body ?? "").trim().slice(0, 400) }))
        .filter((c) => c.title)
        .slice(0, 20);
    } catch {
      return { ok: false, message: "Invalid capabilities list." };
    }

    const row = {
      id: 1,
      hero_eyebrow: text(form, "hero_eyebrow", 120),
      hero_headline: text(form, "hero_headline", 160),
      hero_subheadline: text(form, "hero_subheadline", 400),
      hero_image_path: safeMediaPath(text(form, "hero_image_path", 300)),
      hero_video_path: safeVideoPath(text(form, "hero_video_path", 300)),
      hero_primary_label: text(form, "hero_primary_label", 60),
      hero_primary_href: safeHref(text(form, "hero_primary_href", 300)),
      hero_secondary_label: text(form, "hero_secondary_label", 60),
      hero_secondary_href: safeHref(text(form, "hero_secondary_href", 300)),
      featured_project_id: text(form, "featured_project_id", 64),
      current_heading: text(form, "current_heading", 80),
      current_intro: text(form, "current_intro", 300),
      upcoming_heading: text(form, "upcoming_heading", 80),
      upcoming_intro: text(form, "upcoming_intro", 300),
      portfolio_heading: text(form, "portfolio_heading", 80),
      portfolio_intro: text(form, "portfolio_intro", 300),
      capabilities_heading: text(form, "capabilities_heading", 80),
      capabilities,
      industries_heading: text(form, "industries_heading", 80),
      industries_intro: text(form, "industries_intro", 300),
      cta_heading: text(form, "cta_heading", 160),
      cta_subheading: text(form, "cta_subheading", 300),
      cta_button_label: text(form, "cta_button_label", 60),
      cta_button_href: safeHref(text(form, "cta_button_href", 300)),
    };
    if (!row.hero_headline) return { ok: false, message: "Hero headline is required.", errors: { hero_headline: "Required" } };

    const { error } = await supabase.from("homepage_settings").update(row).eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Homepage saved." };
  });
}

// ---------------------------------------------------------------------------
// Statistics (saved as a whole list)
// ---------------------------------------------------------------------------
export type StatInput = {
  id?: string;
  label: string;
  value: string;
  prefix: string;
  suffix: string;
  auto_source: AutoSource;
  compact: boolean;
  description: string;
  is_active: boolean;
};

export async function saveStatistics(stats: StatInput[]): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const rows = [];
    for (const [i, s] of stats.slice(0, 20).entries()) {
      const label = s.label.trim().slice(0, 80);
      if (!label) return { ok: false, message: `Row ${i + 1}: label is required.` };
      if (!AUTO.includes(s.auto_source)) return { ok: false, message: `Row ${i + 1}: invalid source.` };
      const raw = s.value.replace(/[,\s$]/g, "");
      const value = raw === "" ? null : Number(raw);
      if (value !== null && (!Number.isFinite(value) || value < 0)) return { ok: false, message: `Row ${i + 1}: value must be a number.` };
      rows.push({
        ...(s.id ? { id: s.id } : {}),
        label,
        value: s.auto_source === "manual" ? value : null,
        prefix: s.prefix.trim().slice(0, 8) || null,
        suffix: s.suffix.trim().slice(0, 8) || null,
        auto_source: s.auto_source,
        compact: !!s.compact,
        description: s.description.trim().slice(0, 200) || null,
        is_active: !!s.is_active,
        sort_order: i + 1,
      });
    }

    const { data: existing } = await supabase.from("company_statistics").select("id");
    const keep = new Set(rows.map((r) => r.id).filter(Boolean));
    const remove = (existing ?? []).map((r) => r.id).filter((id) => !keep.has(id));
    if (remove.length) {
      const { error } = await supabase.from("company_statistics").delete().in("id", remove);
      if (error) throw error;
    }
    const updates = rows.filter((r) => r.id);
    const inserts = rows.filter((r) => !r.id);
    for (const r of updates) {
      const { error } = await supabase.from("company_statistics").update(r).eq("id", r.id!);
      if (error) throw error;
    }
    if (inserts.length) {
      const { error } = await supabase.from("company_statistics").insert(inserts);
      if (error) throw error;
    }
    refresh();
    return { ok: true, message: "Statistics saved." };
  });
}

// ---------------------------------------------------------------------------
// Categories / industries (saved as a whole list)
// ---------------------------------------------------------------------------
export type CategoryInput = {
  id?: string;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  image_path: string | null;
  is_active: boolean;
  show_on_home: boolean;
};

export async function saveCategories(cats: CategoryInput[]): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const seen = new Set<string>();
    const rows = [];
    for (const [i, c] of cats.slice(0, 40).entries()) {
      const name = c.name.trim().slice(0, 80);
      const slug = c.slug.trim();
      if (!name) return { ok: false, message: `Row ${i + 1}: name is required.` };
      if (!SLUG.test(slug)) return { ok: false, message: `Row ${i + 1}: slug must be lowercase letters, numbers and hyphens.` };
      if (seen.has(slug)) return { ok: false, message: `Duplicate slug "${slug}".` };
      seen.add(slug);
      rows.push({
        ...(c.id ? { id: c.id } : {}),
        slug,
        name,
        short_name: c.short_name.trim().slice(0, 40) || null,
        description: c.description.trim().slice(0, 240) || null,
        image_path: safeMediaPath(c.image_path),
        is_active: !!c.is_active,
        show_on_home: !!c.show_on_home,
        sort_order: i + 1,
      });
    }

    const { data: existing } = await supabase.from("project_categories").select("id");
    const keep = new Set(rows.map((r) => r.id).filter(Boolean));
    const remove = (existing ?? []).map((r) => r.id).filter((id) => !keep.has(id));
    if (remove.length) {
      const { error } = await supabase.from("project_categories").delete().in("id", remove);
      if (error) throw error;
    }
    // Two passes avoid transient unique-slug collisions when slugs are swapped.
    for (const r of rows.filter((r) => r.id)) {
      const { error } = await supabase.from("project_categories").update({ slug: `tmp-${r.id}` }).eq("id", r.id!);
      if (error) throw error;
    }
    for (const r of rows.filter((r) => r.id)) {
      const { error } = await supabase.from("project_categories").update(r).eq("id", r.id!);
      if (error) throw error;
    }
    const inserts = rows.filter((r) => !r.id);
    if (inserts.length) {
      const { error } = await supabase.from("project_categories").insert(inserts);
      if (error) throw error;
    }
    refresh();
    return { ok: true, message: "Industries saved." };
  });
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export async function saveSiteSettings(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();
    const company = text(form, "company_name", 120);
    if (!company) return { ok: false, message: "Company name is required.", errors: { company_name: "Required" } };
    const email = text(form, "email", 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Invalid email.", errors: { email: "Invalid email" } };

    const social: Record<string, string> = {};
    for (const k of ["linkedin", "facebook", "instagram", "youtube"]) {
      const v = safeHref(text(form, `social_${k}`, 300));
      if (v) social[k] = v;
    }

    const { error } = await supabase
      .from("site_settings")
      .update({
        company_name: company,
        legal_name: text(form, "legal_name", 160),
        tagline: text(form, "tagline", 200),
        phone: text(form, "phone", 40),
        email,
        address_line1: text(form, "address_line1", 160),
        address_line2: text(form, "address_line2", 160),
        city: text(form, "city", 80),
        state: text(form, "state", 40),
        postal_code: text(form, "postal_code", 20),
        license_numbers: text(form, "license_numbers", 200),
        service_area: text(form, "service_area", 160),
        default_seo_title: text(form, "default_seo_title", 120),
        default_seo_description: text(form, "default_seo_description", 300),
        social_links: social,
      })
      .eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Settings saved." };
  });
}

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------
export async function setInquiryStatus(id: string, status: "new" | "read" | "archived"): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    if (!["new", "read", "archived"].includes(status)) return { ok: false, message: "Invalid status." };
    const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Deleted." };
  });
}

// ---------------------------------------------------------------------------
// Team (saved as a whole list)
// ---------------------------------------------------------------------------
export type TeamInput = {
  id?: string;
  name: string;
  title: string;
  group_name: string;
  email: string;
  photo_path: string | null;
  is_active: boolean;
};

async function saveList<T extends { id?: string }>(
  table: "team_members" | "job_openings",
  rows: (Omit<T, "id"> & { id?: string; sort_order: number })[],
) {
  const { supabase } = await requireAdmin();
  const { data: existing } = await supabase.from(table).select("id");
  const keep = new Set(rows.map((r) => r.id).filter(Boolean));
  const remove = (existing ?? []).map((r) => r.id).filter((id) => !keep.has(id));
  if (remove.length) {
    const { error } = await supabase.from(table).delete().in("id", remove);
    if (error) throw error;
  }
  for (const r of rows.filter((r) => r.id)) {
    const { error } = await supabase.from(table).update(r).eq("id", r.id!);
    if (error) throw error;
  }
  const inserts = rows.filter((r) => !r.id).map(({ id: _id, ...r }) => {
    void _id;
    return r;
  });
  if (inserts.length) {
    const { error } = await supabase.from(table).insert(inserts);
    if (error) throw error;
  }
}

export async function saveTeam(members: TeamInput[]): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const rows = [];
    for (const [i, m] of members.slice(0, 200).entries()) {
      const name = m.name.trim().slice(0, 120);
      if (!name) return { ok: false, message: `Row ${i + 1}: name is required.` };
      const email = m.email.trim().slice(0, 200);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: `${name}: invalid email.` };
      rows.push({
        ...(m.id ? { id: m.id } : {}),
        name,
        title: m.title.trim().slice(0, 120) || null,
        group_name: m.group_name.trim().slice(0, 60) || "Team",
        email: email || null,
        photo_path: m.photo_path && /^team\/[\w\-./]+\.(jpe?g|png|webp|avif|gif)$/i.test(m.photo_path) ? m.photo_path : null,
        is_active: !!m.is_active,
        sort_order: (i + 1) * 10,
      });
    }
    await saveList("team_members", rows);
    refresh();
    return { ok: true, message: "Team saved." };
  });
}

// ---------------------------------------------------------------------------
// Job openings (saved as a whole list)
// ---------------------------------------------------------------------------
export type JobInput = {
  id?: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  summary: string;
  is_active: boolean;
};

export async function saveJobs(jobs: JobInput[]): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const rows = [];
    for (const [i, j] of jobs.slice(0, 100).entries()) {
      const title = j.title.trim().slice(0, 120);
      if (!title) return { ok: false, message: `Row ${i + 1}: job title is required.` };
      rows.push({
        ...(j.id ? { id: j.id } : {}),
        title,
        department: j.department.trim().slice(0, 80) || null,
        location: j.location.trim().slice(0, 80) || null,
        employment_type: j.employment_type.trim().slice(0, 40) || null,
        summary: j.summary.trim().slice(0, 400) || null,
        is_active: !!j.is_active,
        sort_order: (i + 1) * 10,
      });
    }
    await saveList("job_openings", rows);
    refresh();
    return { ok: true, message: "Job openings saved." };
  });
}
