-- Estado compartido del taller. La API pública no puede consultar estas tablas.
create table if not exists public.workshop_state (
  id integer primary key check (id = 1),
  unlocked integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.presenter_credentials (
  id integer primary key check (id = 1),
  salt text not null,
  password_hash text not null
);

create table if not exists public.presenter_sessions (
  token_hash text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.presenter_login_attempts (
  client_hash text primary key,
  attempts integer not null,
  window_started timestamptz not null
);

alter table public.workshop_state enable row level security;
alter table public.presenter_credentials enable row level security;
alter table public.presenter_sessions enable row level security;
alter table public.presenter_login_attempts enable row level security;

revoke all on public.workshop_state, public.presenter_credentials, public.presenter_sessions, public.presenter_login_attempts from public, anon, authenticated;
grant select, update on public.workshop_state to service_role;
grant select on public.presenter_credentials to service_role;
grant select, insert, delete on public.presenter_sessions to service_role;
grant select, insert, update, delete on public.presenter_login_attempts to service_role;

create or replace function public.set_lesson_access(p_section integer, p_available boolean)
returns integer[] language plpgsql security invoker as $$
declare result integer[];
begin
  if p_section < 1 or p_section > 11 then
    raise exception 'invalid section';
  end if;
  update public.workshop_state
    set unlocked = case when p_available then
      array(select distinct item from unnest(array_append(unlocked, p_section)) item order by item)
    else array_remove(unlocked, p_section) end,
    updated_at = now()
    where id = 1
    returning unlocked into result;
  return result;
end;
$$;

drop function if exists public.consume_presenter_attempt(text);

create or replace function public.presenter_attempt_count(p_client_hash text, p_record boolean)
returns integer language plpgsql security invoker as $$
declare attempt_count integer;
begin
  if not p_record then
    select attempts into attempt_count from public.presenter_login_attempts
      where client_hash = p_client_hash and window_started >= now() - interval '10 minutes';
    return coalesce(attempt_count, 0);
  end if;
  insert into public.presenter_login_attempts (client_hash, attempts, window_started)
    values (p_client_hash, 1, now())
    on conflict (client_hash) do update
      set attempts = case when presenter_login_attempts.window_started < now() - interval '10 minutes'
        then 1 else presenter_login_attempts.attempts + 1 end,
      window_started = case when presenter_login_attempts.window_started < now() - interval '10 minutes'
        then now() else presenter_login_attempts.window_started end
    returning attempts into attempt_count;
  return attempt_count;
end;
$$;

revoke all on function public.set_lesson_access(integer, boolean), public.presenter_attempt_count(text, boolean) from public, anon, authenticated;
grant execute on function public.set_lesson_access(integer, boolean), public.presenter_attempt_count(text, boolean) to service_role;

insert into public.workshop_state (id, unlocked) values (1, '{}') on conflict (id) do nothing;
