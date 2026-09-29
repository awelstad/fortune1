import Image from "next/image";
import Link from "next/link";
import type { Category, SiteSettings } from "@/lib/types";

export function SiteFooter({ site, categories }: { site: SiteSettings; categories: Category[] }) {
  const tel = site.phone?.replace(/[^\d+]/g, "");
  const cityLine = [site.city, [site.state, site.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <footer className="bg-ink text-white">
      {site.affiliations.length > 0 && (
        <div className="border-b border-white/10">
          <div className="shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
            <p className="label text-fog">Certifications &amp; Affiliations</p>
            <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
              {site.affiliations.map((a) => (
                <li key={a.name} className="rounded-sm bg-white/95 px-3 py-2">
                  <Image
                    src={a.image}
                    alt={a.name}
                    width={160}
                    height={56}
                    className="h-9 w-auto object-contain grayscale transition hover:grayscale-0"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="shell grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Image
            src="/brand/fortune-logo-light.svg"
            alt={site.company_name}
            width={868}
            height={207}
            className="h-12 w-auto"
          />
          {site.tagline && <p className="mt-6 max-w-sm text-sm leading-relaxed text-fog">{site.tagline}</p>}
          {site.service_area && <p className="label mt-6 text-white/60">{site.service_area}</p>}
        </div>

        <div className="md:col-span-3">
          <h2 className="label text-fog">Projects</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li>
              <Link className="text-white/80 hover:text-white" href="/projects">
                All Projects
              </Link>
            </li>
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link className="text-white/80 hover:text-white" href={`/projects?category=${c.slug}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="label text-fog">Company</h2>
          <ul className="mt-5 space-y-2.5 text-sm">
            {[
              ["/team", "Our Team"],
              ["/careers", "Careers"],
              ["/#capabilities", "Capabilities"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link className="text-white/80 hover:text-white" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <address className="not-italic md:col-span-3">
          <h2 className="label text-fog">Contact</h2>
          <div className="mt-5 space-y-3 text-sm text-white/80">
            {site.phone && (
              <a href={`tel:${tel}`} className="numeral block text-3xl text-white hover:text-signal-bright">
                {site.phone}
              </a>
            )}
            {site.email && (
              <a href={`mailto:${site.email}`} className="block hover:text-white">
                {site.email}
              </a>
            )}
            {site.address_line1 && (
              <p>
                {site.address_line1}
                {site.address_line2 && (
                  <>
                    <br />
                    {site.address_line2}
                  </>
                )}
                <br />
                {cityLine}
              </p>
            )}
            {site.license_numbers && <p className="label text-white/50">{site.license_numbers}</p>}
          </div>
        </address>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legal_name || site.company_name}. All rights reserved.
          </p>
          <Link href="/admin" className="hover:text-white" prefetch={false}>
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
