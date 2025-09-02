-- Ensure orders table has required columns
alter table if exists public.orders
  add column if not exists idempotency_key text;

-- Add processing status to enum if it exists
do $$ begin
  alter type order_status add value if not exists 'processing';
exception when duplicate_object then null; end $$;

-- Create unique indexes (safe/idempotent)
create unique index if not exists ux_orders_tenant_idem
  on public.orders(tenant_id, idempotency_key);

create unique index if not exists ux_orders_active_per_table
  on public.orders(tenant_id, table_id)
  where table_id is not null and status in ('pending','processing');

-- Ensure cart_version exists on table_sessions
alter table if exists public.table_sessions
  add column if not exists cart_version integer not null default 0;