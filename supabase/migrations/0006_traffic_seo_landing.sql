-- First-party traffic analytics, SEO settings, and SEO landing pages.

-- ---------------------------------------------------------------------------
-- Page views (privacy-friendly: no cookies, no IP stored — only a daily-rotating
-- one-way hash so a visitor can be counted once per day)
-- ---------------------------------------------------------------------------
create table public.page_views (
  id             bigint generated always as identity primary key,
  ts             timestamptz not null default now(),
  path           text not null check (char_length(path) <= 300),
  referrer_host  text check (referrer_host is null or char_length(referrer_host) <= 200),
  utm_source     text check (utm_source is null or char_length(utm_source) <= 100),
  utm_medium     text check (utm_medium is null or char_length(utm_medium) <= 100),
  utm_campaign   text check (utm_campaign is null or char_length(utm_campaign) <= 100),
  country        text check (country is null or char_length(country) <= 2),
  region         text check (region is null or char_length(region) <= 10),
  city           text check (city is null or char_length(city) <= 100),
  device         text check (device in ('mobile', 'tablet', 'desktop')),
  visitor        text not null check (char_length(visitor) <= 32),
  is_404         boolean not null default false
);

create index page_views_ts_idx on public.page_views (ts desc);
create index page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;
-- Written only by the server (service role). Admins can read.
create policy "admins read page views" on public.page_views
  for select to authenticated using (public.is_admin());

-- Aggregated traffic report for the admin dashboard. Runs as the caller, so RLS
-- limits it to admins.
create or replace function public.admin_traffic(p_days int default 30)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with v as (
    select * from public.page_views
    where ts >= now() - make_interval(days => greatest(1, least(p_days, 400)))
  ),
  ok as (select * from v where not is_404),
  prev as (
    select count(*) as views, count(distinct (visitor, ts::date)) as visitors
    from public.page_views
    where not is_404
      and ts >= now() - make_interval(days => 2 * greatest(1, least(p_days, 400)))
      and ts <  now() - make_interval(days => greatest(1, least(p_days, 400)))
  ),
  subs as (
    select kind, count(*) as n from public.contact_submissions
    where created_at >= now() - make_interval(days => greatest(1, least(p_days, 400)))
    group by kind
  )
  select jsonb_build_object(
    'views', (select count(*) from ok),
    'visitors', (select count(distinct (visitor, ts::date)) from ok),
    'prev_views', (select views from prev),
    'prev_visitors', (select visitors from prev),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'views', views, 'visitors', visitors) order by d)
      from (
        select (ts at time zone 'America/New_York')::date as d, count(*) as views, count(distinct visitor) as visitors
        from ok group by 1
      ) x), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', n, 'visitors', u) order by n desc)
      from (select path, count(*) n, count(distinct visitor) u from ok group by path order by 2 desc limit 15) x), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('source', src, 'visitors', n) order by n desc)
      from (
        select coalesce(nullif(utm_source, ''), referrer_host, 'Direct / none') as src, count(distinct (visitor, ts::date)) n
        from ok group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'cities', coalesce((
      select jsonb_agg(jsonb_build_object('city', c, 'visitors', n) order by n desc)
      from (
        select concat_ws(', ', city, region) as c, count(distinct (visitor, ts::date)) n
        from ok where city is not null group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(device, n)
      from (select device, count(distinct (visitor, ts::date)) n from ok group by device) x), '{}'::jsonb),
    'not_found', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'hits', n) order by n desc)
      from (select path, count(*) n from v where is_404 group by path order by 2 desc limit 10) x), '[]'::jsonb),
    'submissions', coalesce((select jsonb_object_agg(kind, n) from subs), '{}'::jsonb)
  );
$$;

-- ---------------------------------------------------------------------------
-- Per-page SEO overrides (for static pages; projects & landing pages have their own fields)
-- ---------------------------------------------------------------------------
create table public.seo_pages (
  path          text primary key check (path ~ '^/[a-z0-9/\-]*$'),
  title         text check (title is null or char_length(title) <= 120),
  description   text check (description is null or char_length(description) <= 320),
  noindex       boolean not null default false,
  updated_at    timestamptz not null default now()
);
create trigger seo_pages_updated_at before update on public.seo_pages
  for each row execute function public.set_updated_at();
alter table public.seo_pages enable row level security;
create policy "public read seo pages" on public.seo_pages for select to anon, authenticated using (true);
create policy "admins write seo pages" on public.seo_pages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Local business facts used for structured data
alter table public.site_settings add column local jsonb not null default '{}'::jsonb;
update public.site_settings set local = jsonb_build_object(
  'hours', jsonb_build_array(
    jsonb_build_object('days', jsonb_build_array('Monday','Tuesday','Wednesday','Thursday'), 'opens', '06:30', 'closes', '16:30'),
    jsonb_build_object('days', jsonb_build_array('Friday'), 'opens', '06:30', 'closes', '11:30')
  ),
  'hours_source', 'Public business listing (matches Google), Sept 2026',
  'areas', jsonb_build_array('Lee County', 'Collier County', 'Charlotte County', 'Sarasota County'),
  'geo', jsonb_build_object('lat', 26.6262841, 'lng', -81.836034),
  'gbp_url', '',
  'linkedin_url', 'https://www.linkedin.com/company/fortune-electrical-construction',
  'verification', jsonb_build_object('google', '', 'bing', '')
) where id = 1;

-- ---------------------------------------------------------------------------
-- SEO landing pages: services, markets, service areas
-- ---------------------------------------------------------------------------
create table public.landing_pages (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null check (kind in ('service', 'market', 'area')),
  slug            text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name            text not null check (char_length(name) <= 120),   -- nav / card label
  headline        text check (headline is null or char_length(headline) <= 160),
  seo_title       text check (seo_title is null or char_length(seo_title) <= 120),
  seo_description text check (seo_description is null or char_length(seo_description) <= 320),
  intro           text,
  body            text,
  faqs            jsonb not null default '[]'::jsonb,   -- [{q, a}]
  match           jsonb not null default '{}'::jsonb,   -- {categories:[slug], scope:[keyword], cities:[name]}
  sort_order      int not null default 0,
  published       boolean not null default true,
  updated_at      timestamptz not null default now(),
  unique (kind, slug)
);
create trigger landing_pages_updated_at before update on public.landing_pages
  for each row execute function public.set_updated_at();
alter table public.landing_pages enable row level security;
create policy "public read published landing pages" on public.landing_pages
  for select to anon, authenticated using (published or public.is_admin());
create policy "admins write landing pages" on public.landing_pages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
