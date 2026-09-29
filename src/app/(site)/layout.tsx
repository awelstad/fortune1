import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RevealObserver } from "@/components/site/RevealObserver";
import { JsonLd } from "@/components/site/JsonLd";
import { getCategories, getSite } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [site, categories] = await Promise.all([getSite(), getCategories()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Electrician",
          name: site.company_name,
          legalName: site.legal_name ?? undefined,
          url: SITE_URL,
          logo: `${SITE_URL}/brand/fortune-logo-dark.png`,
          image: `${SITE_URL}/brand/fortune-logo-dark.png`,
          telephone: site.phone ?? undefined,
          email: site.email ?? undefined,
          address: site.address_line1
            ? {
                "@type": "PostalAddress",
                streetAddress: site.address_line1,
                addressLocality: site.city ?? undefined,
                addressRegion: site.state ?? undefined,
                postalCode: site.postal_code ?? undefined,
                addressCountry: "US",
              }
            : undefined,
          areaServed: { "@type": "State", name: "Florida" },
          sameAs: Object.values(site.social_links ?? {}).filter(Boolean),
        }}
      />
      <SiteHeader phone={site.phone} />
      <main id="main">{children}</main>
      <SiteFooter site={site} categories={categories} />
      <RevealObserver />
    </>
  );
}
