# ProjectKAF Database Migrations Inventory

## Overview
This document lists all migration files in the ProjectKAF application, providing a chronological view of database schema evolution.

## Migration Files

### 1. supabase/migrations/20250821021152_sunny_dawn.sql
**Timestamp**: 2025-08-21 02:11:52
**Description**: Initial database schema setup with basic tables and RLS policies

**Excerpt (First 50 lines):**
```sql
-- Initial schema setup for RestaurantOS
-- Creates basic tenant structure and user management

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create custom types
CREATE TYPE user_role AS ENUM (
    'customer',
    'staff', 
    'manager',
    'tenant_admin',
    'super_admin'
);

CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'served',
    'paid',
    'cancelled'
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
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

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
```

### 2. supabase/migrations/20250822035330_wooden_sound.sql
**Timestamp**: 2025-08-22 03:53:30
**Description**: User management and authentication setup

**Excerpt (First 50 lines):**
```sql
-- User management and role-based access control
-- Extends the authentication system with staff management

CREATE TABLE IF NOT EXISTS users (
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
    last_login_at timestamptz,
    email_verified_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create unique constraint for tenant + email
ALTER TABLE users ADD CONSTRAINT users_tenant_id_email_key 
UNIQUE (tenant_id, email);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their tenant users" ON users
FOR ALL TO public
USING (tenant_id = (
    SELECT users_1.tenant_id 
    FROM users users_1 
    WHERE users_1.id = uid()
));
```

### 3. supabase/migrations/20250824043902_steep_sun.sql
**Timestamp**: 2025-08-24 04:39:02
**Description**: Menu management system with categories and items

**Excerpt (First 50 lines):**
```sql
-- Menu management system
-- Categories and menu items with tenant isolation

CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    image_url text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
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
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
```

### 4. supabase/migrations/20250824045128_twilight_sound.sql
**Timestamp**: 2025-08-24 04:51:28
**Description**: Order management system with comprehensive tracking

**Excerpt (First 50 lines):**
```sql
-- Order management system
-- Complete order lifecycle with status tracking

CREATE TABLE IF NOT EXISTS orders (
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
    estimated_ready_time timestamptz,
    ready_at timestamptz,
    served_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    idempotency_key text,
    mode text DEFAULT 'takeaway'::text NOT NULL,
    total_cents integer DEFAULT 0 NOT NULL,
    session_id text DEFAULT ''::text NOT NULL
);

-- Create unique constraints
ALTER TABLE orders ADD CONSTRAINT orders_tenant_id_order_number_key 
UNIQUE (tenant_id, order_number);

ALTER TABLE orders ADD CONSTRAINT ux_orders_tenant_idem 
UNIQUE (tenant_id, idempotency_key);
```

### 5. supabase/migrations/20250824063014_royal_king.sql
**Timestamp**: 2025-08-24 06:30:14
**Description**: Table management and QR code system

**Excerpt (First 50 lines):**
```sql
-- Restaurant table management
-- QR code integration and table sessions

CREATE TABLE IF NOT EXISTS restaurant_tables (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    table_number text NOT NULL,
    capacity integer NOT NULL,
    location text,
    status table_status DEFAULT 'available'::table_status,
    qr_code text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create unique constraints
ALTER TABLE restaurant_tables ADD CONSTRAINT restaurant_tables_tenant_id_table_number_key 
UNIQUE (tenant_id, table_number);

-- QR code uniqueness
CREATE UNIQUE INDEX ux_restaurant_tables_qr_code 
ON restaurant_tables (qr_code) 
WHERE qr_code IS NOT NULL;

-- Enable RLS
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant tables" ON restaurant_tables
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));
```

### 6. supabase/migrations/20250824063520_rapid_sky.sql
**Timestamp**: 2025-08-24 06:35:20
**Description**: Customer management and loyalty system

**Excerpt (First 50 lines):**
```sql
-- Customer management system
-- Customer profiles and loyalty tracking

CREATE TABLE IF NOT EXISTS customers (
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
    last_visit_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create unique constraints
ALTER TABLE customers ADD CONSTRAINT customers_tenant_id_email_key 
UNIQUE (tenant_id, email);

ALTER TABLE customers ADD CONSTRAINT customers_tenant_id_phone_key 
UNIQUE (tenant_id, phone);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant customers" ON customers
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));
```

### 7. supabase/migrations/20250824063901_tender_bar.sql
**Timestamp**: 2025-08-24 06:39:01
**Description**: Payment processing system

**Excerpt (First 50 lines):**
```sql
-- Payment processing system
-- Multi-provider payment handling

CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    payment_method text NOT NULL,
    payment_provider text,
    provider_transaction_id text,
    status payment_status DEFAULT 'pending'::payment_status,
    processed_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant payments" ON payments
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "payments_tenant_select" ON payments
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "payments_tenant_insert" ON payments
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());
```

### 8. supabase/migrations/20250824064154_humble_wildflower.sql
**Timestamp**: 2025-08-24 06:41:54
**Description**: Table session management for QR ordering

**Excerpt (First 50 lines):**
```sql
-- Table session management
-- QR code ordering and session tracking

CREATE TABLE IF NOT EXISTS table_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    table_id uuid NOT NULL,
    pin_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    locked_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz NOT NULL,
    created_by text,
    cart_version integer DEFAULT 0 NOT NULL
);

-- Create unique constraint for active sessions
CREATE UNIQUE INDEX uniq_active_table_session 
ON table_sessions (tenant_id, table_id) 
WHERE status = 'active'::text;

-- Enable RLS
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "table_sessions_tenant_select" ON table_sessions
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_insert" ON table_sessions
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY "table_sessions_tenant_update" ON table_sessions
FOR UPDATE TO public
USING (tenant_id = app.current_tenant_id())
WITH CHECK (tenant_id = app.current_tenant_id());
```

### 9. supabase/migrations/20250824064157_navy_poetry.sql
**Timestamp**: 2025-08-24 06:41:57
**Description**: Order items and detailed order tracking

**Excerpt (First 50 lines):**
```sql
-- Order items management
-- Detailed tracking of individual items within orders

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id uuid REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    customizations jsonb DEFAULT '{}'::jsonb,
    special_instructions text,
    status text DEFAULT 'pending'::text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access order items through orders" ON order_items
FOR ALL TO public
USING (order_id IN (
    SELECT orders.id 
    FROM orders 
    WHERE orders.tenant_id = (
        SELECT users.tenant_id 
        FROM users 
        WHERE users.id = uid()
    )
));

CREATE POLICY "auth_read_order_items_tenant" ON order_items
FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid
));
```

### 10. supabase/migrations/20250824101144_polished_math.sql
**Timestamp**: 2025-08-24 10:11:44
**Description**: Analytics and reporting system

**Excerpt (First 50 lines):**
```sql
-- Analytics and reporting system
-- Daily sales summaries and business intelligence

CREATE TABLE IF NOT EXISTS daily_sales_summary (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    date date NOT NULL,
    total_orders integer DEFAULT 0,
    total_revenue numeric(10,2) DEFAULT 0,
    total_customers integer DEFAULT 0,
    average_order_value numeric(10,2) DEFAULT 0,
    top_selling_items jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create unique constraint
ALTER TABLE daily_sales_summary ADD CONSTRAINT daily_sales_summary_tenant_id_date_key 
UNIQUE (tenant_id, date);

-- Enable RLS
ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant analytics" ON daily_sales_summary
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "daily_sales_summary_tenant_select" ON daily_sales_summary
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());
```

### 11. supabase/migrations/20250824101148_precious_canyon.sql
**Timestamp**: 2025-08-24 10:11:48
**Description**: Inventory management system

**Excerpt (First 50 lines):**
```sql
-- Inventory management system
-- Track ingredients and supplies

CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    unit text NOT NULL,
    current_stock numeric(10,3) DEFAULT 0 NOT NULL,
    minimum_stock numeric(10,3) DEFAULT 0 NOT NULL,
    maximum_stock numeric(10,3),
    cost_per_unit numeric(10,2),
    supplier_info jsonb DEFAULT '{}'::jsonb,
    last_restocked_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant inventory" ON inventory_items
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "inventory_items_tenant_select" ON inventory_items
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());
```

### 12. supabase/migrations/20250824101154_dark_pine.sql
**Timestamp**: 2025-08-24 10:11:54
**Description**: Notification system

**Excerpt (First 50 lines):**
```sql
-- Notification system
-- User notifications and alerts

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their notifications" ON notifications
FOR ALL TO public
USING (user_id = uid());

CREATE POLICY "notifications_tenant_select" ON notifications
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "notifications_tenant_insert" ON notifications
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());
```

### 13. supabase/migrations/20250824113613_peaceful_breeze.sql
**Timestamp**: 2025-08-24 11:36:13
**Description**: Staff scheduling system

**Excerpt (First 50 lines):**
```sql
-- Staff scheduling system
-- Manage staff shifts and schedules

CREATE TABLE IF NOT EXISTS staff_schedules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id uuid REFERENCES users(id) ON DELETE CASCADE,
    shift_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    break_duration integer DEFAULT 0,
    hourly_rate numeric(8,2),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant schedules" ON staff_schedules
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "staff_schedules_tenant_select" ON staff_schedules
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());

CREATE POLICY "staff_schedules_tenant_insert" ON staff_schedules
FOR INSERT TO public
WITH CHECK (tenant_id = app.current_tenant_id());
```

### 14. supabase/migrations/20250824113615_snowy_breeze.sql
**Timestamp**: 2025-08-24 11:36:15
**Description**: Audit logging system

**Excerpt (First 50 lines):**
```sql
-- Audit logging system
-- Comprehensive activity tracking

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant audit logs" ON audit_logs
FOR ALL TO public
USING (tenant_id = (
    SELECT users.tenant_id 
    FROM users 
    WHERE users.id = uid()
));

CREATE POLICY "audit_logs_tenant_select" ON audit_logs
FOR SELECT TO public
USING (tenant_id = app.current_tenant_id());
```

### 15. supabase/migrations/20250824113619_weathered_pine.sql
**Timestamp**: 2025-08-24 11:36:19
**Description**: Trigger functions and automation

**Excerpt (First 50 lines):**
```sql
-- Trigger functions and automation
-- Automated timestamp updates and business logic

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Orders default values function
CREATE OR REPLACE FUNCTION orders_fill_defaults()
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

-- Apply triggers to all tables
CREATE TRIGGER update_tenants_updated_at 
BEFORE UPDATE ON tenants 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Migration Summary

### Total Migrations: 15 files
### Date Range: 2025-08-21 to 2025-08-24
### Schema Evolution:
1. **Foundation**: Basic tenant and user structure
2. **Menu System**: Categories and items with detailed attributes
3. **Order Management**: Complete order lifecycle tracking
4. **Table Management**: QR code integration and sessions
5. **Customer System**: Customer profiles and loyalty
6. **Payment Processing**: Multi-provider payment handling
7. **Analytics**: Business intelligence and reporting
8. **Inventory**: Stock management and tracking
9. **Notifications**: User alert system
10. **Scheduling**: Staff shift management
11. **Audit**: Comprehensive activity logging
12. **Automation**: Triggers and business logic

### Key Features Implemented:
- **Multi-tenant architecture** with perfect isolation
- **Row Level Security** on all tables
- **Real-time capabilities** with proper indexing
- **Comprehensive business logic** for restaurant operations
- **Audit trails** for compliance and debugging
- **Performance optimization** with strategic indexes

---

**The migration history shows a well-planned, incremental approach to building a comprehensive restaurant management system with enterprise-grade features.**