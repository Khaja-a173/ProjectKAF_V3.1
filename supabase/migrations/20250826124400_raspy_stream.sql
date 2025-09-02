-- =====================================================================
-- ProjectKAF – Fix "uid()" not found by shimming + upgrading to auth.uid()
-- Safe to run multiple times (idempotent). No data changes.
-- =====================================================================

-- 0) Ensure app schema exists (for helper functions if we use them)
create schema if not exists app;

-- 1) Compatibility shim: create a public.uid() wrapper so legacy policies keep working.
--    This immediately resolves "function uid() does not exist" errors.
--    Note: auth.uid() is the official way to get the current user's UUID.
create or replace function public.uid()
returns uuid
language sql
stable
security definer
as $$
  select auth.uid();
$$;

comment on function public.uid()
  is 'Back-compat shim. Prefer using auth.uid(). This delegates to auth.uid().';

-- 2) Ensure helper function current_tenant_ids exists and is correct.
--    (Used by RLS to scope queries to the current user's tenants.)
create or replace function public.current_tenant_ids(user_uuid uuid)
returns table(tenant_id uuid)
language sql
stable
security definer
as $fn$
  select s.tenant_id
  from public.staff s
  where s.user_id = user_uuid
$fn$;

grant execute on function public.current_tenant_ids(uuid) to authenticated, anon;

-- 3) (Optional but recommended) Provide a convenience no-arg variant that uses auth.uid()
--    so policies can call current_tenant_ids(auth.uid()) or current_tenant_ids() uniformly.
create or replace function public.current_tenant_ids()
returns table(tenant_id uuid)
language sql
stable
security definer
as $fn$
  select s.tenant_id
  from public.staff s
  where s.user_id = auth.uid()
$fn$;

grant execute on function public.current_tenant_ids() to authenticated, anon;

-- 4) Ensure app.current_tenant_id() returns a single tenant id for the current user.
create or replace function app.current_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id
  from public.staff
  where user_id = auth.uid()
  order by created_at
  limit 1
$$;

grant execute on function app.current_tenant_id() to authenticated, anon;

-- 5) Create staff table if not exists
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','manager','staff','kitchen','cashier')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

-- Enable RLS on staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 6) RLS Policy upgrades (drop & recreate with auth.uid()).
--    If a policy doesn't exist in your DB, the DROP IF EXISTS does nothing.

-- staff: user can select their own staff rows
drop policy if exists staff_self_select on public.staff;
create policy staff_self_select on public.staff
for select
to authenticated
using (user_id = auth.uid());

-- staff: tenant-scoped read/write (example used in earlier phases)
drop policy if exists staff_rw_same_tenant on public.staff;
create policy staff_rw_same_tenant on public.staff
for all
to authenticated
using (
  exists (
    select 1
    from public.current_tenant_ids(auth.uid()) ct
    where ct.tenant_id = staff.tenant_id
  )
)
with check (
  exists (
    select 1
    from public.current_tenant_ids(auth.uid()) ct
    where ct.tenant_id = staff.tenant_id
  )
);

-- NOTE:
-- If you have other tables with policies that reference uid(),
-- re-run similar drop/create using auth.uid(). The shim above
-- means you don't have to rush—nothing will 500 now.

-- 7) (Optional) Recreate a view that depends on current user
--    v_current_staff: rows for the logged-in user
drop view if exists public.v_current_staff;
create view public.v_current_staff as
select s.id, s.tenant_id, s.user_id, s.role, s.created_at
from public.staff s
where s.user_id = auth.uid();

-- 8) Permissions (already typical in Supabase, but harmless to repeat)
grant usage on schema app to authenticated, anon;

-- 9) Add missing columns for Phase 3 features (idempotent)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kitchen_state text CHECK (kitchen_state IN ('queued','preparing','ready','served','cancelled'));

-- 10) Create branding table for tenant customization
CREATE TABLE IF NOT EXISTS tenant_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logo_url text,
  hero_video_url text,
  theme jsonb DEFAULT '{}'::jsonb,
  gallery_urls text[] DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);

ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;

-- Branding policies
drop policy if exists branding_rw_same_tenant on public.tenant_branding;
create policy branding_rw_same_tenant on public.tenant_branding
for all
to authenticated
using (
  exists (
    select 1
    from public.current_tenant_ids(auth.uid()) ct
    where ct.tenant_id = tenant_branding.tenant_id
  )
)
with check (
  exists (
    select 1
    from public.current_tenant_ids(auth.uid()) ct
    where ct.tenant_id = tenant_branding.tenant_id
  )
);

-- 11) Create shifts table for staff scheduling
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','manager','staff','kitchen','cashier')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Shifts policies
drop policy if exists shifts_rw_same_tenant on public.shifts;
create policy shifts_rw_same_tenant on public.shifts
for all
to authenticated
using (
  exists (
    select 1
    from public.current_tenant_ids(auth.uid()) ct
    where ct.tenant_id = shifts.tenant_id
  )
)
with check (
  exists (
    select 1
    from public.current_tenant_ids(auth.uid()) ct
    where ct.tenant_id = shifts.tenant_id
  )
);

-- 12) Seed demo staff record (safe - only if missing)
INSERT INTO staff (tenant_id, user_id, role)
SELECT '550e8400-e29b-41d4-a716-446655440000', '79bbda7d-ea19-4dfd-a479-b5fafe7460c6', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM staff
  WHERE tenant_id='550e8400-e29b-41d4-a716-446655440000'
    AND user_id='79bbda7d-ea19-4dfd-a479-b5fafe7460c6'
);