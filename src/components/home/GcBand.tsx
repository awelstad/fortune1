import Link from "next/link";
import type { Testimonial } from "@/lib/types";
import { ArrowRight, ArrowUpRight } from "@/components/site/Icons";
import { Testimonials } from "./Testimonials";

/**
 * One compact band for general contractors: the two actions they take
 * (invite to bid, prequalify), plus proof — safety figures and a testimonial —
 * only when real ones have been entered.
 */
export function GcBand({
  testimonials,
  safety,
}: {
  testimonials: Testimonial[];
  safety: { key: string; value: string; label: string }[];
}) {
  const proof = testimonials.length > 0 || safety.length > 0;
  return (
    <section aria-labelledby="gc-heading" className="border-t border-rule bg-paper py-20 sm:py-28">
      <div className={`shell grid gap-14 ${proof ? "lg:grid-cols-12 lg:items-center" : ""}`}>
        <div className={proof ? "lg:col-span-5" : "max-w-3xl"}>
          <p className="label mb-5 flex items-center gap-3 text-mute" data-reveal>
            <span className="h-px w-8 bg-signal" aria-hidden />
            For General Contractors
          </p>
          <h2 id="gc-heading" className="font-display text-[clamp(2.75rem,6vw,5.5rem)] text-balance" data-reveal>
            Put us on your bid list.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-mute" data-reveal>
            Send the plans, get a complete number back. Our prequalification packet is ready when your team is.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-reveal>
            <Link
              href="/bid"
              className="label group inline-flex min-h-14 items-center justify-between gap-6 bg-ink px-6 py-5 text-white transition-colors hover:bg-signal"
            >
              Invite Us to Bid
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/prequalification"
              className="label inline-flex min-h-14 items-center justify-between gap-6 border border-ink/30 px-6 py-5 text-ink transition-colors hover:border-ink"
            >
              Prequalification
              <ArrowUpRight />
            </Link>
          </div>
        </div>

        {proof && (
          <div className="space-y-10 lg:col-span-6 lg:col-start-7">
            {safety.length > 0 && (
              <dl className="grid grid-cols-3 border-y border-ink" data-reveal>
                {safety.slice(0, 3).map((s, i) => (
                  <div key={s.key} className={`flex flex-col-reverse py-5 ${i > 0 ? "border-l border-rule pl-4 sm:pl-6" : ""}`}>
                    <dt className="label mt-2 leading-snug text-mute">{s.label}</dt>
                    <dd className="numeral text-4xl sm:text-5xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {testimonials.length > 0 && <Testimonials items={testimonials} />}
          </div>
        )}
      </div>
    </section>
  );
}
