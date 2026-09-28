-- Self-service account deletion for Spectra Calculator (Google Play requirement).
-- Safe to run more than once in project gmluepisjslxowncdxba.
--
-- Deletes the caller's auth user. Every Spectra table references auth.users
-- with on delete cascade, so profiles, consents, snapshots and legacy rows go
-- with it.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Deletes the signed-in user and, by cascade, all of their Spectra data.';
