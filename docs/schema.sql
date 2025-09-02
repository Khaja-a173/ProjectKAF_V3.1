-- See MERGE_NOTES.md for details. Safe to re-run.
create extension if not exists pgcrypto;
create table if not exists public.tenants (id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, plan text not null default 'Free', created_at timestamptz not null default now());
create table if not exists public.staff (tenant_id uuid not null references tenants(id) on delete cascade, user_id uuid not null, role text not null check (role in ('admin','manager','staff','kitchen','cashier')), created_at timestamptz not null default now(), primary key (tenant_id, user_id));
create table if not exists public.invitations (id uuid primary key default gen_random_uuid(), tenant_id uuid not null references tenants(id) on delete cascade, email text not null, role text not null, created_at timestamptz not null default now(), accepted boolean not null default false);
create table if not exists public.tables (id uuid primary key default gen_random_uuid(), tenant_id uuid not null references tenants(id) on delete cascade, code text not null, label text not null, occupied boolean not null default false, created_at timestamptz not null default now()); create unique index if not exists uq_tables_code on public.tables(code);
create table if not exists public.menu_items (id uuid primary key default gen_random_uuid(), tenant_id uuid not null references tenants(id) on delete cascade, name text not null, price numeric(12,2) not null, category text, created_at timestamptz not null default now());
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), tenant_id uuid not null references tenants(id) on delete cascade, table_id uuid references tables(id) on delete set null, code text not null default ('ORD-'||substr(encode(gen_random_bytes(6), 'hex'),1,8)), status text not null default 'new', items jsonb, total numeric(12,2) not null default 0, created_at timestamptz not null default now()); create index if not exists idx_orders_tenant_created on public.orders(tenant_id, created_at desc);
create table if not exists public.payment_providers (id uuid primary key default gen_random_uuid(), tenant_id uuid not null references tenants(id) on delete cascade, provider text not null, enabled boolean not null default false, config jsonb);
alter table tenants enable row level security; alter table staff enable row level security; alter table invitations enable row level security; alter table tables enable row level security; alter table menu_items enable row level security; alter table orders enable row level security; alter table payment_providers enable row level security;
create policy if not exists tenants_isolation on tenants using (exists (select 1 from staff s where s.tenant_id = tenants.id and s.user_id = auth.uid()));
create policy if not exists staff_self on staff using (user_id = auth.uid());
create policy if not exists tables_isolation on tables using (exists (select 1 from staff s where s.tenant_id = tables.tenant_id and s.user_id = auth.uid()));
create policy if not exists menu_isolation on menu_items using (exists (select 1 from staff s where s.tenant_id = menu_items.tenant_id and s.user_id = auth.uid()));
create policy if not exists orders_isolation on orders using (exists (select 1 from staff s where s.tenant_id = orders.tenant_id and s.user_id = auth.uid()));
create policy if not exists providers_isolation on payment_providers using (exists (select 1 from staff s where s.tenant_id = payment_providers.tenant_id and s.user_id = auth.uid()));
create or replace function public.revenue_timeseries(tenant_ids uuid[])
returns table(date text, revenue numeric) language sql as $$
  select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, sum(total) as revenue
  from orders
  where tenant_id = any(tenant_ids)
  group by 1
  order by 1;
$$;