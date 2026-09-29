import Link from "next/link";
import { ArrowRight } from "@/components/site/Icons";

/** Oversized section heading with index count and an optional link. */
export function SectionHeading({
  eyebrow,
  title,
  count,
  intro,
  link,
  tone = "light",
  id,
}: {
  eyebrow?: string;
  title: string;
  count?: number;
  intro?: string | null;
  link?: { href: string; label: string };
  tone?: "light" | "dark";
  id?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className="grid gap-8 pb-10 sm:pb-14 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        {eyebrow && (
          <p className={`label mb-5 flex items-center gap-3 ${dark ? "text-fog" : "text-mute"}`} data-reveal>
            <span className={`h-px w-8 ${dark ? "bg-signal-bright" : "bg-signal"}`} aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="font-display text-[clamp(3rem,8vw,8.5rem)] text-balance" data-reveal>
          {title}
          {typeof count === "number" && count > 0 && (
            <sup className={`label ml-3 align-top text-sm tracking-normal ${dark ? "text-fog" : "text-mute"}`}>
              ({String(count).padStart(2, "0")})
            </sup>
          )}
        </h2>
      </div>
      {(intro || link) && (
        <div className="lg:col-span-4 lg:pb-3" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
          {intro && (
            <p className={`max-w-sm text-base leading-relaxed ${dark ? "text-fog" : "text-mute"}`}>{intro}</p>
          )}
          {link && (
            <Link
              href={link.href}
              className={`label group mt-5 inline-flex items-center gap-3 border-b pb-1.5 ${
                dark ? "border-white/30 text-white hover:border-white" : "border-ink/30 text-ink hover:border-ink"
              }`}
            >
              {link.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
