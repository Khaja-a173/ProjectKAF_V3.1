-- RLS Hardening — applies consistent per-tenant policies across all tables that have a tenant_id column.
-- Assumptions:
--  - JWT contains claim tenant_id (string UUID) for non-service requests.
--  - Service role (bypassrls) continues to bypass RLS (admin/cron).
--  - Tables without tenant_id are either global metadata or auth.* and are left untouched.

-- 1) Helper: robust extractor for tenant_id from JWT
create schema if not exists app;

create or replace function app.current_tenant_id()
returns uuid
language plpgsql
stable
as $$
declare
  _tid text;
begin
  -- auth.jwt() is a Supabase helper that returns JWT claims as jsonb (or null)
  begin
    _tid := coalesce( (auth.jwt() ->> 'tenant_id'), null );
  exception when others then
    _tid := null;
  end;
  if _tid is null or _tid = '' then
    return null;
  end if;
  return _tid::uuid;
exception when others then
  return null;
end;
$$;

comment on function app.current_tenant_id is
  'Returns tenant_id::uuid from JWT claims; NULL if absent or invalid.';

-- 2) Enable RLS + create per-tenant policies for every public.* table that has a tenant_id column
do $$
declare
  r record;
  _tbl regclass;
  _sch text;
  _rel text;
  _sel_pol text;
  _ins_pol text;
  _upd_pol text;
  _del_pol text;
begin
  for r in
    select c.table_schema, c.table_name
    from information_schema.columns c
    join pg_class pc on pc.relname = c.table_name
    join pg_namespace pn on pn.nspname = c.table_schema and pn.oid = pc.relnamespace
    where c.column_name = 'tenant_id'
      and c.table_schema not in ('pg_catalog','information_schema','auth','pgbouncer')
      and c.table_schema = 'public'
    order by c.table_schema, c.table_name
  loop
    _sch := r.table_schema;
    _rel := r.table_name;
    _tbl := format('%I.%I', _sch, _rel);

    -- Enable and force RLS (deny by default when no policy matches)
    execute format('alter table %s enable row level security;', _tbl);
    execute format('alter table %s force row level security;', _tbl);

    -- Policy names (consistent & idempotent)
    _sel_pol := format('%s_tenant_select', _rel);
    _ins_pol := format('%s_tenant_insert', _rel);
    _upd_pol := format('%s_tenant_update', _rel);
    _del_pol := format('%s_tenant_delete', _rel);

    -- Drop existing policies with same names (idempotency)
    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_sel_pol) then
      execute format('drop policy %I on %I.%I;', _sel_pol, _sch, _rel);
    end if;
    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_ins_pol) then
      execute format('drop policy %I on %I.%I;', _ins_pol, _sch, _rel);
    end if;
    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_upd_pol) then
      execute format('drop policy %I on %I.%I;', _upd_pol, _sch, _rel);
    end if;
    if exists (select 1 from pg_policies p where p.schemaname=_sch and p.tablename=_rel and p.policyname=_del_pol) then
      execute format('drop policy %I on %I.%I;', _del_pol, _sch, _rel);
    end if;

    -- Deny-by-default is achieved by RLS+FORCE; now add allow rules ONLY for same-tenant access.
    execute format($SQL$
      create policy %I on %I.%I
      as permissive
      for select
      using ( tenant_id = app.current_tenant_id() );
    $SQL$, _sel_pol, _sch, _rel);

    execute format($SQL$
      create policy %I on %I.%I
      as permissive
      for insert
      with check ( tenant_id = app.current_tenant_id() );
    $SQL$, _ins_pol, _sch, _rel);

    execute format($SQL$
      create policy %I on %I.%I
      as permissive
      for update
      using ( tenant_id = app.current_tenant_id() )
      with check ( tenant_id = app.current_tenant_id() );
    $SQL$, _upd_pol, _sch, _rel);

    execute format($SQL$
      create policy %I on %I.%I
      as permissive
      for delete
      using ( tenant_id = app.current_tenant_id() );
    $SQL$, _del_pol, _sch, _rel);

  end loop;
end $$;

-- 3) OPTIONAL: visibility note for tables lacking tenant_id (informational NOTICEs)
do $$
declare r record;
begin
  for r in
    select t.table_schema, t.table_name
    from information_schema.tables t
    where t.table_schema='public'
      and t.table_type='BASE TABLE'
      and not exists (
        select 1 from information_schema.columns c
        where c.table_schema=t.table_schema and c.table_name=t.table_name and c.column_name='tenant_id'
      )
      and t.table_name not in ('tenants','plans','regions') -- whitelist global tables if applicable
  loop
    raise notice 'Table %:%. lacks tenant_id column — review if it should be multi-tenant.', r.table_schema, r.table_name;
  end loop;
end $$;

-- End of RLS Hardening