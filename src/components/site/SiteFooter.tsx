import Image from "next/image";
import Link from "next/link";
import type { LandingPage, SiteSettings } from "@/lib/types";
import { SocialLinks } from "./SocialLinks";

export function SiteFooter({
  site,
  services,
  markets,
  areas,
}: {
  site: SiteSettings;
  services: LandingPage[];
  markets: LandingPage[];
  areas: LandingPage[];
}) {
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

      <div className="shell grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <Image
            src="/brand/fortune-logo-light.svg"
            alt={site.company_name}
            width={868}
            height={207}
            className="h-12 w-auto"
          />
          {site.tagline && <p className="mt-6 max-w-sm text-sm leading-relaxed text-fog">{site.tagline}</p>}
          <address className="mt-8 space-y-3 text-sm not-italic text-white/80">
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
            {site.license_numbers && <p className="label text-white/50">License {site.license_numbers}</p>}
          </address>
          <SocialLinks links={site.social_links ?? {}} className="-ml-3 mt-5 text-white" />
        </div>

        <FooterList title="Services" links={services.map((s) => [`/services/${s.slug}`, s.name])} className="md:col-span-2" />
        <FooterList title="Markets" links={markets.map((m) => [`/markets/${m.slug}`, m.name])} className="md:col-span-2" />
        <FooterList title="Service Areas" links={areas.map((a) => [`/service-areas/${a.slug}`, a.name])} className="md:col-span-2" />
        <FooterList
          title="Company"
          className="md:col-span-2"
          links={[
            ["/projects", "Projects"],
            ["/bid", "Invite Us to Bid"],
            ["/prequalification", "Prequalification"],
            ["/team", "Our Team"],
            ["/careers", "Careers"],
            ["/contact", "Contact"],
          ]}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legal_name || site.company_name}. All rights reserved.
          </p>
          <span className="flex gap-6">
            <Link href="/privacy" className="-my-3 py-3 hover:text-white">
              Privacy
            </Link>
            <Link href="/admin" className="-my-3 py-3 hover:text-white" prefetch={false}>
              Admin
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links, className = "" }: { title: string; links: string[][]; className?: string }) {
  if (!links.length) return null;
  return (
    <nav aria-label={title} className={className}>
      <h2 className="label text-fog">{title}</h2>
      <ul className="mt-4 text-sm sm:mt-5 sm:space-y-2.5">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link className="block py-2 text-white/80 hover:text-white sm:inline sm:py-0" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
