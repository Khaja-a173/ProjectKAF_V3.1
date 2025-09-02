-- Ensure orders table exists (no-op if present)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  session_id text not null,
  table_id uuid null,
  mode text not null check (mode in ('table','takeaway')),
  total_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending','processing','paid','cancelled')),
  idempotency_key text not null,
  created_at timestamptz not null default now()
);

-- Ensure columns exist (safe idempotent alters)
alter table public.orders add column if not exists idempotency_key text not null default ''::text;
alter table public.orders alter column idempotency_key drop default;

alter table public.orders add column if not exists status text not null default 'pending';
alter table public.orders add column if not exists mode text not null default 'takeaway';
alter table public.orders add column if not exists total_cents integer not null default 0;
alter table public.orders add column if not exists session_id text not null default '';
alter table public.orders add column if not exists table_id uuid null;

-- Indexes
create index if not exists idx_orders_tenant_created on public.orders(tenant_id, created_at desc);

-- Unique idempotency per tenant
create unique index if not exists ux_orders_tenant_idem on public.orders(tenant_id, idempotency_key);

-- One active order per table (partial unique index)
create unique index if not exists ux_orders_active_per_table
  on public.orders(tenant_id, table_id)
  where table_id is not null and status in ('pending','processing');

-- Optimistic cart: bump-able version on table_sessions
alter table public.table_sessions
  add column if not exists cart_version integer not null default 0;

-- RLS (deny by default + same-tenant access)
alter table public.orders enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='orders' and policyname='orders_same_tenant_rw') then
    create policy orders_same_tenant_rw
      on public.orders
      using (tenant_id = app.current_tenant_id())
      with check (tenant_id = app.current_tenant_id());
  end if;
end$$;

-- Transactional RPC function for checkout (atomic)
create schema if not exists app;

create or replace function app.checkout_order(
  p_tenant_id uuid,
  p_session_id text,
  p_mode text,
  p_table_id uuid,
  p_cart_version integer,
  p_idempotency_key text,
  p_total_cents integer
)
returns table(order_id uuid, duplicate boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  v_cur_version integer;
  v_existing_id uuid;
begin
  -- Optional tenant guard if app.current_tenant_id() is available
  if p_tenant_id <> app.current_tenant_id() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Fast path: duplicate idempotency
  select id into v_existing_id
  from public.orders
  where tenant_id = p_tenant_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query select v_existing_id, true;
  end if;

  -- Transactional critical section (table-scoped advisory lock)
  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')));

  -- CAS: ensure cart_version matches and bump it
  select cart_version into v_cur_version
  from public.table_sessions
  where tenant_id = p_tenant_id and id = p_session_id
  for update;

  if not found or v_cur_version <> p_cart_version then
    raise exception 'stale_cart' using errcode = '55000';
  end if;

  update public.table_sessions
     set cart_version = cart_version + 1
   where tenant_id = p_tenant_id and id = p_session_id;

  -- One active order per table for dine-in (also enforced by partial unique index)
  if p_mode = 'table' and p_table_id is not null then
    if exists (
      select 1 from public.orders
       where tenant_id = p_tenant_id
         and table_id = p_table_id
         and status in ('pending','processing')
    ) then
      raise exception 'active_order_exists' using errcode = '55000';
    end if;
  end if;

  -- Insert order; tenant + idempotency_key unique handles duplicates
  insert into public.orders(
    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key
  ) values (
    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,
    p_mode, 'pending', p_total_cents, p_idempotency_key
  )
  returning id into v_existing_id;

  return query select v_existing_id, false;
end;
$fn$;

-- Optional: lock down execute to authenticated roles only (adjust as per your roles)
-- revoke all on function app.checkout_order(uuid,text,text,uuid,integer,text,integer) from public;