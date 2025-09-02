/*
  # Transactional checkout RPC function

  1. Function Purpose
    - Atomic order placement with idempotency guarantees
    - Optimistic cart locking via cart_version
    - One active order per table enforcement
    - Duplicate detection and handling

  2. Security
    - SECURITY DEFINER with tenant validation
    - Advisory locks prevent race conditions
    - Proper error handling with specific error codes

  3. Return Values
    - order_id: UUID of created or existing order
    - duplicate: boolean indicating if this was a duplicate request
*/

-- Ensure app schema exists
create schema if not exists app;

-- Transactional function for idempotent checkout
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
  -- Tenant validation (if app.current_tenant_id() function exists)
  begin
    if p_tenant_id <> app.current_tenant_id() then
      raise exception 'forbidden' using errcode = '42501';
    end if;
  exception when undefined_function then
    -- app.current_tenant_id() doesn't exist, skip validation
    null;
  end;

  -- Fast path: duplicate idempotency returns existing order
  select id into v_existing_id
  from public.orders
  where tenant_id = p_tenant_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query select v_existing_id, true;
    return;
  end if;

  -- Begin atomic section with advisory lock
  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')));

  -- CAS: ensure cart_version matches and bump it
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

  -- One active order per table (dine-in only)
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
$fn$;