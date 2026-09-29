-- Team, careers (job openings + applications) and hero video.

-- ---------------------------------------------------------------------------
-- Team
-- ---------------------------------------------------------------------------
create table public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  title       text,
  group_name  text not null default 'Team',   -- e.g. Leadership, Project Management
  email       text,
  phone       text,
  photo_path  text,                           -- storage path in `media`
  bio         text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index team_members_order_idx on public.team_members (sort_order);

create trigger team_members_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

alter table public.team_members enable row level security;

create policy "public read active team" on public.team_members
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins write team" on public.team_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Job openings
-- ---------------------------------------------------------------------------
create table public.job_openings (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 120),
  department       text,
  location         text,
  employment_type  text,                      -- Full-time, Part-time, Apprenticeship…
  summary          text,
  description      text,
  sort_order       int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger job_openings_updated_at
  before update on public.job_openings
  for each row execute function public.set_updated_at();

alter table public.job_openings enable row level security;

create policy "public read active jobs" on public.job_openings
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins write jobs" on public.job_openings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Applications share the inquiries inbox
-- ---------------------------------------------------------------------------
alter table public.contact_submissions
  add column kind text not null default 'contact' check (kind in ('contact', 'application')),
  add column position text check (position is null or char_length(position) <= 120);

-- ---------------------------------------------------------------------------
-- Hero background video
-- ---------------------------------------------------------------------------
alter table public.homepage_settings add column hero_video_path text;

-- Allow video uploads (50 MB is the Supabase free-plan per-file maximum).
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
      'video/mp4', 'video/webm'
    ]
where id = 'media';
