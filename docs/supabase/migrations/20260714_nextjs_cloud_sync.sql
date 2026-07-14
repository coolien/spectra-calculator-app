-- Next.js cloud sync for Spectra Calculator.
-- Safe to run more than once in project gmluepisjslxowncdxba.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, consent_type, consent_version),
  constraint user_consents_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create table if not exists public.app_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  app_id text not null,
  schema_version integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, app_id),
  constraint app_snapshots_app_id_format
    check (app_id ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  constraint app_snapshots_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint app_snapshots_payload_size
    check (octet_length(payload::text) <= 1048576)
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_user_consents_updated_at on public.user_consents;
create trigger set_user_consents_updated_at
before update on public.user_consents
for each row execute function public.set_updated_at();

drop trigger if exists set_app_snapshots_updated_at on public.app_snapshots;
create trigger set_app_snapshots_updated_at
before update on public.app_snapshots
for each row execute function public.set_updated_at();

alter table public.app_snapshots enable row level security;
alter table public.app_snapshots force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.user_consents enable row level security;
alter table public.user_consents force row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updateable by owner" on public.profiles;
drop policy if exists "Profiles are deletable by owner" on public.profiles;
drop policy if exists "Profiles are owned by user" on public.profiles;
create policy "Profiles are owned by user"
on public.profiles for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Consents are readable by owner" on public.user_consents;
drop policy if exists "Consents are insertable by owner" on public.user_consents;
drop policy if exists "Consents are updateable by owner" on public.user_consents;
drop policy if exists "Consents are deletable by owner" on public.user_consents;
drop policy if exists "Consents are owned by user" on public.user_consents;
create policy "Consents are owned by user"
on public.user_consents for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are readable by owner" on public.app_snapshots;
create policy "App snapshots are readable by owner"
on public.app_snapshots for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are insertable by owner" on public.app_snapshots;
create policy "App snapshots are insertable by owner"
on public.app_snapshots for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are updateable by owner" on public.app_snapshots;
create policy "App snapshots are updateable by owner"
on public.app_snapshots for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "App snapshots are deletable by owner" on public.app_snapshots;
create policy "App snapshots are deletable by owner"
on public.app_snapshots for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.app_snapshots from anon;
grant select, insert, update, delete on table public.app_snapshots to authenticated;
revoke all on table public.profiles from anon;
grant select, insert, update, delete on table public.profiles to authenticated;
revoke all on table public.user_consents from anon;
grant select, insert, update, delete on table public.user_consents to authenticated;

comment on table public.app_snapshots is
  'Versioned local-first app state. Each authenticated user owns one row per Spectra app.';
comment on column public.app_snapshots.payload is
  'Never store NRIC, payment card data, OTPs, passwords, or uploaded documents.';
