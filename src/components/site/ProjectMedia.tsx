import Image from "next/image";
import type { ProjectImage } from "@/lib/types";
import { isHiRes, mediaUrl } from "@/lib/media";

/**
 * Fills its (relatively positioned) parent with a project image.
 * Low-resolution images get a film-grain overlay so upscaling reads as texture
 * rather than blur. With no image, renders a blueprint panel with the mark.
 */
export function ProjectMedia({
  image,
  alt,
  sizes,
  priority = false,
  hiResWidth,
  zoom = true,
  className = "",
}: {
  image: ProjectImage | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  hiResWidth?: number;
  zoom?: boolean;
  className?: string;
}) {
  const src = mediaUrl(image?.storage_path);
  if (!src) {
    return (
      <div className={`blueprint absolute inset-0 bg-graphite ${className}`} aria-hidden>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/brand/fortune-mark.png"
            alt=""
            width={96}
            height={96}
            className="opacity-15 grayscale"
          />
        </div>
      </div>
    );
  }
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
