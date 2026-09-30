"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateSite, run, type ActionResult } from "@/lib/admin/auth";
import { verifyInstagramToken } from "@/lib/photo-strip";
import type { PhotoStrip, StripPage } from "@/lib/types";

const refresh = () => {
  revalidateSite();
  revalidatePath("/admin", "layout");
};

const HOSTS: Record<string, RegExp> = {
  linkedin: /(^|\.)linkedin\.com$/,
  instagram: /(^|\.)instagram\.com$/,
  facebook: /(^|\.)(facebook\.com|fb\.com)$/,
  youtube: /(^|\.)(youtube\.com|youtu\.be)$/,
};
const PAGES: StripPage[] = ["home", "careers"];

export async function saveSocial(input: { links: Record<string, string>; strip: PhotoStrip }): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();

    const links: Record<string, string> = {};
    for (const [k, host] of Object.entries(HOSTS)) {
      let v = String(input.links?.[k] ?? "").trim().slice(0, 300);
      if (!v) continue;
      if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
      try {
        const u = new URL(v);
        if (!host.test(u.hostname)) return { ok: false, message: `That doesn't look like a ${k} link: ${v}` };
        links[k] = u.toString();
      } catch {
        return { ok: false, message: `Invalid ${k} link.` };
      }
    }

    const s = input.strip ?? {};
    const strip: PhotoStrip = {
      enabled: !!s.enabled,
      source: s.source === "projects" ? "projects" : "instagram",
      heading: String(s.heading ?? "").trim().slice(0, 60),
      pages: (s.pages ?? []).filter((p): p is StripPage => PAGES.includes(p)),
    };

    const { error } = await supabase.from("site_settings").update({ social_links: links, photo_strip: strip }).eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Saved." };
  });
}

export async function connectInstagram(token: string): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();
    const t = String(token ?? "").trim();
    if (t.length < 20 || t.length > 1000 || /\s/.test(t)) return { ok: false, message: "Paste the full access token (one long line)." };
    const check = await verifyInstagramToken(t);
    if (!check.ok) return { ok: false, message: check.message };
    const { error } = await supabase
      .from("admin_settings")
      .update({ instagram_token: t, instagram_token_updated_at: new Date().toISOString(), instagram_username: check.username })
      .eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, message: `Connected to @${check.username}.` };
  });
}

export async function disconnectInstagram(): Promise<ActionResult> {
  return run(async (): Promise<ActionResult> => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("admin_settings")
      .update({ instagram_token: null, instagram_token_updated_at: null, instagram_username: null })
      .eq("id", 1);
    if (error) throw error;
    refresh();
    return { ok: true, message: "Instagram disconnected." };
  });
}
