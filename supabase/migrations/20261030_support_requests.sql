-- Customer support tab: members' support requests.
-- Run once in the Supabase SQL editor. Safe to run more than once.
-- Staff answer by replying to the notification email (it replies straight to the member).
-- To close a request from the Supabase dashboard, set status = 'resolved' and resolved_at = now().

create table if not exists public.support_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  reference       text not null unique check (reference ~ '^GBR-[0-9A-Z]{6}$'),
  topic           text not null check (topic in ('order', 'merch', 'account', 'rewards', 'shows', 'music', 'other')),
  subject         text not null check (char_length(subject) between 1 and 120),
  message         text not null check (char_length(message) between 1 and 5000),
  order_number    text check (order_number is null or char_length(order_number) <= 40),
  status          text not null default 'open' check (status in ('open', 'resolved')),
  -- False when the email to the support inbox failed; the request is still saved here.
  staff_notified  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

create index if not exists support_requests_user_idx on public.support_requests (user_id, created_at desc);
create index if not exists support_requests_open_idx on public.support_requests (status, created_at) where status = 'open';

alter table public.support_requests enable row level security;
