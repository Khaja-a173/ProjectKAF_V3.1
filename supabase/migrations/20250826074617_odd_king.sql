/*
  # Create Missing Staff Infrastructure

  1. New Tables
    - `staff` - Bridge table between auth.users and tenants
    - Enables proper multi-tenant staff membership tracking

  2. Helper Functions
    - `app.current_tenant_id()` - Get current user's tenant ID
    - Used by RLS policies for tenant isolation

  3. Views
    - `v_current_staff` - Current user's staff membership view
    - Provides tenant context for authenticated users

  4. Sample Data
    - Test staff memberships for demo user
    - Sample menu items and orders for analytics testing

  5. Security
    - Enable RLS on staff table
    - Add policies for tenant isolation
    - Maintain existing security model
*/

-- Create app schema for helper functions
CREATE SCHEMA IF NOT EXISTS app;

-- Create staff bridge table (missing from current schema)
CREATE TABLE IF NOT EXISTS staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL, -- maps to auth.users.id
    role text NOT NULL CHECK (role IN ('admin','manager','waiter','kitchen')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);

-- Enable RLS on staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create staff policies for tenant isolation
CREATE POLICY "staff_rw_same_tenant" ON staff
FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM current_tenant_ids(uid()) ct(tenant_id)
    WHERE ct.tenant_id = staff.tenant_id
))
WITH CHECK (EXISTS (
    SELECT 1 FROM current_tenant_ids(uid()) ct(tenant_id)
    WHERE ct.tenant_id = staff.tenant_id
));

-- Self-select policy for users to see their own staff record
CREATE POLICY "staff_self_select" ON staff
FOR SELECT TO authenticated
USING (user_id = uid());

-- Create current staff view
CREATE OR REPLACE VIEW v_current_staff AS
SELECT s.id, s.tenant_id, s.user_id, s.role, s.created_at
FROM staff s
WHERE s.user_id = auth.uid();

-- Create current tenant helper function
CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM v_current_staff LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO authenticated, public;

-- Create helper function for tenant IDs (used by existing policies)
CREATE OR REPLACE FUNCTION current_tenant_ids(user_uuid uuid)
RETURNS TABLE(tenant_id uuid)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT s.tenant_id
  FROM staff s
  WHERE s.user_id = user_uuid;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION current_tenant_ids(uuid) TO authenticated, public;

-- Insert demo staff membership (links demo@example.com to tenant)
INSERT INTO staff (tenant_id, user_id, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Create sample menu categories for testing
INSERT INTO categories (id, tenant_id, name, description, sort_order, is_active) VALUES
('cat11111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'Appetizers', 'Start your meal with our delicious appetizers', 100, true),
('cat22222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'Main Courses', 'Our signature main dishes', 200, true),
('cat33333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'Desserts', 'Sweet endings to your meal', 300, true)
ON CONFLICT (id) DO NOTHING;

-- Create sample menu items for testing
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, cost, is_available, active) VALUES
('itm11111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'cat11111-1111-1111-1111-111111111111', 'Truffle Arancini', 'Crispy risotto balls with black truffle', 16.00, 6.50, true, true),
('itm22222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'cat11111-1111-1111-1111-111111111111', 'Pan-Seared Scallops', 'Fresh diver scallops with cauliflower purée', 24.00, 12.00, true, true),
('itm33333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'cat22222-2222-2222-2222-222222222222', 'Wagyu Beef Tenderloin', 'Premium wagyu beef with seasonal vegetables', 65.00, 28.00, true, true),
('itm44444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', 'cat22222-2222-2222-2222-222222222222', 'Grilled Atlantic Salmon', 'Fresh salmon with herb crust and quinoa pilaf', 32.00, 14.00, true, true),
('itm55555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000', 'cat33333-3333-3333-3333-333333333333', 'Chocolate Lava Cake', 'Warm chocolate cake with vanilla ice cream', 12.00, 4.00, true, true)
ON CONFLICT (id) DO NOTHING;

-- Create sample restaurant tables
INSERT INTO restaurant_tables (id, tenant_id, table_number, capacity, status, qr_code) VALUES
('tbl11111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'T01', 4, 'available', 'QR_DEMO_T01'),
('tbl22222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'T02', 2, 'available', 'QR_DEMO_T02'),
('tbl33333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'T03', 6, 'available', 'QR_DEMO_T03')
ON CONFLICT (id) DO NOTHING;

-- Create sample orders for analytics testing
INSERT INTO orders (id, tenant_id, table_id, order_number, order_type, status, subtotal, tax_amount, total_amount, mode, total_cents, session_id, created_at) VALUES
('ord11111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'tbl11111-1111-1111-1111-111111111111', 'ORD-001', 'dine_in', 'served', 45.00, 3.60, 48.60, 'table', 4860, 'sess-001', NOW() - INTERVAL '2 hours'),
('ord22222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'tbl22222-2222-2222-2222-222222222222', 'ORD-002', 'dine_in', 'paid', 28.00, 2.24, 30.24, 'table', 3024, 'sess-002', NOW() - INTERVAL '1 hour'),
('ord33333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', NULL, 'ORD-003', 'takeaway', 'completed', 36.00, 2.88, 38.88, 'takeaway', 3888, 'sess-003', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Create sample order items for top items analytics
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, tenant_id) VALUES
('oit11111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 'itm11111-1111-1111-1111-111111111111', 2, 16.00, 32.00, '550e8400-e29b-41d4-a716-446655440000'),
('oit22222-2222-2222-2222-222222222222', 'ord11111-1111-1111-1111-111111111111', 'itm44444-4444-4444-4444-444444444444', 1, 13.00, 13.00, '550e8400-e29b-41d4-a716-446655440000'),
('oit33333-3333-3333-3333-333333333333', 'ord22222-2222-2222-2222-222222222222', 'itm44444-4444-4444-4444-444444444444', 1, 28.00, 28.00, '550e8400-e29b-41d4-a716-446655440000'),
('oit44444-4444-4444-4444-444444444444', 'ord33333-3333-3333-3333-333333333333', 'itm33333-3333-3333-3333-333333333333', 1, 36.00, 36.00, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Create sample payments for revenue analytics
INSERT INTO payments (id, tenant_id, order_id, amount, payment_method, status, processed_at, created_at) VALUES
('pay11111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'ord11111-1111-1111-1111-111111111111', 48.60, 'card', 'completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('pay22222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'ord22222-2222-2222-2222-222222222222', 30.24, 'cash', 'completed', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('pay33333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'ord33333-3333-3333-3333-333333333333', 38.88, 'card', 'completed', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Create sample customers for customer analytics
INSERT INTO customers (id, tenant_id, email, first_name, last_name, total_spent, visit_count, last_visit_at) VALUES
('cust1111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'customer1@example.com', 'John', 'Smith', 48.60, 1, NOW() - INTERVAL '2 hours'),
('cust2222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'customer2@example.com', 'Jane', 'Doe', 69.12, 2, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;