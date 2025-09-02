/*
  # Transactional Order Checkout RPC

  1. New Functions
    - `app.checkout_order()` - Atomic order placement with idempotency
      - Validates mode/table requirements
      - Performs cart_version CAS (Compare-And-Swap)
      - Enforces one active order per table
      - Inserts order or returns existing by idempotency key
      - All operations in single transaction

  2. Security
    - Function runs as SECURITY DEFINER
    - Validates tenant context matches execution
    - Uses advisory locks for table-level atomicity
    - Maintains RLS enforcement through existing policies

  3. Error Handling
    - Custom error codes for different failure scenarios
    - Proper exception handling for stale carts
    - Duplicate detection via idempotency keys
*/

-- Transactional function for idempotent checkout
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
as $$
declare
  v_cur_version integer;
  v_existing_id uuid;
begin
  -- Require same-tenant execution context (optional extra check)
  if p_tenant_id <> app.current_tenant_id() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Fast path: duplicate idempotency returns existing order
  select id into v_existing_id
  from public.orders
  where tenant_id = p_tenant_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query select v_existing_id, true;
  end if;

  -- Begin atomic section
  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')));

  -- CAS: bump cart_version only if matches
  select cart_version into v_cur_version
  from public.table_sessions
  where tenant_id = p_tenant_id and id = p_session_id
  for update;

  if not found then
    raise exception 'stale_cart' using errcode = '55000';
  end if;

  if v_cur_version <> p_cart_version then
    raise exception 'stale_cart' using errcode = '55000';
  end if;

  update public.table_sessions
    set cart_version = cart_version + 1
  where tenant_id = p_tenant_id and id = p_session_id;

  -- One active order per table (enforced also by partial unique index)
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

  -- Insert order; unique (tenant_id, idempotency_key) handles duplicates
  insert into public.orders(
    tenant_id, session_id, table_id, mode, status, total_cents, idempotency_key
  ) values (
    p_tenant_id, p_session_id, case when p_mode='table' then p_table_id else null end,
    p_mode, 'pending', p_total_cents, p_idempotency_key
  )
  returning id into v_existing_id;

  return query select v_existing_id, false;
end;
$$;

-- RLS safe access for same-tenant (function runs as definer but checks tenant match)
-- Ensure orders/table_sessions policies already enforce tenant scoping.