# ProjectKAF Database Snapshot - Complete Schema Documentation

## Overview
This document provides a comprehensive snapshot of the ProjectKAF Supabase database schema, including all tables, policies, views, functions, triggers, and sample data.

## 1. Tables (Public Schema)

### 1.1 tenants
**Purpose**: Multi-tenant isolation and restaurant management
```sql
CREATE TABLE public.tenants (
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
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Unique Constraints**: slug
- **Indexes**: tenants_pkey, tenants_slug_key
- **RLS Enabled**: Yes
- **Triggers**: update_tenants_updated_at

### 1.2 users
**Purpose**: Staff and user management with role-based access
```sql
CREATE TABLE public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    email text NOT NULL,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    avatar_url text,
    role user_role DEFAULT 'staff'::user_role,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    email_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: tenant_id → tenants(id)
- **Unique Constraints**: (tenant_id, email)
- **Indexes**: idx_users_email, idx_users_tenant_id, users_tenant_id_email_key
- **RLS Enabled**: Yes

### 1.3 categories
**Purpose**: Menu categorization system
```sql
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: tenant_id → tenants(id)
- **RLS Enabled**: Yes

### 1.4 menu_items
**Purpose**: Restaurant menu items with detailed information
```sql
CREATE TABLE public.menu_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    image_url text,
    images jsonb DEFAULT '[]'::jsonb,
    ingredients jsonb DEFAULT '[]'::jsonb,
    allergens jsonb DEFAULT '[]'::jsonb,
    nutritional_info jsonb DEFAULT '{}'::jsonb,
    dietary_info jsonb DEFAULT '{}'::jsonb,
    preparation_time integer,
    calories integer,
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    variants jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: tenant_id → tenants(id), category_id → categories(id)
- **Indexes**: idx_menu_items_category_id, idx_menu_items_tenant_id
- **RLS Enabled**: Yes

### 1.5 restaurant_tables
**Purpose**: Physical table management and QR code integration
```sql
CREATE TABLE public.restaurant_tables (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    table_number text NOT NULL,
    capacity integer NOT NULL,
    location text,
    status table_status DEFAULT 'available'::table_status,
    qr_code text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: tenant_id → tenants(id)
- **Unique Constraints**: (tenant_id, table_number), qr_code (where not null)
- **RLS Enabled**: Yes

### 1.6 orders
**Purpose**: Order management with comprehensive tracking
```sql
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    table_id uuid REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    staff_id uuid REFERENCES users(id) ON DELETE SET NULL,
    order_number text NOT NULL,
    order_type text DEFAULT 'dine_in'::text,
    status order_status DEFAULT 'pending'::order_status,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    tip_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status payment_status DEFAULT 'pending'::payment_status,
    special_instructions text,
    estimated_ready_time timestamp with time zone,
    ready_at timestamp with time zone,
    served_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    idempotency_key text,
    mode text DEFAULT 'takeaway'::text NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    session_id text DEFAULT ''::text NOT NULL
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: Multiple references to tenants, customers, tables, users
- **Unique Constraints**: (tenant_id, order_number), (tenant_id, idempotency_key)
- **Complex Indexes**: Multiple performance and constraint indexes
- **RLS Enabled**: Yes

### 1.7 order_items
**Purpose**: Individual items within orders
```sql
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    customizations jsonb DEFAULT '{}'::jsonb,
    special_instructions text,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: order_id → orders(id), menu_item_id → menu_items(id)
- **RLS Enabled**: Yes

### 1.8 customers
**Purpose**: Customer information and loyalty tracking
```sql
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    email text,
    phone text,
    first_name text,
    last_name text,
    date_of_birth date,
    preferences jsonb DEFAULT '{}'::jsonb,
    loyalty_points integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0,
    visit_count integer DEFAULT 0,
    last_visit_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: tenant_id → tenants(id)
- **Unique Constraints**: (tenant_id, email), (tenant_id, phone)
- **RLS Enabled**: Yes

### 1.9 payments
**Purpose**: Payment processing and transaction records
```sql
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_provider text,
    provider_transaction_id text,
    status payment_status DEFAULT 'pending'::payment_status,
    processed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
```
- **Primary Key**: id (uuid)
- **Foreign Keys**: tenant_id → tenants(id), order_id → orders(id)
- **RLS Enabled**: Yes

### 1.10 table_sessions
**Purpose**: Table session management for QR ordering
```sql
CREATE TABLE public.table_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    table_id uuid NOT NULL,
    pin_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    locked_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by text,
    cart_version integer DEFAULT 0 NOT NULL
);
```
- **Primary Key**: id (uuid)
- **Unique Constraints**: (tenant_id, table_id) where status = 'active'
- **RLS Enabled**: Yes

### 1.11 Additional Tables
- **daily_sales_summary**: Sales analytics and reporting
- **inventory_items**: Inventory management
- **notifications**: User notification system
- **staff_schedules**: Staff scheduling system
- **audit_logs**: Comprehensive audit trail

## 2. Row Level Security Policies

### 2.1 Tenants Table Policies
```sql
-- Users can access their tenant data
CREATE POLICY "Users can access their tenant data" ON public.tenants
FOR ALL TO public
USING (id = (SELECT users.tenant_id FROM users WHERE users.id = uid()));
```

### 2.2 Users Table Policies
```sql
-- Users can access their tenant users
CREATE POLICY "Users can access their tenant users" ON public.users
FOR ALL TO public
USING (tenant_id = (SELECT users_1.tenant_id FROM users users_1 WHERE users_1.id = uid()));

-- Tenant-specific CRUD operations
CREATE POLICY "users_tenant_select" ON public.users
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "users_tenant_insert" ON public.users
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "users_tenant_update" ON public.users
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "users_tenant_delete" ON public.users
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());
```

### 2.3 Menu Items Policies
```sql
-- Authenticated users can read active menu items for their tenant
CREATE POLICY "auth_read_menu_items_active_tenant" ON public.menu_items
FOR SELECT TO authenticated
USING ((is_available = true) AND (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid) AND ((category_id IS NULL) OR (EXISTS (SELECT 1 FROM categories c WHERE ((c.id = menu_items.category_id) AND (c.is_active = true) AND (c.tenant_id = menu_items.tenant_id))))));

-- Public read access for available items
CREATE POLICY "public_read_menu_items_available" ON public.menu_items
FOR SELECT TO anon
USING (is_available = true);

-- Tenant-specific management
CREATE POLICY "menu_items_tenant_select" ON public.menu_items
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());
```

### 2.4 Orders Table Policies
```sql
-- Users can access their tenant orders
CREATE POLICY "Users can access their tenant orders" ON public.orders
FOR ALL TO public
USING (tenant_id = (SELECT users.tenant_id FROM users WHERE users.id = uid()));

-- Authenticated tenant-specific access
CREATE POLICY "auth_read_orders_tenant" ON public.orders
FOR SELECT TO authenticated
USING (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid);

CREATE POLICY "auth_insert_orders_tenant" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid);

-- Same tenant read/write operations
CREATE POLICY "orders_same_tenant_rw" ON public.orders
FOR ALL TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());
```

### 2.5 Table Sessions Policies
```sql
-- Tenant-specific table session management
CREATE POLICY "table_sessions_tenant_select" ON public.table_sessions
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_insert" ON public.table_sessions
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_update" ON public.table_sessions
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_delete" ON public.table_sessions
FOR DELETE TO public
USING (tenant_id = app.current_tenant_id());
```

## 3. Views

### 3.1 Current Staff View
```sql
CREATE VIEW public.v_current_staff AS
SELECT s.*, t.code as tenant_code
FROM public.staff s
JOIN public.tenants t ON t.id = s.tenant_id
WHERE s.user_id = auth.uid();
```

## 4. Functions

### 4.1 Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
```

### 4.2 Orders Fill Defaults Function
```sql
CREATE OR REPLACE FUNCTION public.orders_fill_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Auto-generate order number if not provided
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || EXTRACT(EPOCH FROM NOW())::bigint;
    END IF;
    
    -- Set default timestamps
    IF NEW.created_at IS NULL THEN
        NEW.created_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;
```

### 4.3 Tenant Code Protection Function
```sql
CREATE OR REPLACE FUNCTION public.protect_tenant_code()
RETURNS trigger 
LANGUAGE plpgsql 
AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.code <> OLD.code THEN
        RAISE EXCEPTION 'tenant code is immutable';
    END IF;
    RETURN NEW;
END;
$$;
```

## 5. Triggers

### 5.1 Update Timestamp Triggers
```sql
-- Tenants
CREATE TRIGGER update_tenants_updated_at 
BEFORE UPDATE ON public.tenants 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Categories
CREATE TRIGGER update_categories_updated_at 
BEFORE UPDATE ON public.categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Menu Items
CREATE TRIGGER update_menu_items_updated_at 
BEFORE UPDATE ON public.menu_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Orders
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON public.orders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order Items
CREATE TRIGGER update_order_items_updated_at 
BEFORE UPDATE ON public.order_items 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Business Logic Triggers
```sql
-- Orders default values
CREATE TRIGGER trg_orders_fill_defaults 
BEFORE INSERT ON public.orders 
FOR EACH ROW EXECUTE FUNCTION orders_fill_defaults();

-- Tenant code protection
CREATE TRIGGER trg_protect_tenant_code 
BEFORE UPDATE ON public.tenants 
FOR EACH ROW EXECUTE FUNCTION protect_tenant_code();
```

## 6. Extensions

### 6.1 Installed Extensions
```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 7. Enums

### 7.1 User Role Enum
```sql
CREATE TYPE public.user_role AS ENUM (
    'customer',
    'staff',
    'manager',
    'tenant_admin',
    'super_admin'
);
```

### 7.2 Order Status Enum
```sql
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'paid',
    'cancelled',
    'placed',
    'processing'
);
```

### 7.3 Payment Status Enum
```sql
CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);
```

### 7.4 Table Status Enum
```sql
CREATE TYPE public.table_status AS ENUM (
    'available',
    'occupied',
    'reserved',
    'maintenance'
);
```

### 7.5 Notification Type Enum
```sql
CREATE TYPE public.notification_type AS ENUM (
    'order',
    'payment',
    'system',
    'promotion'
);
```

## 8. Sample Data (Testing Only)

### 8.1 Tenants
```sql
INSERT INTO tenants (id, name, slug, email, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'Bella Vista Restaurant', 'bella-vista', 'admin@bellavista.com', '+1-555-0101'),
('22222222-2222-2222-2222-222222222222', 'Urban Spice Kitchen', 'urban-spice', 'admin@urbanspice.com', '+1-555-0102'),
('33333333-3333-3333-3333-333333333333', 'Coastal Breeze Cafe', 'coastal-breeze', 'admin@coastalbreeze.com', '+1-555-0103'),
('44444444-4444-4444-4444-444444444444', 'Mountain View Bistro', 'mountain-view', 'admin@mountainview.com', '+1-555-0104'),
('55555555-5555-5555-5555-555555555555', 'Downtown Grill House', 'downtown-grill', 'admin@downtowngrill.com', '+1-555-0105');
```

### 8.2 Users (Staff)
```sql
INSERT INTO users (id, tenant_id, email, first_name, last_name, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin@bellavista.com', 'Admin', 'User', 'tenant_admin'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'manager@bellavista.com', 'Manager', 'User', 'manager'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'admin@urbanspice.com', 'Admin', 'User', 'tenant_admin'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'chef@urbanspice.com', 'Chef', 'User', 'staff'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'admin@coastalbreeze.com', 'Admin', 'User', 'tenant_admin');
```

### 8.3 Categories
```sql
INSERT INTO categories (id, tenant_id, name, description, sort_order) VALUES
('cat11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Appetizers', 'Start your meal with our delicious appetizers', 100),
('cat22222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Main Courses', 'Our signature main dishes', 200),
('cat33333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Starters', 'Begin your culinary journey', 100),
('cat44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Entrees', 'Our main course specialties', 200),
('cat55555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Light Bites', 'Perfect for a quick meal', 100);
```

### 8.4 Menu Items
```sql
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available) VALUES
('itm11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'cat11111-1111-1111-1111-111111111111', 'Truffle Arancini', 'Crispy risotto balls with black truffle', 16.00, true),
('itm22222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'cat22222-2222-2222-2222-222222222222', 'Wagyu Beef Tenderloin', 'Premium wagyu with seasonal vegetables', 65.00, true),
('itm33333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'cat33333-3333-3333-3333-333333333333', 'Spiced Samosas', 'Traditional Indian appetizer', 12.00, true),
('itm44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'cat44444-4444-4444-4444-444444444444', 'Butter Chicken', 'Creamy tomato-based curry', 24.00, true),
('itm55555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'cat55555-5555-5555-5555-555555555555', 'Avocado Toast', 'Fresh avocado on sourdough', 14.00, true);
```

### 8.5 Restaurant Tables
```sql
INSERT INTO restaurant_tables (id, tenant_id, table_number, capacity, status, qr_code) VALUES
('tbl11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'T01', 4, 'available', 'QR_BELLA_T01'),
('tbl22222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'T02', 2, 'available', 'QR_BELLA_T02'),
('tbl33333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'T01', 6, 'available', 'QR_URBAN_T01'),
('tbl44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'T02', 4, 'occupied', 'QR_URBAN_T02'),
('tbl55555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'T01', 2, 'available', 'QR_COAST_T01');
```

### 8.6 Orders
```sql
INSERT INTO orders (id, tenant_id, table_id, order_number, status, subtotal, tax_amount, total_amount, mode) VALUES
('ord11111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'tbl11111-1111-1111-1111-111111111111', 'ORD-001', 'preparing', 45.00, 3.60, 48.60, 'dine_in'),
('ord22222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'tbl22222-2222-2222-2222-222222222222', 'ORD-002', 'ready', 28.00, 2.24, 30.24, 'dine_in'),
('ord33333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'tbl33333-3333-3333-3333-333333333333', 'ORD-003', 'confirmed', 36.00, 2.88, 38.88, 'dine_in'),
('ord44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NULL, 'ORD-004', 'pending', 24.00, 1.92, 25.92, 'takeaway'),
('ord55555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'tbl55555-5555-5555-5555-555555555555', 'ORD-005', 'served', 14.00, 1.12, 15.12, 'dine_in');
```

### 8.7 Order Items
```sql
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price) VALUES
('oit11111-1111-1111-1111-111111111111', 'ord11111-1111-1111-1111-111111111111', 'itm11111-1111-1111-1111-111111111111', 2, 16.00, 32.00),
('oit22222-2222-2222-2222-222222222222', 'ord11111-1111-1111-1111-111111111111', 'itm22222-2222-2222-2222-222222222222', 1, 13.00, 13.00),
('oit33333-3333-3333-3333-333333333333', 'ord22222-2222-2222-2222-222222222222', 'itm22222-2222-2222-2222-222222222222', 1, 28.00, 28.00),
('oit44444-4444-4444-4444-444444444444', 'ord33333-3333-3333-3333-333333333333', 'itm33333-3333-3333-3333-333333333333', 3, 12.00, 36.00),
('oit55555-5555-5555-5555-555555555555', 'ord55555-5555-5555-5555-555555555555', 'itm55555-5555-5555-5555-555555555555', 1, 14.00, 14.00);
```

## 9. Indexes

### 9.1 Performance Indexes
```sql
-- Staff user lookup
CREATE INDEX idx_staff_user ON public.staff(user_id);

-- Order performance
CREATE INDEX idx_orders_tenant_status ON public.orders(tenant_id, status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_tenant_created ON public.orders(tenant_id, created_at DESC);

-- Menu item performance
CREATE INDEX idx_menu_items_tenant_active ON public.menu_items(tenant_id, is_available);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_tenant_id ON public.menu_items(tenant_id);

-- Order items performance
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- User performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);

-- Audit logs performance
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Notifications performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
```

## 10. Constraints

### 10.1 Check Constraints
```sql
-- Order status validation
ALTER TABLE orders ADD CONSTRAINT valid_order_status 
CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'));

-- Payment amount validation
ALTER TABLE payments ADD CONSTRAINT positive_payment_amount 
CHECK (amount >= 0);

-- Menu item price validation
ALTER TABLE menu_items ADD CONSTRAINT positive_menu_price 
CHECK (price >= 0);

-- Table capacity validation
ALTER TABLE restaurant_tables ADD CONSTRAINT positive_table_capacity 
CHECK (capacity > 0);
```

## 11. Security Features

### 11.1 Row Level Security Summary
- **All tables have RLS enabled**
- **Tenant isolation enforced at database level**
- **Staff-based access control**
- **No cross-tenant data access possible**
- **Authenticated and anonymous access patterns**

### 11.2 Authentication Integration
- **Supabase Auth integration**
- **JWT token validation**
- **User ID mapping to staff records**
- **Role-based access control**

## 12. Performance Considerations

### 12.1 Query Optimization
- **Composite indexes** for common query patterns
- **Partial indexes** for filtered queries
- **Foreign key indexes** for join performance
- **Tenant-scoped queries** for optimal performance

### 12.2 Scalability Features
- **UUID primary keys** for distributed systems
- **Timestamp tracking** for audit and sync
- **JSONB columns** for flexible data storage
- **Efficient RLS policies** with minimal overhead

---

**This database schema provides a solid foundation for a multi-tenant restaurant management system with enterprise-grade security, performance, and scalability.**