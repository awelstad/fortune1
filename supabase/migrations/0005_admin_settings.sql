-- Notification recipients must not be readable through the public API, so they
-- move out of site_settings (public read) into an admin-only table. The server
-- reads them with the service-role key when sending alerts.

create table public.admin_settings (
  id                   int primary key default 1 check (id = 1),
  notification_emails  text not null default 'awelstad@gmail.com',
  updated_at           timestamptz not null default now()
);

create trigger admin_settings_updated_at
  before update on public.admin_settings
  for each row execute function public.set_updated_at();

alter table public.admin_settings enable row level security;
create policy "admins read admin settings" on public.admin_settings
  for select to authenticated using (public.is_admin());
create policy "admins update admin settings" on public.admin_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.admin_settings (id, notification_emails)
select 1, coalesce(notification_emails, 'awelstad@gmail.com') from public.site_settings where id = 1
on conflict (id) do nothing;
insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings drop column notification_emails;
