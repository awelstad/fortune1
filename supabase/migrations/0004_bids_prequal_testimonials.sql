-- Bid invites, prequalification requests, resume/plan uploads, testimonials,
-- prequal + safety facts, and notification email.

-- ---------------------------------------------------------------------------
-- Inbox: more kinds, structured details, attachments
-- ---------------------------------------------------------------------------
alter table public.contact_submissions drop constraint if exists contact_submissions_kind_check;
alter table public.contact_submissions
  add constraint contact_submissions_kind_check check (kind in ('contact', 'application', 'bid', 'prequal'));

alter table public.contact_submissions
  add column details jsonb not null default '{}'::jsonb,
  add column attachments text[] not null default '{}'
    check (cardinality(attachments) <= 6);

-- ---------------------------------------------------------------------------
-- Private uploads bucket (resumes, bid documents).
-- Public may only WRITE into resumes/ or bids/; nobody but admins can read/list.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads', 'uploads', false, 52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip', 'application/x-zip-compressed',
    'image/jpeg', 'image/png'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "public drops uploads" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] in ('resumes', 'bids')
    and array_length(storage.foldername(name), 1) = 2
  );
create policy "admins read uploads" on storage.objects
  for select to authenticated using (bucket_id = 'uploads' and public.is_admin());
create policy "admins delete uploads" on storage.objects
  for delete to authenticated using (bucket_id = 'uploads' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------
create table public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  quote        text not null check (char_length(quote) between 1 and 600),
  author_name  text,
  author_title text,
  company      text,
  project_id   uuid references public.projects(id) on delete set null,
  sort_order   int not null default 0,
  is_active    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;
create policy "public read active testimonials" on public.testimonials
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "admins write testimonials" on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.testimonials (quote, author_name, author_title, company, sort_order, is_active) values
  ('PLACEHOLDER — replace with a real quote from a general contractor about working with Fortune.', 'Name', 'Title', 'General Contractor', 10, false),
  ('PLACEHOLDER — replace with a real quote from an owner or developer.', 'Name', 'Title', 'Owner / Developer', 20, false);

-- ---------------------------------------------------------------------------
-- Prequalification, safety and notification settings
-- ---------------------------------------------------------------------------
alter table public.site_settings
  add column notification_emails text default 'awelstad@gmail.com',
  add column prequal jsonb not null default '{}'::jsonb,   -- {years_in_business, bonding_capacity, insurance:[{label,value}], documents:[..], notes}
  add column safety jsonb not null default '{}'::jsonb;    -- {emr, trir, dart, lost_time_free_years, osha_note, program}

update public.site_settings set notification_emails = 'awelstad@gmail.com' where notification_emails is null;
