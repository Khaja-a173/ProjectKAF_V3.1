/*
  # Order idempotency and active order constraints

  1. Schema Updates
    - Add idempotency_key column to orders table
    - Add processing status to order_status enum if exists
    - Add cart_version to table_sessions for optimistic locking

  2. Constraints
    - Unique index on (tenant_id, idempotency_key) prevents duplicate orders
    - Partial unique index on (tenant_id, table_id) prevents multiple active orders per table

  3. Security
    - Maintains existing RLS policies
    - No changes to permission structure
*/

-- Add idempotency column if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'idempotency_key'
  ) then
    alter table public.orders add column idempotency_key text;
  end if;
end $$;

-- Add processing status to enum if it exists
do $$ 
begin
  if exists (select 1 from pg_type where typname = 'order_status') then
    begin
      alter type order_status add value if not exists 'processing';
    exception when duplicate_object then 
      null;
    end;
  end if;
end $$;

-- Add cart_version to table_sessions for optimistic locking
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'table_sessions' and column_name = 'cart_version'
  ) then
    alter table public.table_sessions add column cart_version integer not null default 0;
  end if;
end $$;

-- Create unique indexes (safe/idempotent)
create unique index if not exists ux_orders_tenant_idem
  on public.orders(tenant_id, idempotency_key);

create unique index if not exists ux_orders_active_per_table
  on public.orders(tenant_id, table_id)
  where table_id is not null and status in ('pending','processing');