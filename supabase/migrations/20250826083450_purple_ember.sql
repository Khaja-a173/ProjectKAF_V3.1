-- =========
-- PHASE 3: DASHBOARDS & CORE MODULES SCHEMA
-- Idempotent schema additions for dashboard functionality
-- =========

-- =========
-- SCHEMAS & HELPERS (safe create)
-- =========
CREATE SCHEMA IF NOT EXISTS app;

-- If helper current_tenant_ids(uuid) doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'current_tenant_ids'
      AND n.nspname = 'public'
      AND pg_catalog.pg_get_function_arguments(p.oid) = 'user_uuid uuid'
  ) THEN
    CREATE FUNCTION current_tenant_ids(user_uuid uuid)
    RETURNS TABLE(tenant_id uuid)
    LANGUAGE sql
    SECURITY DEFINER
    AS $fn$
      SELECT s.tenant_id
      FROM staff s
      WHERE s.user_id = user_uuid
    $fn$;
    GRANT EXECUTE ON FUNCTION current_tenant_ids(uuid) TO authenticated, public;
  END IF;
END$$;

-- If app.current_tenant_id() doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'current_tenant_id'
      AND n.nspname = 'app'
      AND pg_catalog.pg_get_function_arguments(p.oid) = ''
  ) THEN
    CREATE FUNCTION app.current_tenant_id()
    RETURNS uuid
    LANGUAGE sql
    SECURITY DEFINER
    AS $fn$
      SELECT tenant_id
      FROM staff
      WHERE user_id = auth.uid()
      ORDER BY created_at ASC
      LIMIT 1
    $fn$;
    GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated, public;
  END IF;
END$$;

-- =========
-- STAFF (bridge) – if missing, create; if exists, don't touch
-- =========
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('admin','manager','staff','kitchen','cashier')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- RLS policies (drop if name exists, then recreate – safe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff' AND policyname='staff_rw_same_tenant') THEN
    DROP POLICY "staff_rw_same_tenant" ON staff;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff' AND policyname='staff_self_select') THEN
    DROP POLICY "staff_self_select" ON staff;
  END IF;
END$$;

CREATE POLICY "staff_rw_same_tenant" ON staff
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = staff.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = staff.tenant_id
  )
);

CREATE POLICY "staff_self_select" ON staff
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- =========
-- MENU MEDIA & BULK IMPORT SUPPORT
-- =========
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- =========
-- TABLE MGMT (locks)
-- =========
ALTER TABLE restaurant_tables
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- =========
-- KDS (kitchen state) – additive column only, no enum changes
-- =========
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS kitchen_state text
    CHECK (kitchen_state IN ('queued','preparing','ready','served','cancelled'))
    DEFAULT NULL;

-- =========
-- SHIFTS (basic scheduling)
-- =========
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

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shifts' AND policyname='shifts_rw_same_tenant') THEN
    DROP POLICY "shifts_rw_same_tenant" ON shifts;
  END IF;
END$$;

CREATE POLICY "shifts_rw_same_tenant" ON shifts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = shifts.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = shifts.tenant_id
  )
);

-- =========
-- BRANDING (tenant customization)
-- =========
CREATE TABLE IF NOT EXISTS tenant_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  logo_url text,
  hero_video_url text,
  theme jsonb DEFAULT '{}'::jsonb,    -- colors, accents, etc.
  gallery_urls text[] DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenant_branding' AND policyname='branding_rw_same_tenant') THEN
    DROP POLICY "branding_rw_same_tenant" ON tenant_branding;
  END IF;
END$$;

CREATE POLICY "branding_rw_same_tenant" ON tenant_branding
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = tenant_branding.tenant_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM current_tenant_ids(auth.uid()) ct
    WHERE ct.tenant_id = tenant_branding.tenant_id
  )
);