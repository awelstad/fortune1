import { requireAdminPage } from "@/lib/admin/auth";
import { getStripPhotos } from "@/lib/photo-strip";
import { Card, PageHeader } from "@/components/admin/ui";
import { SocialEditor } from "@/components/admin/SocialEditor";
import { InstagramConnect } from "@/components/admin/InstagramConnect";
import { PhotoStrip } from "@/components/site/PhotoStrip";
import type { PhotoStrip as PhotoStripSettings } from "@/lib/types";

export const metadata = { title: "Social & Instagram" };

export default async function SocialAdmin() {
  const { supabase } = await requireAdminPage();
  const [{ data: site }, { data: admin }] = await Promise.all([
    supabase.from("site_settings").select("social_links, photo_strip").eq("id", 1).single(),
    supabase.from("admin_settings").select("instagram_token, instagram_username, instagram_token_updated_at").eq("id", 1).maybeSingle(),
  ]);
  const strip = (site?.photo_strip ?? {}) as PhotoStripSettings;
  const links = (site?.social_links ?? {}) as Record<string, string>;
  const connected = !!admin?.instagram_token;
  const preview = await getStripPhotos(strip, "preview");

  return (
    <>
      <PageHeader
        title="Social & Instagram"
        description="Social profile links (shown in the footer and on the contact page) and the optional scrolling photo bar."
      />
      <div className="space-y-6">
        <SocialEditor initialLinks={links} initialStrip={strip} instagramConnected={connected} />

        <InstagramConnect
          connected={connected}
          username={admin?.instagram_username ?? null}
          renewedAt={admin?.instagram_token_updated_at ?? null}
        />

        <Card
          title="Preview"
          description={
            strip.enabled
              ? "This is what visitors see right now."
              : "The bar is turned off — visitors don't see it. This preview shows what it would look like."
          }
        >
          {preview.length >= 4 ? (
            <div className="-m-5 overflow-hidden rounded-b-lg">
              <PhotoStrip
                photos={preview}
                heading={strip.heading}
                followHref={links.instagram}
                followLabel={links.instagram ? "Follow on Instagram" : undefined}
              />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              {strip.source === "projects"
                ? "Not enough project photos yet (needs at least 4)."
                : connected
                  ? "No Instagram posts came back yet (needs at least 4 photo posts). Posts refresh about once an hour."
                  : "Connect Instagram below, or switch the source to project photos, to see a preview."}
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
