import type { Metadata } from "next";
import Link from "next/link";
import { PrequalForm } from "@/components/site/PrequalForm";
import { ArrowRight } from "@/components/site/Icons";
import { getSite, getStatistics } from "@/lib/data";
import { DEFAULT_PREQUAL_DOCS, safetyFacts } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/prequalification");
}

export default async function PrequalPage() {
  const [site, stats] = await Promise.all([getSite(), getStatistics()]);
  const pq = site.prequal ?? {};
  const safety = safetyFacts(site.safety ?? {});
  const years = pq.years_in_business?.trim() || stats.find((s) => /year/i.test(s.label))?.display;

  // Only facts that have actually been filled in.
  const facts = [
    { label: "License number(s)", value: site.license_numbers },
    { label: "In business", value: years ? `${years} years` : null },
    { label: "Bonding — single project", value: pq.bonding_single },
    { label: "Bonding — aggregate", value: pq.bonding_aggregate },
    { label: "Surety", value: pq.surety },
    { label: "Service area", value: site.service_area },
    { label: "Headquarters", value: [site.city, site.state].filter(Boolean).join(", ") || null },
  ].filter((f): f is { label: string; value: string } => !!f.value?.trim());
  const insurance = (pq.insurance ?? []).filter((i) => i.label?.trim() && i.value?.trim());
  const documents = pq.documents?.length ? pq.documents : DEFAULT_PREQUAL_DOCS;

  return (
    <>
      <section className="blueprint bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              For General Contractors
            </p>
            <h1 className="font-display text-[clamp(3rem,8.5vw,8.5rem)]" data-reveal>
              Prequalification
            </h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-fog lg:col-span-4 lg:pb-4" data-reveal>
            Everything your team needs to add Fortune to the bid list — licensing, insurance, bonding and safety.
          </p>
        </div>

        {safety.length > 0 && (
          <div className="shell mt-14">
            <p className="label mb-4 text-fog">Safety record</p>
            <dl className={`grid grid-cols-2 border-l border-t border-white/10 ${safety.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {safety.map((s) => (
                <div key={s.key} className="flex flex-col-reverse border-b border-r border-white/10 p-5 sm:p-8">
                  <dt className="label mt-3 text-fog">{s.label}</dt>
                  <dd className="numeral text-5xl sm:text-6xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-5">
            {facts.length > 0 && (
              <div>
                <h2 className="label border-b border-ink pb-3">Company</h2>
                <dl>
                  {facts.map((f) => (
                    <div key={f.label} className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[11rem_1fr] sm:gap-4">
                      <dt className="label pt-0.5 text-mute">{f.label}</dt>
                      <dd className="text-base font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {insurance.length > 0 && (
              <div>
                <h2 className="label border-b border-ink pb-3">Insurance</h2>
                <dl>
                  {insurance.map((i) => (
                    <div key={i.label} className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[11rem_1fr] sm:gap-4">
                      <dt className="label pt-0.5 text-mute">{i.label}</dt>
                      <dd className="text-base font-medium">{i.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {site.safety?.program?.trim() && (
              <div>
                <h2 className="label border-b border-ink pb-3">Safety program</h2>
                <p className="mt-4 leading-relaxed text-ink/80">{site.safety.program}</p>
              </div>
            )}
            {pq.notes?.trim() && <p className="leading-relaxed text-mute">{pq.notes}</p>}
            <Link
              href="/bid"
              className="group flex items-center justify-between gap-4 border border-ink p-5 transition-colors hover:bg-ink hover:text-white"
            >
              <span>
                <span className="label block text-mute group-hover:text-white/60">Ready to go?</span>
                <span className="font-display mt-1 block text-2xl">Invite us to bid</span>
              </span>
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)]">Request our packet</h2>
            <p className="mb-10 mt-4 max-w-lg text-mute">Choose what you need and we&apos;ll send it to you directly.</p>
            <PrequalForm documents={documents} />
          </div>
        </div>
      </section>
    </>
  );
}
