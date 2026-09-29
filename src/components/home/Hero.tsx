import Image from "next/image";
import Link from "next/link";
import type { HomepageSettings, ProjectWithMedia } from "@/lib/types";
import { cardMetrics, locationOf } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { ArrowRight, ArrowUpRight } from "@/components/site/Icons";

export function Hero({
  home,
  nowBuilding,
  projectCount,
  locationLine,
}: {
  home: HomepageSettings;
  nowBuilding: ProjectWithMedia | null;
  projectCount: number;
  locationLine: string;
}) {
  const src = mediaUrl(home.hero_image_path);
  const metric = nowBuilding ? cardMetrics(nowBuilding, 1)[0] : null;

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
        {home.hero_eyebrow && (
          <p className="label mb-6 flex items-center gap-3 text-white/75 sm:mb-8" data-reveal>
            <span className="h-px w-10 bg-signal-bright" aria-hidden />
            {home.hero_eyebrow}
          </p>
        )}
        <h1
          className="font-display max-w-[13ch] text-[clamp(3.25rem,10.5vw,10.5rem)] text-balance"
          data-reveal
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          {home.hero_headline}
        </h1>

        <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7" data-reveal style={{ ["--reveal-delay" as string]: "180ms" }}>
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

          {nowBuilding && (
            <Link
              href={`/projects/${nowBuilding.slug}`}
              className="group block border border-white/15 bg-ink/55 p-5 backdrop-blur-md transition-colors hover:border-white/40 lg:col-span-4 lg:col-start-9"
              data-reveal
              style={{ ["--reveal-delay" as string]: "300ms" }}
            >
              <p className="label flex items-center gap-2 text-live">
                <span className="size-1.5 animate-pulse-live rounded-full bg-live" aria-hidden />
                Now Building
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-2xl sm:text-3xl">{nowBuilding.name}</p>
                  <p className="label mt-2 text-white/60">{locationOf(nowBuilding)}</p>
                </div>
                {metric && metric.key !== "size" && (
                  <p className="numeral shrink-0 text-4xl">
                    {metric.value}
                    {metric.unit && <span className="ml-1 text-sm">{metric.unit}</span>}
                  </p>
                )}
              </div>
            </Link>
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
