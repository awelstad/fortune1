import Link from "next/link";
import { ArrowUpRight } from "./Icons";

export function ClosingCta({
  heading,
  subheading,
  buttonLabel,
  buttonHref,
  phone,
}: {
  heading: string | null;
  subheading: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  phone: string | null;
}) {
  const tel = phone?.replace(/[^\d+]/g, "");
  return (
    <section aria-labelledby="cta-heading" className="blueprint relative overflow-hidden bg-navy-deep text-white">
      <div className="shell grid gap-12 py-24 sm:py-32 lg:grid-cols-12 lg:items-end lg:py-40">
        <div className="lg:col-span-8">
          <h2 id="cta-heading" className="font-display text-[clamp(3.25rem,9vw,9.5rem)] text-balance" data-reveal>
            {heading || "Have a big project coming up?"}
            <span className="block text-signal-bright">Let&apos;s talk.</span>
          </h2>
        </div>
        <div className="lg:col-span-4" data-reveal style={{ ["--reveal-delay" as string]: "150ms" }}>
          {subheading && <p className="max-w-sm text-lg leading-relaxed text-white/75">{subheading}</p>}
          <div className="mt-8 flex flex-col gap-4">
            <Link
              href={buttonHref || "/contact"}
              className="label group inline-flex items-center justify-between gap-6 bg-white px-6 py-5 text-ink transition-colors hover:bg-signal hover:text-white"
            >
              {buttonLabel || "Start a Conversation"}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/prequalification"
              className="label group inline-flex items-center justify-between gap-6 border border-white/30 px-6 py-5 text-white transition-colors hover:border-white hover:bg-white/5"
            >
              Request Prequalification
              <ArrowUpRight className="size-4" />
            </Link>
            {phone && (
              <a href={`tel:${tel}`} className="group flex items-baseline justify-between border-b border-white/25 pb-3 hover:border-white">
                <span className="label text-white/60">Call</span>
                <span className="numeral text-4xl">{phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
