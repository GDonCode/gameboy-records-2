-- Payments tab: saved payment methods.
-- Run once in the Supabase SQL editor. Safe to run more than once.
--
-- No card numbers or security codes are ever stored here. The payment processor keeps the card in its
-- own vault; this table only holds the processor's reference to it plus what the account page shows
-- ("Visa •••• 4242, expires 04/28").

create table if not exists public.payment_methods (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  provider              text not null check (provider in ('test', 'stripe', 'paypal', 'wipay', 'fygaro', 'fac')),
  provider_method_id    text not null check (char_length(provider_method_id) between 1 and 255),
  provider_customer_id  text check (provider_customer_id is null or char_length(provider_customer_id) <= 255),
  type                  text not null check (type in ('card', 'paypal')),
  brand                 text check (brand is null or char_length(brand) <= 30),
  last4                 text check (last4 is null or last4 ~ '^[0-9]{4}$'),
  exp_month             smallint check (exp_month is null or exp_month between 1 and 12),
  exp_year              smallint check (exp_year is null or exp_year between 2000 and 2100),
  label                 text check (label is null or char_length(label) <= 254),
  is_default            boolean not null default false,
  created_at            timestamptz not null default now(),
  unique (provider, provider_method_id)
);

create index if not exists payment_methods_user_idx on public.payment_methods (user_id, created_at);
-- At most one default payment method per user.
create unique index if not exists payment_methods_one_default_idx
  on public.payment_methods (user_id) where is_default;

alter table public.payment_methods enable row level security;

-- Adding and removing payment methods shows up in Login & security → Recent security activity.
alter table public.account_security_events drop constraint if exists account_security_events_kind_check;
alter table public.account_security_events add constraint account_security_events_kind_check check (kind in (
  'sign_in', 'password_changed', 'password_set', 'password_check_failed',
  'signed_out_everywhere', 'email_changed', 'payment_method_added', 'payment_method_removed',
  'payment_method_failed'
));
