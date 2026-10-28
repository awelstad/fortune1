import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "./supabase/service";

/** One-way hash of the visitor's IP — the raw address is never stored. */
async function visitorKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const salt = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "fortune";
  return `${scope}:${createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 24)}`;
}

/**
 * True when this visitor is within every limit, e.g. [[600, 5], [86400, 20]] =
 * at most 5 per 10 minutes and 20 per day. Fails open if the database is
 * unreachable so a real inquiry is never lost to an outage.
 */
export async function withinRateLimit(scope: string, limits: [windowSeconds: number, max: number][]) {
  const db = createServiceClient();
  if (!db) return true;
  const key = await visitorKey(scope);
  try {
    const results = await Promise.all(
      limits.map(([w, max]) => db.rpc("rate_limit_hit", { p_key: `${key}:${w}`, p_window_seconds: w, p_max: max })),
    );
    return results.every((r) => r.error || r.data !== false);
  } catch {
    return true;
  }
}
