import { getStripPhotos } from "@/lib/photo-strip";
import type { SiteSettings, StripPage } from "@/lib/types";
import { PhotoStrip } from "./PhotoStrip";

/** The photo strip as configured in admin → Social & Instagram (renders nothing while off). */
export async function SitePhotoStrip({ site, page }: { site: SiteSettings; page: StripPage }) {
  const strip = site.photo_strip ?? {};
  const photos = await getStripPhotos(strip, page);
  const instagram = site.social_links?.instagram;
  return (
    <PhotoStrip
      photos={photos}
      heading={strip.heading}
      followHref={instagram}
      followLabel={instagram ? "Follow on Instagram" : undefined}
    />
  );
}
