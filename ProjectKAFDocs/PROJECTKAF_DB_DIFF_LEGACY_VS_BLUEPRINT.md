# ProjectKAF Database Diff - Legacy vs Blueprint Analysis

## Overview
This document compares the current ProjectKAF database schema against the Phase 1 blueprint, identifying differences, conflicts, and required reconciliation steps.

## Schema Comparison Analysis

### 1. Table Structure Differences

#### 1.1 Tenants Table
**Current Schema:**
```sql
CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    logo_url text,
    website text,
    phone text,
    email text,
    address jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_plan text DEFAULT 'basic'::text,
    subscription_status text DEFAULT 'active'::text,
    trial_ends_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Blueprint Schema:**
```sql
CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE CHECK (length(code) = 4),
    name text NOT NULL,
    plan text NOT NULL DEFAULT 'basic',
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
```

**🔍 Analysis:**
- ❌ **Missing**: `code` column (4-character unique identifier)
- ❌ **Missing**: `code` length check constraint
- ❌ **Missing**: Tenant code immutability trigger
- ✅ **Extra**: `slug`, `description`, `logo_url`, `website`, `phone`, `email`, `address`, `settings`, `subscription_plan`, `subscription_status`, `trial_ends_at` (beneficial additions)
- ⚠️ **Conflict**: `plan` vs `subscription_plan` naming

**🔧 Reconciliation SQL:**
```sql
-- Add missing code column
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS code text;

-- Add unique constraint and length check
ALTER TABLE tenants ADD CONSTRAINT tenants_code_unique UNIQUE (code);
ALTER TABLE tenants ADD CONSTRAINT tenants_code_length CHECK (length(code) = 4);

-- Create immutability trigger
CREATE OR REPLACE FUNCTION protect_tenant_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.code <> OLD.code THEN
    RAISE EXCEPTION 'tenant code is immutable';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_protect_tenant_code ON tenants;
CREATE TRIGGER trg_protect_tenant_code
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE PROCEDURE protect_tenant_code();

-- Populate code column for existing tenants
UPDATE tenants SET code = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 4))
WHERE code IS NULL;

-- Make code NOT NULL after population
ALTER TABLE tenants ALTER COLUMN code SET NOT NULL;
```

#### 1.2 Users Table
**Current Schema:** ✅ **Matches Blueprint**
- All required columns present
- Proper foreign key relationships
- Correct constraints and defaults

**🔧 No Action Required**

#### 1.3 Staff Table (Blueprint Addition)
**Blueprint Schema:**
```sql
CREATE TABLE staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL, -- supabase auth uid
    role text NOT NULL CHECK (role IN ('admin','manager','waiter','kitchen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);
```

**🔍 Analysis:**
- ❌ **Missing**: Entire `staff` table from blueprint
- ⚠️ **Conflict**: Current `users` table serves similar purpose but different structure

**🔧 Reconciliation SQL:**
```sql
-- Create staff table as bridge between auth.users and tenants
CREATE TABLE IF NOT EXISTS staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL, -- maps to auth.users.id
    role text NOT NULL CHECK (role IN ('admin','manager','waiter','kitchen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "staff_rw_same_tenant" ON staff
FOR ALL USING (EXISTS (
    SELECT 1 FROM v_current_staff v 
    WHERE v.tenant_id = staff.tenant_id
))
WITH CHECK (EXISTS (
    SELECT 1 FROM v_current_staff v 
    WHERE v.tenant_id = staff.tenant_id
));

-- Migrate existing users to staff table
INSERT INTO staff (tenant_id, user_id, role)
SELECT tenant_id, id, 
  CASE 
    WHEN role = 'tenant_admin' THEN 'admin'
    WHEN role = 'manager' THEN 'manager'
    WHEN role = 'staff' THEN 'waiter'
    ELSE 'waiter'
  END
FROM users
WHERE tenant_id IS NOT NULL
ON CONFLICT (tenant_id, user_id) DO NOTHING;
```

### 2. Missing Blueprint Tables

#### 2.1 Locations Table
**Blueprint Schema:**
```sql
CREATE TABLE locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    timezone text NOT NULL DEFAULT 'Australia/Brisbane',
    currency text NOT NULL DEFAULT 'AUD',
    created_at timestamptz NOT NULL DEFAULT now()
);
```

**🔧 Implementation SQL:**
```sql
CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    timezone text NOT NULL DEFAULT 'Australia/Brisbane',
    currency text NOT NULL DEFAULT 'AUD',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_rw_same_tenant" ON locations
FOR ALL USING (EXISTS (
    SELECT 1 FROM v_current_staff v 
    WHERE v.tenant_id = locations.tenant_id
))
WITH CHECK (EXISTS (
    SELECT 1 FROM v_current_staff v 
    WHERE v.tenant_id = locations.tenant_id
));
```

#### 2.2 Tables Table (Blueprint vs restaurant_tables)
**Current**: `restaurant_tables`
**Blueprint**: `tables`

**🔧 Reconciliation Options:**
```sql
-- Option 1: Rename existing table
ALTER TABLE restaurant_tables RENAME TO tables;

-- Option 2: Create alias view
CREATE VIEW tables AS SELECT * FROM restaurant_tables;

-- Option 3: Add missing columns to match blueprint
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS code text;
UPDATE restaurant_tables SET code = table_number WHERE code IS NULL;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS label text;
UPDATE restaurant_tables SET label = table_number WHERE label IS NULL;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS seats integer;
UPDATE restaurant_tables SET seats = capacity WHERE seats IS NULL;
```

### 3. RLS Policy Conflicts

#### 3.1 Legacy Public Policies
**Current Policies:**
- Many tables have policies allowing access to `public` role
- Some policies use complex tenant resolution logic

**Blueprint Policies:**
- Simplified tenant isolation through `v_current_staff` view
- Consistent policy patterns across all tables

**🔧 Policy Reconciliation:**
```sql
-- Drop conflicting legacy policies
DROP POLICY IF EXISTS "Users can access their tenant data" ON tenants;
DROP POLICY IF EXISTS "Users can access their tenant users" ON users;
-- ... (drop all existing policies)

-- Recreate with blueprint pattern
CREATE POLICY "tenants_select_for_staff" ON tenants
FOR SELECT USING (EXISTS (
    SELECT 1 FROM v_current_staff v 
    WHERE v.tenant_id = tenants.id
));

-- Apply consistent pattern to all tables
-- (See PROJECTKAF_DB_POLICY_RAW_EXPORT.sql for complete policy set)
```

### 4. Missing Blueprint Functions

#### 4.1 Current Tenant Helper
**Blueprint Function:**
```sql
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM v_current_staff LIMIT 1;
$$;
```

**🔧 Implementation:**
```sql
-- Create app schema if not exists
CREATE SCHEMA IF NOT EXISTS app;

-- Create current tenant function
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM v_current_staff LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated;
```

### 5. Trigger Conflicts

#### 5.1 Existing Triggers
**Current Triggers:**
- `update_*_updated_at` triggers on most tables
- `trg_orders_fill_defaults` trigger on orders

**Blueprint Triggers:**
- Similar timestamp update triggers
- Tenant code protection trigger

**🔍 Analysis:**
- ✅ **Compatible**: Existing triggers don't conflict
- ✅ **Beneficial**: Keep existing triggers for functionality
- ➕ **Addition**: Add tenant code protection trigger

**🔧 No Conflicts - Keep Existing**

### 6. Index Optimization

#### 6.1 Missing Performance Indexes
**Blueprint Additions:**
```sql
-- Staff user lookup (critical for RLS performance)
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);

-- Tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_active ON menu_items(tenant_id, active);
```

**🔧 Implementation:**
```sql
-- Add missing performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_tenant_active ON menu_items(tenant_id, is_available);

-- Additional performance indexes for scale
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_tenant ON orders(tenant_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_category_tenant ON menu_items(category_id, tenant_id);
```

## Reconciliation Checklist

### ✅ **Phase 1: Critical Additions**
```sql
-- 1. Add tenant code system
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS code text;
-- (Complete implementation above)

-- 2. Create staff bridge table
CREATE TABLE IF NOT EXISTS staff (...);
-- (Complete implementation above)

-- 3. Create locations table
CREATE TABLE IF NOT EXISTS locations (...);
-- (Complete implementation above)

-- 4. Add current_tenant_id function
CREATE OR REPLACE FUNCTION app.current_tenant_id() ...;
-- (Complete implementation above)
```

### ✅ **Phase 2: Policy Standardization**
```sql
-- 1. Create v_current_staff view
CREATE OR REPLACE VIEW v_current_staff AS ...;

-- 2. Standardize all RLS policies
-- (Use PROJECTKAF_DB_POLICY_RAW_EXPORT.sql)

-- 3. Test tenant isolation
-- (Use PROJECTKAF_TEST_FIXTURES.sql)
```

### ✅ **Phase 3: Performance Optimization**
```sql
-- 1. Add missing indexes
CREATE INDEX CONCURRENTLY ...;

-- 2. Analyze query performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE tenant_id = '...';

-- 3. Optimize slow queries
-- (Based on performance analysis)
```

## Migration Strategy

### Safe Migration Approach
1. **Backup Database**: Create full backup before changes
2. **Test Environment**: Apply changes to staging first
3. **Incremental Changes**: Apply changes in small batches
4. **Rollback Plan**: Prepare rollback scripts for each change
5. **Validation**: Test tenant isolation after each change

### Migration Script Template
```sql
-- Migration: Add tenant code system
-- Date: 2025-01-XX
-- Author: ProjectKAF Team

BEGIN;

-- Step 1: Add column
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS code text;

-- Step 2: Populate existing data
UPDATE tenants SET code = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 4))
WHERE code IS NULL;

-- Step 3: Add constraints
ALTER TABLE tenants ALTER COLUMN code SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT tenants_code_unique UNIQUE (code);
ALTER TABLE tenants ADD CONSTRAINT tenants_code_length CHECK (length(code) = 4);

-- Step 4: Add protection trigger
CREATE OR REPLACE FUNCTION protect_tenant_code() ...;
CREATE TRIGGER trg_protect_tenant_code ...;

-- Validation
SELECT COUNT(*) FROM tenants WHERE code IS NULL; -- Should be 0
SELECT COUNT(DISTINCT code) = COUNT(*) FROM tenants; -- Should be true

COMMIT;
```

## Risk Assessment

### 🔴 **High Risk Changes**
- **Tenant code addition**: Requires data migration for existing tenants
- **Policy replacement**: Could break existing access patterns
- **Staff table creation**: Requires user data migration

### 🟡 **Medium Risk Changes**
- **Index additions**: May cause temporary performance impact
- **Function additions**: Could conflict with existing functions
- **View creation**: May affect existing queries

### 🟢 **Low Risk Changes**
- **Trigger additions**: Non-breaking enhancements
- **Comment additions**: Documentation improvements
- **Optional column additions**: Backward compatible

## Validation Queries

### Post-Migration Validation
```sql
-- 1. Verify tenant codes are unique and valid
SELECT code, COUNT(*) 
FROM tenants 
GROUP BY code 
HAVING COUNT(*) > 1; -- Should return no rows

-- 2. Verify RLS is working
SET ROLE authenticated;
SET request.jwt.claims.tenant_id = 'tenant_1';
SELECT COUNT(*) FROM orders; -- Should only show tenant_1 orders

-- 3. Verify staff mapping
SELECT u.email, s.role, t.name
FROM users u
JOIN staff s ON s.user_id = u.id
JOIN tenants t ON t.id = s.tenant_id;

-- 4. Verify all tables have RLS enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relnamespace = 'public'::regnamespace 
AND relkind = 'r' 
AND NOT relrowsecurity; -- Should return no rows
```

## Recommended Migration Order

### Phase 1: Foundation (Low Risk)
1. Add tenant `code` column and constraints
2. Create `staff` bridge table
3. Create `locations` table
4. Add performance indexes

### Phase 2: Policy Updates (Medium Risk)
1. Create `v_current_staff` view
2. Create `app.current_tenant_id()` function
3. Update RLS policies table by table
4. Test tenant isolation thoroughly

### Phase 3: Optimization (Low Risk)
1. Add remaining performance indexes
2. Optimize slow queries
3. Add monitoring and alerting
4. Performance testing

## Rollback Procedures

### Emergency Rollback
```sql
-- Rollback tenant code addition
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_code_unique;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_code_length;
ALTER TABLE tenants DROP COLUMN IF EXISTS code;
DROP TRIGGER IF EXISTS trg_protect_tenant_code ON tenants;
DROP FUNCTION IF EXISTS protect_tenant_code();

-- Rollback staff table
DROP TABLE IF EXISTS staff CASCADE;

-- Rollback policies (restore from backup)
-- (Restore original policies from backup)
```

### Validation After Rollback
```sql
-- Verify application still works
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;

-- Test basic operations
INSERT INTO orders (tenant_id, order_number, total_amount) 
VALUES ('existing_tenant_id', 'TEST-001', 25.00);
```

## Final Recommendations

### ✅ **Proceed with Migration**
The legacy schema is largely compatible with the blueprint. Key benefits of migration:

1. **Enhanced Security**: Improved tenant isolation
2. **Better Performance**: Optimized indexes and queries
3. **Simplified Logic**: Consistent policy patterns
4. **Future-Proof**: Ready for advanced features

### 🎯 **Migration Priority**
1. **High Priority**: Tenant code system (enables QR functionality)
2. **Medium Priority**: Policy standardization (improves security)
3. **Low Priority**: Performance optimizations (improves scale)

### 🚨 **Critical Success Factors**
1. **Backup First**: Full database backup before any changes
2. **Test Thoroughly**: Validate tenant isolation after each step
3. **Monitor Performance**: Watch for query performance degradation
4. **Rollback Ready**: Have tested rollback procedures

---

**The migration from legacy to blueprint schema is achievable with careful planning and incremental implementation. The existing schema provides a solid foundation that can be enhanced rather than replaced.**