import "server-only";
import { getProjects } from "./data";
import { isHiRes, mediaUrl } from "./media";
import { photoFirst } from "./rank";
import { createServiceClient } from "./supabase/service";
import type { PhotoStrip, StripPage, StripPhoto } from "./types";

const IG = "https://graph.instagram.com";
const MAX = 16;
const REFRESH_AFTER_MS = 7 * 24 * 3600 * 1000; // long-lived tokens last 60 days; renew weekly
/** Hosts Instagram serves media from — must match images.remotePatterns in next.config.ts. */
const IG_MEDIA_HOST = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/;

type IgMedia = {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
};

/** Checks a token against Instagram and returns the account's username. */
export async function verifyInstagramToken(token: string): Promise<{ ok: true; username: string } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${IG}/me?fields=user_id,username&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
    const json = (await res.json()) as { username?: string; error?: { message?: string } };
    if (!res.ok || !json.username) return { ok: false, message: json.error?.message ?? "Instagram rejected this token." };
    return { ok: true, username: json.username };
  } catch {
    return { ok: false, message: "Couldn't reach Instagram. Try again in a minute." };
  }
}

/**
 * Reads the stored token (admin-only table, via the service role) and renews it
 * when it's more than a week old, so it never reaches its 60-day expiry while
 * the site is being visited.
 */
async function instagramToken(): Promise<string | null> {
  const db = createServiceClient();
  if (!db) return null;
  const { data } = await db
    .from("admin_settings")
    .select("instagram_token, instagram_token_updated_at")
    .eq("id", 1)
    .maybeSingle();
  const token = data?.instagram_token as string | null | undefined;
  if (!token) return null;

  const updated = Date.parse(data?.instagram_token_updated_at ?? "");
  if (Number.isFinite(updated) && Date.now() - updated < REFRESH_AFTER_MS) return token;
  try {
    const res = await fetch(`${IG}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { access_token?: string };
    if (res.ok && json.access_token) {
      await db
        .from("admin_settings")
        .update({ instagram_token: json.access_token, instagram_token_updated_at: new Date().toISOString() })
        .eq("id", 1);
      return json.access_token;
    }
  } catch {
    // Keep using the current token; the next render tries again.
  }
  return token;
}

async function instagramPhotos(): Promise<StripPhoto[]> {
  const token = await instagramToken();
  if (!token) return [];
  try {
    const res = await fetch(
      `${IG}/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=30&access_token=${encodeURIComponent(token)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) {
      console.error(`[photo-strip] Instagram media request failed: ${res.status}`);
      return [];
    }
    const { data } = (await res.json()) as { data?: IgMedia[] };
    return (data ?? [])
      .map((m): StripPhoto | null => {
        const src = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
        if (!src) return null;
        try {
          if (!IG_MEDIA_HOST.test(new URL(src).hostname)) return null;
        } catch {
          return null;
        }
        const caption = m.caption?.split("\n")[0]?.trim().slice(0, 120);
        return { id: m.id, src, alt: caption || "Instagram post from Fortune Electrical", href: m.permalink, external: true };
      })
      .filter((p): p is StripPhoto => !!p)
      .slice(0, MAX);
  } catch (e) {
    console.error("[photo-strip] Instagram fetch error", e);
    return [];
  }
}

/** One sharp photo per published project, best-photographed first. */
async function projectPhotos(): Promise<StripPhoto[]> {
  const projects = photoFirst(await getProjects());
  return projects
    .filter((p) => isHiRes(p.hero, 600)) // small legacy images look soft even at tile size
    .slice(0, MAX)
    .map((p) => ({
      id: p.id,
      src: mediaUrl(p.hero!.storage_path)!,
      alt: p.hero!.alt || p.name,
      href: `/projects/${p.slug}`,
      external: false,
    }));
}

/** Photos for the strip, or [] when it's off for this page (or has nothing to show). */
export async function getStripPhotos(strip: PhotoStrip, page: StripPage | "preview"): Promise<StripPhoto[]> {
  if (page !== "preview" && (!strip.enabled || !(strip.pages ?? ["home"]).includes(page))) return [];
  return strip.source === "projects" ? projectPhotos() : instagramPhotos();
}
