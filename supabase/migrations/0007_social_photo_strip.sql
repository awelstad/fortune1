-- Social links in one place + an optional Instagram / project photo strip.

-- Photo strip display settings (public read, like the rest of site_settings).
-- Off by default; the admin turns it on from Social & Instagram.
alter table public.site_settings
  add column photo_strip jsonb not null default
    '{"enabled": false, "source": "instagram", "heading": "On the job", "pages": ["home"]}'::jsonb;

-- The Instagram access token is a secret, so it lives in the admin-only table.
-- The server reads it with the service-role key to fetch posts.
alter table public.admin_settings
  add column instagram_token text check (instagram_token is null or char_length(instagram_token) <= 1000),
  add column instagram_token_updated_at timestamptz,
  add column instagram_username text check (instagram_username is null or char_length(instagram_username) <= 100);

-- LinkedIn was stored twice (site_settings.social_links and local.linkedin_url).
-- Keep social_links as the single source.
update public.site_settings
  set social_links = social_links || jsonb_build_object('linkedin', local->>'linkedin_url')
  where coalesce(local->>'linkedin_url', '') <> ''
    and coalesce(social_links->>'linkedin', '') = '';
update public.site_settings set local = local - 'linkedin_url';
