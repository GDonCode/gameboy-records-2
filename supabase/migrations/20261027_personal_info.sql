-- Personal info tab: shipping addresses and verified email changes.
-- Run once in the Supabase SQL editor (or with `supabase db push`).
-- Both tables are only accessed with the service role key from the Next.js server,
-- so RLS is enabled with no policies: the anon and authenticated roles get no access.

-- ── Shipping addresses ───────────────────────────────────────────────────────
-- Field names follow Printful's order recipient (name, address1, address2, city, state, country_code, zip, phone).
create table if not exists public.user_addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  full_name    text not null check (char_length(full_name) between 1 and 100),
  line1        text not null check (char_length(line1) between 1 and 120),
  line2        text check (line2 is null or char_length(line2) <= 120),
  city         text not null check (char_length(city) between 1 and 80),
  region       text check (region is null or char_length(region) <= 80),
  postal_code  text check (postal_code is null or char_length(postal_code) <= 20),
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  phone        text check (phone is null or char_length(phone) <= 30),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists user_addresses_user_id_idx on public.user_addresses (user_id);
-- At most one default address per user.
create unique index if not exists user_addresses_one_default_idx
  on public.user_addresses (user_id) where is_default;

alter table public.user_addresses enable row level security;

-- ── Email change verification codes ──────────────────────────────────────────
create table if not exists public.email_change_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  new_email   text not null,
  code_hash   text not null,
  attempts    int not null default 0,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists email_change_requests_user_idx
  on public.email_change_requests (user_id, created_at desc);

alter table public.email_change_requests enable row level security;
