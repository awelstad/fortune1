-- Toggles for the hero Now Building totals line.
alter table public.homepage_settings
  add column now_building_value_total boolean not null default false,
  add column now_building_sf_total boolean not null default true;

-- Dollar figures hidden publicly for now (2026-10-02); each project keeps its
-- "Show on website" checkbox for later.
update public.projects set show_project_value = false, show_contract_value = false;
