import Image from "next/image";
import Link from "next/link";
import type { StripPhoto } from "@/lib/types";

const MIN_PHOTOS = 4;
/** Enough tiles that one loop is wider than a large desktop screen. */
const FILL = 14;

/**
 * A thin, slowly scrolling bar of photos (Instagram posts or project photos).
 * Pure CSS: pauses on hover/focus, and becomes a swipeable row for visitors
 * who prefer reduced motion. Renders nothing with too few photos.
 */
export function PhotoStrip({
  photos,
  heading,
  followHref,
  followLabel,
}: {
  photos: StripPhoto[];
  heading?: string;
  followHref?: string;
  followLabel?: string;
}) {
  if (photos.length < MIN_PHOTOS) return null;

  // Repeat the set until it's wide enough, then double it so translateX(-50%) loops seamlessly.
  const base: StripPhoto[] = [];
  while (base.length < Math.max(FILL, photos.length)) base.push(photos[base.length % photos.length]);
  const track = [...base, ...base];

  return (
    <section aria-label={heading || "Photos"} className="overflow-hidden bg-ink py-8 text-white sm:py-10">
      {(heading || followHref) && (
        <div className="shell mb-5 flex items-baseline justify-between gap-4">
          {heading && <h2 className="label text-fog">{heading}</h2>}
          {followHref && (
            <a
              href={followHref}
              target="_blank"
              rel="noopener noreferrer"
              className="label -my-3 shrink-0 py-3 text-white transition-colors hover:text-signal-bright"
            >
              {followLabel ?? "Follow us"} <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      )}
      <div className="photo-strip group">
        <ul
          className="photo-strip-track flex w-max group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
          style={{ ["--strip-duration" as string]: `${base.length * 4}s` }}
        >
          {track.map((p, i) => {
            const copy = i >= photos.length;
            const img = (
              <Image
                src={p.src}
                alt={copy ? "" : p.alt}
                width={400}
                height={400}
                sizes="(min-width: 1024px) 208px, (min-width: 640px) 168px, 128px"
                quality={60}
                className="size-32 object-cover transition-opacity duration-300 group-hover:opacity-70 hover:opacity-100! sm:size-42 lg:size-52"
              />
            );
            return (
              <li key={`${p.id}-${i}`} className="shrink-0 pr-2" aria-hidden={copy || undefined} data-copy={copy || undefined}>
                {p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined} className="block">
                    {img}
                  </a>
                ) : (
                  <Link href={p.href} tabIndex={copy ? -1 : undefined} className="block">
                    {img}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
