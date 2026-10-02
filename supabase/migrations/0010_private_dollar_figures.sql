-- Dollar figures are private unless a project opts in.
--
-- project_value / electrical_contract_value stay admin-only. The public reads
-- public_project_value / public_contract_value, which are null unless the
-- matching show_* box is ticked. Enforced with column privileges, so the values
-- can't be read through the public API either — not just hidden in the UI.
--
-- NOTE: when adding a column to projects that the public site needs, also add
-- it to the GRANT below.

alter table public.projects
  add column show_project_value boolean not null default false,
  add column show_contract_value boolean not null default false;

-- Keep today's behaviour for total project values the team already entered
-- (they can untick private jobs); contract values become private.
update public.projects set show_project_value = true where project_value is not null;

alter table public.projects
  add column public_project_value numeric(14, 0)
    generated always as (case when show_project_value then project_value end) stored,
  add column public_contract_value numeric(14, 0)
    generated always as (case when show_contract_value then electrical_contract_value end) stored;

-- Public (anon) reads: published rows only, and only the public columns.
-- Signed-in non-admins get nothing; admins keep full access via "admins write projects".
drop policy "public read published projects" on public.projects;
create policy "public read published projects" on public.projects
  for select to anon
  using (published and archived_at is null);

revoke select on public.projects from anon;
grant select (
  id, slug, name, status, category_id,
  city, state, location_label,
  summary, description, scope,
  project_size, square_feet, stories, units,
  start_date, completion_date, timeline_note,
  general_contractor, owner, architect,
  featured, published, archived_at, display_order,
  hero_image_id, seo_title, seo_description,
  created_at, updated_at,
  public_project_value, public_contract_value
) on public.projects to anon;
