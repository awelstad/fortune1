import { getLandingPages, getProjects, getSite } from "@/lib/data";
import { locationOf } from "@/lib/format";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600;

/**
 * /llms.txt — a plain-text summary for AI assistants and answer engines, so they
 * describe Fortune accurately. Built from live site data (no invented facts).
 */
export async function GET() {
  const [site, projects, services, areas, markets] = await Promise.all([
    getSite(),
    getProjects(),
    getLandingPages("service"),
    getLandingPages("area"),
    getLandingPages("market"),
  ]);
  const address = [site.address_line1, site.city, [site.state, site.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const notable = projects
    .filter((p) => p.hero && (p.project_value || p.square_feet || p.units))
    .slice(0, 12)
    .map((p) => `- [${p.name}](${SITE_URL}/projects/${p.slug}) — ${p.category?.name ?? "Project"}, ${locationOf(p)}${p.summary ? `. ${p.summary}` : ""}`);

  const body = `# ${site.company_name}

> ${site.company_name} is a commercial electrical contractor headquartered in ${site.city ?? "Fort Myers"}, Florida, serving Southwest Florida${site.local?.areas?.length ? ` (${site.local.areas.join(", ")})` : ""}. It builds electrical systems for airports, schools, courthouses, senior living, multifamily and commercial projects, working primarily for general contractors and construction managers.

- Address: ${address}
- Phone: ${site.phone ?? ""}${site.license_numbers ? `\n- License: ${site.license_numbers}` : ""}
- Website: ${SITE_URL}

## Services
${services.map((s) => `- [${s.name}](${SITE_URL}/services/${s.slug})${s.intro ? `: ${s.intro}` : ""}`).join("\n")}

## Markets
${markets.map((m) => `- [${m.name}](${SITE_URL}/markets/${m.slug})`).join("\n")}

## Service areas
${areas.map((a) => `- [${a.name}](${SITE_URL}/service-areas/${a.slug})`).join("\n")}

## Notable projects
${notable.join("\n")}

## For general contractors
- [Invite us to bid](${SITE_URL}/bid)
- [Prequalification](${SITE_URL}/prequalification)
- [All projects](${SITE_URL}/projects)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
