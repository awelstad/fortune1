import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { SOCIAL_KEYS, SocialLinks } from "@/components/site/SocialLinks";
import { getSite } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/contact");
}

export default async function ContactPage() {
  const site = await getSite();
  const tel = site.phone?.replace(/[^\d+]/g, "");
  const cityLine = [site.city, [site.state, site.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const hours = site.local?.hours ?? [];

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
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${site.company_name}, ${site.address_line1}, ${cityLine}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label mt-4 inline-flex min-h-11 items-center gap-2 border-b border-ink/30 pb-1 hover:border-ink"
                >
                  Get directions ↗
                </a>
              </div>
            )}
            {hours.length > 0 && (
              <div>
                <h2 className="label border-b border-ink pb-3">Office hours</h2>
                <dl className="mt-4 space-y-1.5">
                  {hours.map((h) => (
                    <div key={h.days.join()} className="flex justify-between gap-6">
                      <dt>{dayRange(h.days)}</dt>
                      <dd className="text-mute">
                        {fmtTime(h.opens)} – {fmtTime(h.closes)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {SOCIAL_KEYS.some((k) => site.social_links?.[k]) && (
              <div>
                <h2 className="label border-b border-ink pb-3">Follow</h2>
                <SocialLinks links={site.social_links} className="-ml-3 mt-3 text-ink" />
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

function dayRange(days: string[]) {
  const short = days.map((d) => d.slice(0, 3));
  return short.length > 2 ? `${short[0]}–${short[short.length - 1]}` : short.join(", ");
}
