-- Fortune Electrical — core schema
-- Projects-first CMS: projects, images, categories, statuses, statistics,
-- homepage + site settings, admin users, contact submissions.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- security definer so RLS policies can call it without recursive RLS checks
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lookups
-- ---------------------------------------------------------------------------
create table public.project_statuses (
  key        text primary key,
  label      text not null,
  sort_order int  not null default 0
);

insert into public.project_statuses (key, label, sort_order) values
  ('current',   'Current',   1),
  ('upcoming',  'Upcoming',  2),
  ('completed', 'Completed', 3);

create table public.project_categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null,
  short_name    text,
  description   text,
  image_path    text,             -- storage path in the `media` bucket
  sort_order    int  not null default 0,
  is_active     boolean not null default true,
  show_on_home  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger project_categories_updated_at
  before update on public.project_categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create table public.projects (
  id                         uuid primary key default gen_random_uuid(),
  slug                       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                       text not null,
  status                     text not null default 'completed' references public.project_statuses(key),
  category_id                uuid references public.project_categories(id) on delete set null,

  city                       text,
  state                      text default 'FL',
  location_label             text,          -- optional override, e.g. "Southwest Florida"

  summary                    text,          -- one-liner for cards / meta description
  description                text,          -- 2–4 short paragraphs, blank-line separated
  scope                      text[] not null default '{}',  -- Fortune's scope of work

  project_value              numeric(14, 0),  -- total construction value
  electrical_contract_value  numeric(14, 0),  -- Fortune's contract value
  project_size               text,            -- free-form scale, e.g. "12 buildings · 580-space garage"
  square_feet                integer check (square_feet is null or square_feet > 0),
  stories                    integer check (stories is null or stories > 0),
  units                      integer check (units is null or units > 0),

  start_date                 date,
  completion_date            date,
  timeline_note              text,          -- e.g. "Phase 2 of 2"

  general_contractor         text,
  owner                      text,
  architect                  text,

  featured                   boolean not null default false,
  published                  boolean not null default false,
  archived_at                timestamptz,
  display_order              int not null default 1000,

  hero_image_id              uuid,          -- FK added after project_images exists
  seo_title                  text,
  seo_description            text,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index projects_status_idx   on public.projects (status);
create index projects_category_idx on public.projects (category_id);
create index projects_order_idx    on public.projects (display_order, name);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_images (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  storage_path  text not null unique,   -- path inside the `media` bucket
  width         int,
  height        int,
  alt           text,
  caption       text,
  sort_order    int not null default 0,
  source_url    text,                   -- provenance (e.g. migrated from old site)
  created_at    timestamptz not null default now()
);

create index project_images_project_idx on public.project_images (project_id, sort_order);

alter table public.projects
  add constraint projects_hero_image_fk
  foreign key (hero_image_id) references public.project_images(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Company statistics
-- ---------------------------------------------------------------------------
create table public.company_statistics (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  value        numeric(16, 2),          -- null = not yet provided
  prefix       text,
  suffix       text,
  -- 'manual' uses `value`. Others are computed live from published projects.
  auto_source  text not null default 'manual'
               check (auto_source in ('manual', 'project_count', 'square_feet', 'units', 'project_value', 'contract_value')),
  compact      boolean not null default false,  -- 2,100,000 -> 2.1M
  description  text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger company_statistics_updated_at
  before update on public.company_statistics
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Singletons: homepage + site settings
-- ---------------------------------------------------------------------------
create table public.homepage_settings (
  id                     int primary key default 1 check (id = 1),
  hero_eyebrow           text,
  hero_headline          text,
  hero_subheadline       text,
  hero_image_path        text,
  hero_primary_label     text default 'View Our Projects',
  hero_primary_href      text default '/projects',
  hero_secondary_label   text default 'Let''s Work Together',
  hero_secondary_href    text default '/contact',
  featured_project_id    uuid references public.projects(id) on delete set null,
  current_heading        text default 'Current Projects',
  current_intro          text,
  upcoming_heading       text default 'Upcoming Projects',
  upcoming_intro         text,
  portfolio_heading      text default 'Our Work',
  portfolio_intro        text,
  capabilities_heading   text default 'Capabilities',
  capabilities           jsonb not null default '[]'::jsonb,  -- [{title, body}]
  industries_heading     text default 'Industries',
  industries_intro       text,
  cta_heading            text,
  cta_subheading         text,
  cta_button_label       text default 'Start a Conversation',
  cta_button_href        text default '/contact',
  updated_at             timestamptz not null default now()
);

create trigger homepage_settings_updated_at
  before update on public.homepage_settings
  for each row execute function public.set_updated_at();

create table public.site_settings (
  id                 int primary key default 1 check (id = 1),
  company_name       text not null default 'Fortune Electrical Construction',
  legal_name         text,
  tagline            text,
  phone              text,
  email              text,
  address_line1      text,
  address_line2      text,
  city               text,
  state              text,
  postal_code        text,
  license_numbers    text,
  service_area       text,
  default_seo_title  text,
  default_seo_description text,
  social_links       jsonb not null default '{}'::jsonb,   -- {linkedin: url, ...}
  affiliations       jsonb not null default '[]'::jsonb,   -- [{name, image_path, href}]
  updated_at         timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Contact submissions
-- ---------------------------------------------------------------------------
create table public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 200),
  email         text not null check (char_length(email) between 3 and 320),
  company       text check (company is null or char_length(company) <= 200),
  phone         text check (phone is null or char_length(phone) <= 50),
  project_type  text check (project_type is null or char_length(project_type) <= 100),
  message       text not null check (char_length(message) between 1 and 5000),
  status        text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users         enable row level security;
alter table public.project_statuses    enable row level security;
alter table public.project_categories  enable row level security;
alter table public.projects            enable row level security;
alter table public.project_images      enable row level security;
alter table public.company_statistics  enable row level security;
alter table public.homepage_settings   enable row level security;
alter table public.site_settings       enable row level security;
alter table public.contact_submissions enable row level security;

-- admin_users: admins can see the list; only service role manages it
create policy "admins read admin list" on public.admin_users
  for select to authenticated using (public.is_admin());

-- statuses: public read
create policy "public read statuses" on public.project_statuses
  for select to anon, authenticated using (true);

-- categories
create policy "public read active categories" on public.project_categories
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins write categories" on public.project_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects
create policy "public read published projects" on public.projects
  for select to anon, authenticated
  using ((published and archived_at is null) or public.is_admin());
create policy "admins write projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- project images: visible when parent project is visible
create policy "public read images of published projects" on public.project_images
  for select to anon, authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and p.published and p.archived_at is null
    )
  );
create policy "admins write images" on public.project_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- statistics
create policy "public read active stats" on public.company_statistics
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins write stats" on public.company_statistics
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- settings singletons
create policy "public read homepage" on public.homepage_settings
  for select to anon, authenticated using (true);
create policy "admins update homepage" on public.homepage_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admins update site settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- contact: anyone may submit, only admins read/update/delete
create policy "anyone submits contact" on public.contact_submissions
  for insert to anon, authenticated with check (status = 'new');
create policy "admins read contact" on public.contact_submissions
  for select to authenticated using (public.is_admin());
create policy "admins update contact" on public.contact_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete contact" on public.contact_submissions
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: one public-read `media` bucket, admin-only writes, images only
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 20971520,  -- 20 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket: files are served by URL without a select policy.
-- Only admins may list objects.
create policy "admins list media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
