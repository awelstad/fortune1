import Image from "next/image";
import Link from "next/link";
import type { HomepageSettings, ProjectWithMedia } from "@/lib/types";
import { locationOf, money, squareFeet } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { ArrowRight, ArrowUpRight } from "@/components/site/Icons";

export function Hero({
  home,
  nowBuilding,
  projectCount,
  locationLine,
}: {
  home: HomepageSettings;
  nowBuilding: ProjectWithMedia[];
  projectCount: number;
  locationLine: string;
}) {
  const src = mediaUrl(home.hero_image_path);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white">
      {src && (
        <div className="absolute inset-0 -z-20">
          <Image
            src={src}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={75}
            className="animate-ken-burns object-cover"
          />
        </div>
      )}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(7_9_13/0.92)_0%,rgb(7_9_13/0.7)_45%,rgb(7_9_13/0.25)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-ink via-ink/60 to-transparent" aria-hidden />

      <div className="shell flex flex-1 flex-col justify-end pb-10 pt-32 sm:pb-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            {home.hero_eyebrow && (
              <p className="label mb-6 flex items-center gap-3 text-white/75 sm:mb-8" data-reveal>
                <span className="h-px w-10 bg-signal-bright" aria-hidden />
                {home.hero_eyebrow}
              </p>
            )}
            <h1
              className="font-display max-w-[13ch] text-[clamp(3.25rem,9.4vw,9.5rem)] text-balance"
              data-reveal
              style={{ ["--reveal-delay" as string]: "80ms" }}
            >
              {home.hero_headline}
            </h1>

          <div className="mt-8 lg:mt-10" data-reveal style={{ ["--reveal-delay" as string]: "180ms" }}>
            {home.hero_subheadline && (
              <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{home.hero_subheadline}</p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={home.hero_primary_href || "/projects"}
                className="label group inline-flex items-center justify-between gap-6 bg-white px-6 py-5 text-ink transition-colors hover:bg-signal hover:text-white sm:justify-start"
              >
                {home.hero_primary_label}
                {projectCount > 0 && <span className="text-mute group-hover:text-white/70">({projectCount})</span>}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={home.hero_secondary_href || "/contact"}
                className="label inline-flex items-center justify-between gap-6 border border-white/35 px-6 py-5 text-white transition-colors hover:border-white hover:bg-white/10 sm:justify-start"
              >
                {home.hero_secondary_label}
                <ArrowUpRight />
              </Link>
            </div>
          </div>
          </div>

          {nowBuilding.length > 0 && (
            <div
              className="border border-white/15 bg-ink/60 backdrop-blur-md lg:col-span-5"
              data-reveal
              style={{ ["--reveal-delay" as string]: "300ms" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <p className="label flex items-center gap-2 text-live">
                  <span className="size-1.5 animate-pulse-live rounded-full bg-live" aria-hidden />
                  Now Building
                </p>
                <Link href="/projects?status=current" className="label text-white/50 transition-colors hover:text-white">
                  All current →
                </Link>
              </div>
              <ul>
                {nowBuilding.map((p) => {
                  const value = p.project_value ?? p.electrical_contract_value;
                  return (
                    <li key={p.id} className="border-b border-white/10 last:border-0">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="group grid gap-3 px-5 py-3.5 transition-colors hover:bg-white/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                      >
                        <span className="min-w-0">
                          <span className="font-display line-clamp-2 block text-lg text-balance transition-colors group-hover:text-signal-bright sm:text-xl">
                            {p.name}
                          </span>
                          <span className="label mt-1.5 block text-white/50">{locationOf(p)}</span>
                        </span>
                        <span className="grid grid-cols-[6rem_8rem] gap-3 sm:grid-cols-[5.5rem_7.5rem] sm:text-right">
                          <HeroFigure
                            value={value ? money(value) : null}
                            label={p.project_value ? "Value" : p.electrical_contract_value ? "Contract" : "Value"}
                          />
                          <HeroFigure value={p.square_feet ? squareFeet(p.square_feet) : null} unit="SF" label="Sq Ft" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="shell flex items-center justify-between border-t border-white/10 py-4">
        <p className="label text-white/50">{locationLine}</p>
        <div className="flex items-center gap-3" aria-hidden>
          <span className="label text-white/50">Scroll</span>
          <span className="relative h-8 w-px overflow-hidden bg-white/15">
            <span className="absolute inset-0 animate-scroll-cue bg-white" />
          </span>
        </div>
      </div>
    </section>
  );
}

/** A compact figure for the Now Building board; "—" until a real value is entered. */
function HeroFigure({ value, unit, label }: { value: string | null; unit?: string; label: string }) {
  return (
    <span className="min-w-0">
      <span className={`numeral block text-2xl sm:text-3xl ${value ? "text-white" : "text-white/30"}`}>
        {value ?? "—"}
        {value && unit && <span className="ml-0.5 text-[0.45em] tracking-normal">{unit}</span>}
      </span>
      <span className="label mt-1 block text-[0.6rem] text-white/45">{label}</span>
    </span>
  );
}
