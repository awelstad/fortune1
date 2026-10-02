-- Upcoming (future) projects can be hidden from the public site as a group.
-- Off by default: they stay in the admin but don't appear anywhere public.
alter table public.homepage_settings
  add column show_upcoming boolean not null default false;
