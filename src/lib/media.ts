const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media`;

/** Public URL for an object in the `media` bucket. Absolute URLs and /public paths pass through. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${base}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Below this width an image is treated as low resolution for large, full-bleed slots. */
export const HI_RES_WIDTH = 900;

export function isHiRes(img: { width: number | null } | null | undefined, min = HI_RES_WIDTH) {
  return !!img?.width && img.width >= min;
}
