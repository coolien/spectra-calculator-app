-- Spectra Calculator Row Level Security policies
-- Run after docs/supabase/schema.sql.

alter table public.profiles enable row level security;
alter table public.user_consents enable row level security;
alter table public.finance_profiles enable row level security;
alter table public.saved_scenarios enable row level security;
alter table public.ongoing_loans enable row level security;
alter table public.app_settings enable row level security;
alter table public.sync_events enable row level security;
alter table public.app_snapshots enable row level security;
alter table public.app_snapshots force row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Profiles are updateable by owner" on public.profiles;
create policy "Profiles are updateable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles are deletable by owner" on public.profiles;
create policy "Profiles are deletable by owner"
on public.profiles for delete
using (auth.uid() = id);

drop policy if exists "Consents are readable by owner" on public.user_consents;
create policy "Consents are readable by owner"
on public.user_consents for select
using (auth.uid() = user_id);

drop policy if exists "Consents are insertable by owner" on public.user_consents;
create policy "Consents are insertable by owner"
on public.user_consents for insert
with check (auth.uid() = user_id);

drop policy if exists "Consents are updateable by owner" on public.user_consents;
create policy "Consents are updateable by owner"
on public.user_consents for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Consents are deletable by owner" on public.user_consents;
create policy "Consents are deletable by owner"
on public.user_consents for delete
using (auth.uid() = user_id);

drop policy if exists "Finance profiles are readable by owner" on public.finance_profiles;
create policy "Finance profiles are readable by owner"
on public.finance_profiles for select
using (auth.uid() = user_id);

drop policy if exists "Finance profiles are insertable by owner" on public.finance_profiles;
create policy "Finance profiles are insertable by owner"
on public.finance_profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Finance profiles are updateable by owner" on public.finance_profiles;
create policy "Finance profiles are updateable by owner"
on public.finance_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Finance profiles are deletable by owner" on public.finance_profiles;
create policy "Finance profiles are deletable by owner"
on public.finance_profiles for delete
using (auth.uid() = user_id);

drop policy if exists "Saved scenarios are readable by owner" on public.saved_scenarios;
create policy "Saved scenarios are readable by owner"
on public.saved_scenarios for select
using (auth.uid() = user_id);

drop policy if exists "Saved scenarios are insertable by owner" on public.saved_scenarios;
create policy "Saved scenarios are insertable by owner"
on public.saved_scenarios for insert
with check (auth.uid() = user_id);

drop policy if exists "Saved scenarios are updateable by owner" on public.saved_scenarios;
create policy "Saved scenarios are updateable by owner"
on public.saved_scenarios for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Saved scenarios are deletable by owner" on public.saved_scenarios;
create policy "Saved scenarios are deletable by owner"
on public.saved_scenarios for delete
using (auth.uid() = user_id);

drop policy if exists "Ongoing loans are readable by owner" on public.ongoing_loans;
create policy "Ongoing loans are readable by owner"
on public.ongoing_loans for select
using (auth.uid() = user_id);

drop policy if exists "Ongoing loans are insertable by owner" on public.ongoing_loans;
create policy "Ongoing loans are insertable by owner"
on public.ongoing_loans for insert
with check (auth.uid() = user_id);

drop policy if exists "Ongoing loans are updateable by owner" on public.ongoing_loans;
create policy "Ongoing loans are updateable by owner"
on public.ongoing_loans for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Ongoing loans are deletable by owner" on public.ongoing_loans;
create policy "Ongoing loans are deletable by owner"
on public.ongoing_loans for delete
using (auth.uid() = user_id);

drop policy if exists "App settings are readable by owner" on public.app_settings;
create policy "App settings are readable by owner"
on public.app_settings for select
using (auth.uid() = user_id);

drop policy if exists "App settings are insertable by owner" on public.app_settings;
create policy "App settings are insertable by owner"
on public.app_settings for insert
with check (auth.uid() = user_id);

drop policy if exists "App settings are updateable by owner" on public.app_settings;
create policy "App settings are updateable by owner"
on public.app_settings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "App settings are deletable by owner" on public.app_settings;
create policy "App settings are deletable by owner"
on public.app_settings for delete
using (auth.uid() = user_id);

drop policy if exists "Sync events are readable by owner" on public.sync_events;
create policy "Sync events are readable by owner"
on public.sync_events for select
using (auth.uid() = user_id);

drop policy if exists "Sync events are insertable by owner" on public.sync_events;
create policy "Sync events are insertable by owner"
on public.sync_events for insert
with check (auth.uid() = user_id);

drop policy if exists "Sync events are deletable by owner" on public.sync_events;
create policy "Sync events are deletable by owner"
on public.sync_events for delete
using (auth.uid() = user_id);

drop policy if exists "App snapshots are readable by owner" on public.app_snapshots;
create policy "App snapshots are readable by owner"
on public.app_snapshots for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are insertable by owner" on public.app_snapshots;
create policy "App snapshots are insertable by owner"
on public.app_snapshots for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are updateable by owner" on public.app_snapshots;
create policy "App snapshots are updateable by owner"
on public.app_snapshots for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are deletable by owner" on public.app_snapshots;
create policy "App snapshots are deletable by owner"
on public.app_snapshots for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.app_snapshots from anon;
grant select, insert, update, delete on table public.app_snapshots to authenticated;
