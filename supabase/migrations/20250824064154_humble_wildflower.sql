-- Ensure idempotency index exists (safe)
create unique index if not exists ux_orders_tenant_idem
  on public.orders(tenant_id, idempotency_key);

-- Guarantee the partial unique index has the correct predicate:
-- Drop first (in case a wrong definition already exists), then create.
drop index if exists public.ux_orders_active_per_table;

create unique index ux_orders_active_per_table
  on public.orders(tenant_id, table_id)
  where table_id is not null and status in ('pending','processing');