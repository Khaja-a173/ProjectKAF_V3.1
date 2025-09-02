/*
  # Complete Restaurant Management Schema

  1. New Tables
    - `tenants` - Restaurant tenants/locations
    - `users` - Staff and admin users
    - `categories` - Menu categories
    - `menu_items` - Menu items with full details
    - `restaurant_tables` - Physical tables
    - `customers` - Customer information
    - `orders` - Customer orders
    - `order_items` - Individual order items
    - `payments` - Payment records
    - `inventory_items` - Inventory management
    - `staff_schedules` - Staff scheduling
    - `notifications` - System notifications
    - `audit_logs` - Audit trail
    - `daily_sales_summary` - Analytics data

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
    - Add proper indexes for performance

  3. Functions
    - Update timestamp triggers
    - Order number generation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'tenant_admin', 'manager', 'staff', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');
CREATE TYPE notification_type AS ENUM ('order', 'payment', 'system', 'promotion');

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    address JSONB,
    settings JSONB DEFAULT '{}',
    subscription_plan TEXT DEFAULT 'basic',
    subscription_status TEXT DEFAULT 'active',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant data"
    ON tenants FOR ALL
    TO public
    USING (id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'staff',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant users"
    ON users FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant categories"
    ON categories FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    image_url TEXT,
    images JSONB DEFAULT '[]',
    ingredients JSONB DEFAULT '[]',
    allergens JSONB DEFAULT '[]',
    nutritional_info JSONB DEFAULT '{}',
    dietary_info JSONB DEFAULT '{}',
    preparation_time INTEGER,
    calories INTEGER,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    variants JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant menu items"
    ON menu_items FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_menu_items_tenant_id ON menu_items(tenant_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Restaurant tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    location TEXT,
    status table_status DEFAULT 'available',
    qr_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, table_number)
);

ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant tables"
    ON restaurant_tables FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER update_restaurant_tables_updated_at
    BEFORE UPDATE ON restaurant_tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    preferences JSONB DEFAULT '{}',
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email),
    UNIQUE(tenant_id, phone)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant customers"
    ON customers FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    order_type TEXT DEFAULT 'dine_in',
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) DEFAULT 0 NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
    tip_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    special_instructions TEXT,
    estimated_ready_time TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, order_number)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant orders"
    ON orders FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customizations JSONB DEFAULT '{}',
    special_instructions TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access order items through orders"
    ON order_items FOR ALL
    TO public
    USING (order_id IN (
        SELECT id FROM orders 
        WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ));

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_provider TEXT,
    provider_transaction_id TEXT,
    status payment_status DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant payments"
    ON payments FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    current_stock DECIMAL(10,3) DEFAULT 0 NOT NULL,
    minimum_stock DECIMAL(10,3) DEFAULT 0 NOT NULL,
    maximum_stock DECIMAL(10,3),
    cost_per_unit DECIMAL(10,2),
    supplier_info JSONB DEFAULT '{}',
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant inventory"
    ON inventory_items FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Staff schedules table
CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 0,
    hourly_rate DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant schedules"
    ON staff_schedules FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE TRIGGER update_staff_schedules_updated_at
    BEFORE UPDATE ON staff_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their notifications"
    ON notifications FOR ALL
    TO public
    USING (user_id = auth.uid());

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant audit logs"
    ON audit_logs FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Daily sales summary table
CREATE TABLE IF NOT EXISTS daily_sales_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    top_selling_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, date)
);

ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their tenant analytics"
    ON daily_sales_summary FOR ALL
    TO public
    USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Insert sample data
INSERT INTO tenants (id, name, slug, description, phone, email) VALUES 
('tenant_123', 'Bella Vista Restaurant', 'bella-vista', 'Fine dining restaurant', '+1-555-123-4567', 'info@bellavista.com')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, tenant_id, email, first_name, last_name, role) VALUES 
('user_admin', 'tenant_123', 'admin@restaurant.com', 'Admin', 'User', 'tenant_admin'),
('user_manager', 'tenant_123', 'manager@restaurant.com', 'Manager', 'User', 'manager'),
('user_chef', 'tenant_123', 'chef@restaurant.com', 'Chef', 'User', 'staff')
ON CONFLICT (tenant_id, email) DO NOTHING;

INSERT INTO categories (id, tenant_id, name, description, sort_order) VALUES 
('cat_1', 'tenant_123', 'Appetizers', 'Start your meal with our delicious appetizers', 1),
('cat_2', 'tenant_123', 'Main Courses', 'Our signature main dishes', 2),
('cat_3', 'tenant_123', 'Desserts', 'Sweet endings to your meal', 3),
('cat_4', 'tenant_123', 'Beverages', 'Drinks and cocktails', 4)
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, cost, image_url, preparation_time, calories, is_available) VALUES 
('itm_1', 'tenant_123', 'cat_1', 'Truffle Arancini', 'Crispy risotto balls with black truffle and parmesan', 16.00, 6.50, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', 15, 280, true),
('itm_2', 'tenant_123', 'cat_1', 'Pan-Seared Scallops', 'Fresh diver scallops with cauliflower purée', 24.00, 12.00, 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400', 12, 180, true),
('itm_3', 'tenant_123', 'cat_2', 'Wagyu Beef Tenderloin', 'Premium wagyu beef with seasonal vegetables', 65.00, 28.00, 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400', 25, 420, true),
('itm_4', 'tenant_123', 'cat_2', 'Grilled Atlantic Salmon', 'Fresh salmon with herb crust and quinoa pilaf', 32.00, 14.00, 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400', 20, 350, true)
ON CONFLICT DO NOTHING;

INSERT INTO restaurant_tables (id, tenant_id, table_number, capacity, location, qr_code) VALUES 
('table_01', 'tenant_123', 'T01', 4, 'Main Hall', 'QR_T01_ABC123'),
('table_02', 'tenant_123', 'T02', 2, 'Window View', 'QR_T02_DEF456'),
('table_03', 'tenant_123', 'T03', 6, 'Private Room', 'QR_T03_GHI789'),
('table_04', 'tenant_123', 'T04', 4, 'Patio', 'QR_T04_JKL012'),
('table_05', 'tenant_123', 'T05', 8, 'Main Hall', 'QR_T05_MNO345'),
('table_06', 'tenant_123', 'T06', 4, 'Main Hall', 'QR_T06_PQR678'),
('table_07', 'tenant_123', 'T07', 2, 'Bar Area', 'QR_T07_STU901'),
('table_08', 'tenant_123', 'T08', 4, 'Garden View', 'QR_T08_VWX234'),
('table_09', 'tenant_123', 'T09', 4, 'Garden View', 'QR_T09_YZA567'),
('table_10', 'tenant_123', 'T10', 6, 'Garden View', 'QR_T10_BCD890')
ON CONFLICT (tenant_id, table_number) DO NOTHING;