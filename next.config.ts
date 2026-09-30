import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "krbraesfqeftpfpnxwqz.supabase.co";

const nextConfig: NextConfig = {
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
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
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
