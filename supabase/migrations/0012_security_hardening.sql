-- Security hardening (2026-10): two-step verification enforced in the database,
-- a tamper-proof admin activity log, and rate limiting for public forms.

-- ---------------------------------------------------------------------------
-- 1. Two-step verification (MFA) enforced by the database
-- ---------------------------------------------------------------------------
-- Membership only: is this signed-in user on the admin list? Used by the app to
-- decide whether to send someone to the two-step screen. Grants no data access.
create or replace function public.is_admin_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin_member() from public, anon;
grant execute on function public.is_admin_member() to authenticated;

-- Every admin policy uses is_admin(). It now also requires the session to have
-- passed two-step verification (aal2), so a stolen password alone can't read or
-- change anything — even by calling the database API directly.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid())
     and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;

-- ---------------------------------------------------------------------------
-- 2. Admin activity log (append-only)
-- ---------------------------------------------------------------------------
create table public.admin_audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  actor_email text,
  action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name  text not null,
  row_id      text,
  label       text,          -- human-readable name of the row (project name, title…)
  changed     text[]         -- columns that changed (UPDATE only); values aren't copied
);
create index admin_audit_log_at_idx on public.admin_audit_log (at desc);

alter table public.admin_audit_log enable row level security;
create policy "admins read activity log" on public.admin_audit_log
  for select to authenticated using (public.is_admin());
-- No insert/update/delete policies and no grants: only the trigger below can write,
-- and nobody — admins included — can edit or erase history through the API.
revoke insert, update, delete, truncate on public.admin_audit_log from anon, authenticated;

create or replace function public.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
  diff text[];
begin
  -- Only signed-in users' changes (admins). Public form posts and server
  -- maintenance scripts have no auth.uid() and aren't admin activity.
  if auth.uid() is null then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' then
    select array_agg(n.key order by n.key) into diff
    from jsonb_each(to_jsonb(new)) n
    join jsonb_each(to_jsonb(old)) o using (key)
    where n.value is distinct from o.value
      and n.key not in ('updated_at', 'public_project_value', 'public_contract_value');
    if diff is null then
      return new; -- nothing meaningful changed
    end if;
  end if;
  insert into public.admin_audit_log (actor_id, actor_email, action, table_name, row_id, label, changed)
  values (
    auth.uid(),
    auth.jwt() ->> 'email',
    tg_op,
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'path', rec ->> 'user_id'),
    left(coalesce(rec ->> 'name', rec ->> 'title', rec ->> 'label', rec ->> 'path', rec ->> 'slug', rec ->> 'email'), 160),
    diff
  );
  return coalesce(new, old);
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'admin_settings', 'admin_users', 'company_statistics', 'contact_submissions',
    'homepage_settings', 'job_openings', 'landing_pages', 'project_categories',
    'project_images', 'projects', 'seo_pages', 'site_settings', 'team_members', 'testimonials'
  ] loop
    execute format(
      'create trigger audit_admin_change after insert or update or delete on public.%I
         for each row execute function public.log_admin_change()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Rate limiting for public forms
-- ---------------------------------------------------------------------------
-- Keys are one-way hashes (never raw IP addresses). Only the server's service
-- role can call this; the public API can't see or use it.
create table public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  hits         int not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.rate_limit_hit(p_key text, p_window_seconds int, p_max int)
returns boolean   -- true = allowed, false = over the limit
language plpgsql
security definer
set search_path = public
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n int;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into n;
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;
  return n <= p_max;
end;
$$;
revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;
