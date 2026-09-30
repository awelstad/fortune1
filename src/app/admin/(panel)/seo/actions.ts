"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateSite, run, type ActionResult } from "@/lib/admin/auth";
import type { LandingPage, LocalInfo } from "@/lib/types";

const refresh = () => {
  revalidateSite();
  revalidatePath("/admin", "layout");
};

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

export async function saveSeoPage(input: { path: string; title: string; description: string; noindex: boolean }): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();
    if (!/^\/[a-z0-9/\-]*$/.test(input.path)) return { ok: false, message: "Invalid page." };
    const { error } = await supabase.from("seo_pages").upsert({
      path: input.path,
      title: str(input.title, 120),
      description: str(input.description, 320),
      noindex: !!input.noindex,
    });
    if (error) throw error;
    refresh();
    return { ok: true, message: "Saved." };
  });
}

export async function saveLocal(local: LocalInfo): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();
    const url = (u: unknown) => {
      const s = str(u, 300);
      if (!s) return "";
      try {
        const p = new URL(s);
        return p.protocol === "https:" || p.protocol === "http:" ? s : "";
      } catch {
        return "";
      }
    };
    const time = (t: unknown) => (typeof t === "string" && /^\d{2}:\d{2}$/.test(t) ? t : null);
    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const hours = (local.hours ?? [])
      .map((h) => ({ days: (h.days ?? []).filter((d) => DAYS.includes(d)), opens: time(h.opens), closes: time(h.closes) }))
      .filter((h): h is { days: string[]; opens: string; closes: string } => h.days.length > 0 && !!h.opens && !!h.closes)
      .slice(0, 7);
    const lat = Number(local.geo?.lat), lng = Number(local.geo?.lng);
    const clean: LocalInfo = {
      hours,
      hours_source: str(local.hours_source, 200) ?? undefined,
      areas: (local.areas ?? []).map((a) => str(a, 80)).filter((a): a is string => !!a).slice(0, 20),
      geo: Number.isFinite(lat) && Number.isFinite(lng) && lat > 24 && lat < 32 && lng > -88 && lng < -79 ? { lat, lng } : undefined,
      gbp_url: url(local.gbp_url),
      verification: {
        google: (str(local.verification?.google, 100) ?? "").replace(/[^\w-]/g, ""),
        bing: (str(local.verification?.bing, 100) ?? "").replace(/[^\w-]/g, ""),
      },
    };
    const { error } = await supabase.from("site_settings").update({ local: clean }).eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Local business info saved." };
  });
}

export async function saveLanding(input: Omit<LandingPage, "updated_at" | "sort_order" | "kind" | "slug">): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();
    const name = str(input.name, 120);
    if (!name) return { ok: false, message: "Name is required." };
    const faqs = (input.faqs ?? [])
      .map((f) => ({ q: str(f.q, 200) ?? "", a: str(f.a, 800) ?? "" }))
      .filter((f) => f.q && f.a)
      .slice(0, 12);
    const list = (xs: unknown, max: number) =>
      (Array.isArray(xs) ? xs : []).map((x) => str(x, max)).filter((x): x is string => !!x).slice(0, 30);
    const { error } = await supabase
      .from("landing_pages")
      .update({
        name,
        headline: str(input.headline, 160),
        seo_title: str(input.seo_title, 120),
        seo_description: str(input.seo_description, 320),
        intro: str(input.intro, 1200),
        body: str(input.body, 6000),
        faqs,
        match: {
          categories: list(input.match?.categories, 60),
          scope: list(input.match?.scope, 60).map((s) => s.toLowerCase()),
          cities: list(input.match?.cities, 80),
          labels: list(input.match?.labels, 80),
        },
        published: !!input.published,
      })
      .eq("id", input.id);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Page saved." };
  });
}
