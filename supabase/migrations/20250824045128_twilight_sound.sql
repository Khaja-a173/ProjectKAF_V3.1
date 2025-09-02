-- Table to lock a restaurant table to a session.
create table if not exists public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  table_id uuid not null,
  pin_hash text not null,
  status text not null default 'active', -- active|closed
  created_at timestamptz not null default now(),
  locked_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_by text
);

-- Only one ACTIVE session per (tenant_id, table_id)
create unique index if not exists uniq_active_table_session
on public.table_sessions (tenant_id, table_id)
where status = 'active';

-- Basic RLS: reuse your existing hardening (tenant_id scoped)
alter table public.table_sessions enable row level security;
alter table public.table_sessions force row level security;

-- Policies mirror your existing pattern:
drop policy if exists table_sessions_tenant_select on public.table_sessions;
create policy table_sessions_tenant_select on public.table_sessions
  for select using (tenant_id = app.current_tenant_id());

drop policy if exists table_sessions_tenant_insert on public.table_sessions;
create policy table_sessions_tenant_insert on public.table_sessions
  for insert with check (tenant_id = app.current_tenant_id());

drop policy if exists table_sessions_tenant_update on public.table_sessions;
create policy table_sessions_tenant_update on public.table_sessions
  for update using (tenant_id = app.current_tenant_id()) with check (tenant_id = app.current_tenant_id());

drop policy if exists table_sessions_tenant_delete on public.table_sessions;
create policy table_sessions_tenant_delete on public.table_sessions
  for delete using (tenant_id = app.current_tenant_id());