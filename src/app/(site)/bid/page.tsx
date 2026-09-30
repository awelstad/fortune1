import type { Metadata } from "next";
import Link from "next/link";
import { BidForm } from "@/components/site/BidForm";
import { ArrowRight } from "@/components/site/Icons";
import { getCategories, getSite } from "@/lib/data";
import { pageMeta } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/bid");
}

const STEPS = [
  ["We confirm", "We confirm receipt and assign an estimator to your project."],
  ["We review", "Our preconstruction team reviews plans, scope and schedule — and flags RFIs early."],
  ["We bid", "A complete, clearly qualified electrical number before your deadline."],
];

export default async function BidPage() {
  const [site, categories] = await Promise.all([getSite(), getCategories()]);
  const tel = site.phone?.replace(/[^\d+]/g, "");
  const types = [...categories.map((c) => c.name), "Other"];

  return (
    <>
      <section className="blueprint bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label mb-6 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              For General Contractors
            </p>
            <h1 className="font-display text-[clamp(3.25rem,9vw,9rem)]" data-reveal>
              Invite us to bid.
            </h1>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-fog lg:col-span-4 lg:pb-4" data-reveal>
            Send the project and a link to the plans. We&apos;ll confirm and put a number together before your deadline.
          </p>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <div className="shell grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BidForm types={types} />
          </div>

          <aside className="space-y-12 lg:col-span-4 lg:col-start-9">
            <div>
              <h2 className="label border-b border-ink pb-3">What happens next</h2>
              <ol>
                {STEPS.map(([t, d], i) => (
                  <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-rule py-5">
                    <span className="label pt-1 text-signal">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-display-wide text-base">{t}</p>
                      <p className="mt-1 text-sm leading-relaxed text-mute">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {site.phone && (
              <div>
                <h2 className="label border-b border-ink pb-3">Bid due soon? Call</h2>
                <a href={`tel:${tel}`} className="numeral mt-4 block text-5xl hover:text-signal">
                  {site.phone}
                </a>
              </div>
            )}
            <Link
              href="/prequalification"
              className="group flex items-center justify-between gap-4 border border-ink p-5 transition-colors hover:bg-ink hover:text-white"
            >
              <span>
                <span className="label block text-mute group-hover:text-white/60">Need our paperwork?</span>
                <span className="font-display mt-1 block text-2xl">Prequalification</span>
              </span>
              <ArrowRight className="size-5" />
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
