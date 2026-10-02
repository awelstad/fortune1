import Image from "next/image";
import type { ProjectImage } from "@/lib/types";
import { isHiRes, mediaUrl } from "@/lib/media";

/**
 * Fills its (relatively positioned) parent with a project image.
 * Low-resolution images get a film-grain overlay so upscaling reads as texture
 * rather than blur. With no image, renders a designed "photography pending"
 * panel instead of an empty box.
 */
export function ProjectMedia({
  image,
  alt,
  sizes,
  priority = false,
  hiResWidth,
  zoom = true,
  className = "",
  placeholderText,
}: {
  image: ProjectImage | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  hiResWidth?: number;
  zoom?: boolean;
  className?: string;
  /** Large outlined word shown when there is no image (e.g. the industry). */
  placeholderText?: string | null;
}) {
  const src = mediaUrl(image?.storage_path);
  if (!src) return <PendingMedia text={placeholderText} className={className} />;
  const lowRes = !isHiRes(image, hiResWidth);
  return (
    <div className={`absolute inset-0 ${lowRes ? "grain" : ""} ${className}`}>
      <Image
        src={src}
        alt={image?.alt || alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={lowRes ? 85 : 75}
        className={`object-cover ${
          zoom ? "transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]" : ""
        } ${lowRes ? "saturate-[0.9] contrast-[1.05]" : ""}`}
      />
    </div>
  );
}

/** Architectural panel for projects without photography — never claims photos are coming. */
export function PendingMedia({
  text,
  className = "",
  hero = false,
}: {
  text?: string | null;
  className?: string;
  /** Behind page-hero text: watermark moves up-right and the caption is omitted. */
  hero?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-[radial-gradient(120%_90%_at_85%_10%,var(--color-navy)_0%,var(--color-navy-deep)_38%,var(--color-ink)_78%)] ${className}`}
      aria-hidden
    >
      <div className="blueprint absolute inset-0 opacity-70" />
      {/* drafting marks */}
      <div className="absolute left-[12%] top-0 h-full w-px bg-white/[0.07]" />
      <div className="absolute left-0 top-[62%] h-px w-full bg-white/[0.07]" />
      <div className="absolute left-[12%] top-[62%] size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-signal-bright/60" />
      {text && (
        <p
          className={`font-display absolute whitespace-nowrap leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.14)] ${
            hero
              ? "right-[-0.04em] top-24 text-[clamp(6rem,18vw,18rem)] sm:top-20"
              : "-bottom-[0.12em] left-[5%] right-0 text-[clamp(4rem,11vw,9rem)]"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}
