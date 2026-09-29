import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { getSite } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Fortune Electrical Construction about your next commercial electrical project in Florida.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const site = await getSite();
  const tel = site.phone?.replace(/[^\d+]/g, "");
  const cityLine = [site.city, [site.state, site.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <>
      <section className="blueprint bg-ink pb-16 pt-32 text-white sm:pb-24 sm:pt-44">
        <div className="shell">
          <p className="label mb-6 flex items-center gap-3 text-fog" data-reveal>
            <span className="h-px w-8 bg-signal-bright" aria-hidden />
            Contact
          </p>
          <h1 className="font-display max-w-[12ch] text-[clamp(3.5rem,11vw,11rem)]" data-reveal>
            Let&apos;s build it.
          </h1>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
            {site.phone && (
              <div>
                <h2 className="label border-b border-ink pb-3">Call</h2>
                <a href={`tel:${tel}`} className="numeral mt-4 block text-5xl hover:text-signal">
                  {site.phone}
                </a>
              </div>
            )}
            {site.email && (
              <div>
                <h2 className="label border-b border-ink pb-3">Email</h2>
                <a href={`mailto:${site.email}`} className="mt-4 block text-lg hover:text-signal">
                  {site.email}
                </a>
              </div>
            )}
            {site.address_line1 && (
              <div>
                <h2 className="label border-b border-ink pb-3">Office</h2>
                <address className="mt-4 text-lg not-italic leading-relaxed">
                  {site.address_line1}
                  <br />
                  {cityLine}
                </address>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
