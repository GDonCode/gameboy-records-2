-- Login & security tab: password changes, signing out other devices, and a security activity log.
-- Run once in the Supabase SQL editor. Safe to run more than once.

-- Sessions signed in before this time are signed out (password change, "sign out of other devices").
alter table public.users add column if not exists sessions_valid_after timestamptz;
alter table public.users add column if not exists password_changed_at timestamptz;

-- Security activity shown to the member, also used to rate-limit wrong password attempts.
create table if not exists public.account_security_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  kind        text not null check (kind in (
                'sign_in', 'password_changed', 'password_set', 'password_check_failed',
                'signed_out_everywhere', 'email_changed'
              )),
  user_agent  text check (user_agent is null or char_length(user_agent) <= 400),
  created_at  timestamptz not null default now()
);

create index if not exists account_security_events_user_idx
  on public.account_security_events (user_id, created_at desc);

alter table public.account_security_events enable row level security;

-- One-time codes for members who signed up with Google and want to add a password.
create table if not exists public.account_verification_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  purpose     text not null check (purpose in ('set_password')),
  code_hash   text not null,
  attempts    int not null default 0,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists account_verification_codes_user_idx
  on public.account_verification_codes (user_id, purpose, created_at desc);

alter table public.account_verification_codes enable row level security;
