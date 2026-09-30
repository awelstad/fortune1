/** Canonical origin for metadata, sitemap and structured data. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * Search engines may index the site only on the real domain in production.
 * The vercel.app address and preview deployments stay hidden so they never
 * compete with fortuneelectrical.com. Override with ALLOW_INDEXING=true/false.
 */
export const ALLOW_INDEXING =
  process.env.ALLOW_INDEXING === "true" ||
  (process.env.ALLOW_INDEXING !== "false" &&
    process.env.VERCEL_ENV === "production" &&
    /(^|\.)fortuneelectrical\.com$/.test(new URL(SITE_URL).hostname));
