import { createHash } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * First-party page-view beacon. Privacy-friendly: no cookies, and no IP address
 * is stored — only a one-way hash that rotates daily, so a visitor is counted
 * once per day without being identifiable or trackable across days.
 */
const BOT = /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http/i;

const clip = (s: unknown, n: number) => (typeof s === "string" && s.trim() ? s.trim().slice(0, n) : null);

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  if (req.headers.get("sec-purpose")?.includes("prefetch")) return new Response(null, { status: 204 });

  let body: { p?: string; r?: string; u?: Record<string, string>; nf?: boolean };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const path = clip(body.p, 300);
  if (!path || !path.startsWith("/") || /^\/(admin|auth|api)(\/|$)/.test(path)) return new Response(null, { status: 204 });

  let referrer: string | null = null;
  try {
    if (body.r) {
      const host = new URL(body.r).hostname.replace(/^www\./, "");
      if (host && host !== req.nextUrl.hostname.replace(/^www\./, "")) referrer = host.slice(0, 200);
    }
  } catch {
    /* ignore malformed referrers */
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "fortune";
  const visitor = createHash("sha256").update(`${day}|${ip}|${ua}|${salt}`).digest("hex").slice(0, 16);
  const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  const decode = (v: string | null) => {
    try {
      return v ? decodeURIComponent(v) : null;
    } catch {
      return v;
    }
  };

  const row = {
    path,
    referrer_host: referrer,
    utm_source: clip(body.u?.source, 100),
    utm_medium: clip(body.u?.medium, 100),
    utm_campaign: clip(body.u?.campaign, 100),
    country: clip(req.headers.get("x-vercel-ip-country"), 2),
    region: clip(req.headers.get("x-vercel-ip-country-region"), 10),
    city: clip(decode(req.headers.get("x-vercel-ip-city")), 100),
    device,
    visitor,
    is_404: !!body.nf,
  };

  after(async () => {
    const db = createServiceClient();
    if (!db) return;
    const { error } = await db.from("page_views").insert(row);
    if (error) console.error("[track]", error.message);
    // Keep roughly 13 months of history.
    if (Math.random() < 0.005) {
      await db.from("page_views").delete().lt("ts", new Date(Date.now() - 400 * 864e5).toISOString());
    }
  });
  return new Response(null, { status: 204 });
}
