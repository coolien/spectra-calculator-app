-- Spectra Calculator Supabase schema
-- Run this in Supabase SQL Editor for project gmluepisjslxowncdxba.

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
  unique (user_id, consent_type, consent_version)
);

create table if not exists public.finance_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gross_monthly_salary numeric not null default 0,
  epf_employee_rate_percent numeric not null default 0,
  socso_employee_rate_percent numeric not null default 0,
  eis_employee_rate_percent numeric not null default 0,
  social_security_wage_ceiling numeric not null default 0,
  monthly_pcb_tax numeric not null default 0,
  existing_monthly_commitments numeric not null default 0,
  monthly_living_expenses numeric not null default 0,
  target_savings_percent numeric not null default 0,
  target_dsr_percent numeric not null default 0,
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint finance_profiles_profile_data_object
    check (jsonb_typeof(profile_data) = 'object')
);

create table if not exists public.saved_scenarios (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_kind text not null
    check (scenario_kind in ('home_loan', 'consumer_loan')),
  scenario_type text not null,
  name text not null,
  scenario_data jsonb not null default '{}'::jsonb,
  local_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id),
  constraint saved_scenarios_data_object
    check (jsonb_typeof(scenario_data) = 'object')
);

create table if not exists public.ongoing_loans (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_type text not null,
  name text not null,
  monthly_payment numeric not null default 0,
  remaining_balance numeric not null default 0,
  annual_rate_percent numeric not null default 0,
  loan_data jsonb not null default '{}'::jsonb,
  local_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id),
  constraint ongoing_loans_data_object
    check (jsonb_typeof(loan_data) = 'object')
);

create table if not exists public.app_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'english',
  settings_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_data_object
    check (jsonb_typeof(settings_data) = 'object')
);

create table if not exists public.sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('push', 'pull')),
  item_count integer not null default 0,
  created_at timestamptz not null default now()
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

create index if not exists idx_user_consents_user_id
  on public.user_consents (user_id);

create index if not exists idx_saved_scenarios_user_updated
  on public.saved_scenarios (user_id, updated_at desc);

create index if not exists idx_ongoing_loans_user_updated
  on public.ongoing_loans (user_id, updated_at desc);

create index if not exists idx_sync_events_user_created
  on public.sync_events (user_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_user_consents_updated_at on public.user_consents;
create trigger set_user_consents_updated_at
before update on public.user_consents
for each row execute function public.set_updated_at();

drop trigger if exists set_finance_profiles_updated_at on public.finance_profiles;
create trigger set_finance_profiles_updated_at
before update on public.finance_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_saved_scenarios_updated_at on public.saved_scenarios;
create trigger set_saved_scenarios_updated_at
before update on public.saved_scenarios
for each row execute function public.set_updated_at();

drop trigger if exists set_ongoing_loans_updated_at on public.ongoing_loans;
create trigger set_ongoing_loans_updated_at
before update on public.ongoing_loans
for each row execute function public.set_updated_at();

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_app_snapshots_updated_at on public.app_snapshots;
create trigger set_app_snapshots_updated_at
before update on public.app_snapshots
for each row execute function public.set_updated_at();
