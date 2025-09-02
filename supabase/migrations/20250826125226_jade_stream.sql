-- =====================================================================
-- ProjectKAF – Safe Fix for current_tenant_ids(uuid) Conflict
-- Drops existing functions and recreates them correctly
-- Safe to run multiple times (idempotent). No data changes.
-- =====================================================================

-- Step 1: Drop existing functions safely
DROP FUNCTION IF EXISTS public.current_tenant_ids(uuid);
DROP FUNCTION IF EXISTS public.current_tenant_ids();

-- Step 2A: User-specific version (explicit parameter)
CREATE OR REPLACE FUNCTION public.current_tenant_ids(user_uuid uuid)
RETURNS TABLE(tenant_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT s.tenant_id
  FROM public.staff s
  WHERE s.user_id = user_uuid;
$$;

GRANT EXECUTE ON FUNCTION public.current_tenant_ids(uuid) TO authenticated, anon;

-- Step 2B: Authenticated-user shortcut (no parameters)
CREATE OR REPLACE FUNCTION public.current_tenant_ids()
RETURNS TABLE(tenant_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT s.tenant_id
  FROM public.staff s
  WHERE s.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_tenant_ids() TO authenticated, anon;

-- Step 3: Ensure app.current_tenant_id() exists and works correctly
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.staff
  WHERE user_id = auth.uid()
  ORDER BY created_at
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated, anon;

-- Step 4: Ensure uid() compatibility shim exists
CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.uid() TO authenticated, anon;

-- Step 5: Verify staff table exists with proper structure
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','manager','staff','kitchen','cashier')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

-- Enable RLS on staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Step 6: Ensure demo staff record exists
INSERT INTO public.staff (tenant_id, user_id, role)
SELECT '550e8400-e29b-41d4-a716-446655440000', '79bbda7d-ea19-4dfd-a479-b5fafe7460c6', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.staff
  WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440000'
    AND user_id = '79bbda7d-ea19-4dfd-a479-b5fafe7460c6'
);

-- Step 7: Create v_current_staff view
DROP VIEW IF EXISTS public.v_current_staff;
CREATE VIEW public.v_current_staff AS
SELECT s.id, s.tenant_id, s.user_id, s.role, s.created_at
FROM public.staff s
WHERE s.user_id = auth.uid();

-- Step 8: Update staff RLS policies to use auth.uid()
DROP POLICY IF EXISTS "staff_self_select" ON public.staff;
CREATE POLICY "staff_self_select" ON public.staff
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "staff_rw_same_tenant" ON public.staff;
CREATE POLICY "staff_rw_same_tenant" ON public.staff
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = staff.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = staff.tenant_id
  )
);