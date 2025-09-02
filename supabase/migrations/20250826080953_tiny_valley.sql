-- Phase 3 DB Fix: Replace uid() → auth.uid() everywhere (idempotent)
-- This fixes authentication and tenant isolation issues

-- 1. Ensure app schema exists
CREATE SCHEMA IF NOT EXISTS app;

-- 2. Helper: list all tenant_ids for a given user
--    (Use CREATE OR REPLACE so it's idempotent.)
CREATE OR REPLACE FUNCTION current_tenant_ids(user_uuid uuid)
RETURNS TABLE(tenant_id uuid)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT s.tenant_id
  FROM public.staff s
  WHERE s.user_id = user_uuid;
$$;

GRANT EXECUTE ON FUNCTION current_tenant_ids(uuid) TO authenticated, public;

-- 3. View: current user's staff membership (uses auth.uid())
CREATE OR REPLACE VIEW public.v_current_staff AS
SELECT s.id, s.tenant_id, s.user_id, s.role, s.created_at
FROM public.staff s
WHERE s.user_id = auth.uid();

-- 4. Helper: current tenant id for current user (first membership)
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.v_current_staff LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated, public;

-- 5. Policies on staff (drop then recreate with auth.uid())
DROP POLICY IF EXISTS "staff_rw_same_tenant" ON public.staff;
DROP POLICY IF EXISTS "staff_self_select"    ON public.staff;

-- Enforce tenant isolation for read/write
CREATE POLICY "staff_rw_same_tenant"
ON public.staff
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM current_tenant_ids(auth.uid()) ct(tenant_id)
    WHERE ct.tenant_id = staff.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM current_tenant_ids(auth.uid()) ct(tenant_id)
    WHERE ct.tenant_id = staff.tenant_id
  )
);

-- Let a user read their own staff record
CREATE POLICY "staff_self_select"
ON public.staff
FOR SELECT
TO authenticated
USING (user_id = auth.uid());