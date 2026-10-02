-- Hero "Now Building" board: how many jobs it shows and, optionally, which ones.
--   auto   = the biggest current jobs (project value, then contract, then SF)
--   manual = now_building_ids, in that order (skipping any no longer current/published)
alter table public.homepage_settings
  add column now_building_count int not null default 5 check (now_building_count between 1 and 8),
  add column now_building_mode text not null default 'auto' check (now_building_mode in ('auto', 'manual')),
  add column now_building_ids uuid[] not null default '{}';
