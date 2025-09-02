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
  if p_tenant_id <> app.current_tenant_id() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select id into v_existing_id
  from public.orders
  where tenant_id = p_tenant_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return query select v_existing_id, true;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tenant_id::text || coalesce(p_table_id::text,'')));

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