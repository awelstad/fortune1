import Image from "next/image";
import type { Capability } from "@/lib/types";
import { mediaUrl } from "@/lib/media";

export function Capabilities({
  heading,
  items,
  imagePath,
}: {
  heading: string;
  items: Capability[];
  imagePath: string | null;
}) {
  if (!items.length) return null;
  const src = mediaUrl(imagePath);
  return (
    <section id="capabilities" aria-labelledby="capabilities-heading" className="scroll-mt-20 bg-graphite py-20 text-white sm:py-28 lg:py-36">
      <div className="shell grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="label mb-5 flex items-center gap-3 text-fog" data-reveal>
              <span className="h-px w-8 bg-signal-bright" aria-hidden />
              What We Self-Perform
            </p>
            <h2 id="capabilities-heading" className="font-display text-[clamp(3rem,7vw,7rem)]" data-reveal>
              {heading}
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-fog" data-reveal>
              One team for power, lighting, fire alarm, low voltage and emergency systems — from preconstruction
              through commissioning.
            </p>
            {src && (
              <div className="grain relative mt-10 hidden aspect-[16/10] overflow-hidden lg:block" data-reveal="mask">
                <Image src={src} alt="Fortune electricians on an active commercial job site" fill sizes="40vw" className="object-cover" />
              </div>
            )}
          </div>
        </div>

        <ol className="border-t border-white/10 lg:col-span-7">
          {items.map((c, i) => (
            <li
              key={c.title}
              className="group grid grid-cols-[3rem_1fr] gap-4 border-b border-white/10 py-7 sm:grid-cols-[5rem_1fr] sm:py-9"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}
            >
              <span className="label pt-1.5 text-fog transition-colors group-hover:text-signal-bright">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display-wide text-lg leading-tight sm:text-2xl">{c.title}</h3>
                {c.body && <p className="mt-3 max-w-xl text-sm leading-relaxed text-fog sm:text-base">{c.body}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
