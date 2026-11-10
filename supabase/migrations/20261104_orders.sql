-- 20261104_orders.sql
-- Orders placed through WooCommerce, mirrored here by the order webhook (app/api/webhooks/woocommerce)
-- so members see them under My orders and earn Club Points.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  woo_order_id bigint not null unique,
  number text not null,
  status text not null,               -- WooCommerce status: processing, on-hold, completed, cancelled, refunded, failed
  currency text not null default 'USD',
  total numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

-- Only the server (service role) reads and writes orders.
alter table public.orders enable row level security;
