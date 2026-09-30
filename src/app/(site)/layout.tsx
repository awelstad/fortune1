import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RevealObserver } from "@/components/site/RevealObserver";
import { PageTracker } from "@/components/site/PageTracker";
import { JsonLd } from "@/components/site/JsonLd";
import { getLandingPages, getSite } from "@/lib/data";
import { localBusinessLd } from "@/lib/seo";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [site, services, markets, areas] = await Promise.all([
    getSite(),
    getLandingPages("service"),
    getLandingPages("market"),
    getLandingPages("area"),
  ]);

  return (
    <>
      <JsonLd data={localBusinessLd(site)} />
      <SiteHeader phone={site.phone} />
      <main id="main">{children}</main>
      <SiteFooter site={site} services={services} markets={markets} areas={areas} />
      <RevealObserver />
      <PageTracker />
    </>
  );
}
