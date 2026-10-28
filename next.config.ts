import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "krbraesfqeftpfpnxwqz.supabase.co";

/**
 * Content Security Policy: the browser only loads scripts, frames and data from
 * the origins listed here, which blocks injected scripts, clickjacking and data
 * exfiltration. Pages are statically rendered for speed, so inline scripts are
 * allowed rather than nonce-based (nonces would force every page to render per request).
 */
const supabaseOrigin = `https://${supabaseHost}`;
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com${
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
  }`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin} https://i.ytimg.com`,
  "font-src 'self' data:",
  `media-src 'self' blob: ${supabaseOrigin}`,
  `connect-src 'self' ${supabaseOrigin} wss://${supabaseHost} https://challenges.cloudflare.com https://vitals.vercel-insights.com`,
  "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/media/**",
      },
      // Instagram post images for the optional photo strip (src/lib/photo-strip.ts).
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    minimumCacheTTL: 2678400, // 31 days — storage paths are immutable
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  // Old fortuneelectrical.com (WordPress) URLs → new pages, so existing links and
  // search results keep working once the domain points here.
  async redirects() {
    const project = (from: string, to: string) => ({ source: `/project/${from}`, destination: `/projects/${to}`, permanent: true });
    return [
      project("charlotte-county-airport-rescue-and-fire-fighter-training-simulator-facility", "charlotte-county-airport-arff-training-facility"),
      project("commercial-electrical-construction", "ida-baker-high-school"),
      project("5-5-kw-solar-photovoltaic-pv-installation", "solar-pv-installation-5-5-kw"),
      { source: "/project/:slug", destination: "/projects/:slug", permanent: true },
      { source: "/project", destination: "/projects", permanent: true },
      { source: "/about", destination: "/team", permanent: true },
      { source: "/team-new", destination: "/team", permanent: true },
      { source: "/commercial-electrical-construction", destination: "/services/commercial-electrical-construction", permanent: true },
      { source: "/multi-family-residential-electrical-construction", destination: "/services/multifamily-electrical", permanent: true },
      { source: "/specialty-projects-division", destination: "/services/tenant-improvements", permanent: true },
      { source: "/fire-alarm-construction-installation-retrofits", destination: "/", permanent: true },
      { source: "/fire-alarm-monitoring-service", destination: "/", permanent: true },
      { source: "/application-for-employment", destination: "/careers#apply", permanent: true },
      { source: "/for-employees", destination: "/careers", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/feed", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          // HTTPS only for 2 years. includeSubDomains/preload are deliberately left off until
          // IT confirms every fortuneelectrical.com subdomain serves HTTPS.
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
