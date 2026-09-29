-- Optional YouTube link for the homepage hero background.
alter table public.homepage_settings
  add column hero_youtube_url text check (hero_youtube_url is null or char_length(hero_youtube_url) <= 300);
