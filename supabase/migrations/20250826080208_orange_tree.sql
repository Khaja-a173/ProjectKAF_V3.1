-- Phase 3 Staff Infrastructure Fix
-- Purpose: Align staff RLS to no-arg helper and link demo user to DEMO tenant
-- Date: 2025-01-26
-- Safe: Idempotent operations only

-- 1) Ensure app schema exists
CREATE SCHEMA IF NOT EXISTS app;

-- 2) Ensure RLS is enabled on staff (no table recreation)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'staff'
  ) THEN
    EXECUTE 'ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY';
  END IF;
END$$;

-- 3) Replace two policies with the correct helper (no-arg current_tenant_ids())
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff' AND policyname='staff_rw_same_tenant') THEN
    EXECUTE 'DROP POLICY "staff_rw_same_tenant" ON public.staff';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff' AND policyname='staff_self_select') THEN
    EXECUTE 'DROP POLICY "staff_self_select" ON public.staff';
  END IF;
END$$;

CREATE POLICY "staff_rw_same_tenant"
ON public.staff
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM current_tenant_ids(uid()) ct(tenant_id)
    WHERE ct.tenant_id = staff.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM current_tenant_ids(uid()) ct(tenant_id)
    WHERE ct.tenant_id = staff.tenant_id
  )
);

CREATE POLICY "staff_self_select"
ON public.staff
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4) Single-tenant helper
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM current_tenant_ids(uid()) LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated, anon, public;

-- 5) Link demo user to DEMO tenant (id's already established)
INSERT INTO public.staff (tenant_id, user_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', '79bbda7d-ea19-4dfd-a479-b5fafe7460c6', 'admin')
ON CONFLICT (tenant_id, user_id) DO NOTHING;