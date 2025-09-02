# RestaurantOS API Documentation

## 🔌 API Overview

RestaurantOS uses **Supabase** as the primary backend, providing:
- **Auto-generated REST API** from database schema
- **Real-time subscriptions** via WebSocket
- **Row Level Security** for tenant isolation
- **Built-in authentication** with JWT tokens

---

## 🔐 Authentication

### Login Endpoint
```typescript
// POST /auth/v1/token
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@restaurant.com',
  password: 'password'
})

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@restaurant.com",
    "user_metadata": {
      "tenant_id": "tenant_123",
      "role": "manager"
    }
  }
}
```

### Authorization Header
```typescript
// All API requests require authorization
headers: {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
}
```

---

## 📋 Menu Management API

### Get Menu Items
```typescript
// GET /rest/v1/menu_items
const { data, error } = await supabase
  .from('menu_items')
  .select(`
    *,
    categories (
      id,
      name,
      description
    )
  `)
  .eq('tenant_id', tenantId)
  .eq('is_available', true)
  .order('sort_order')

// Response
[
  {
    "id": "uuid",
    "name": "Grilled Salmon",
    "description": "Fresh Atlantic salmon with herbs",
    "price": 28.00,
    "cost": 12.00,
    "image_url": "https://...",
    "preparation_time": 20,
    "is_available": true,
    "categories": {
      "name": "Main Courses"
    }
  }
]
```

### Create Menu Item
```typescript
// POST /rest/v1/menu_items
const { data, error } = await supabase
  .from('menu_items')
  .insert({
    tenant_id: tenantId,
    category_id: categoryId,
    name: 'New Dish',
    description: 'Delicious new dish',
    price: 25.00,
    cost: 10.00,
    is_available: true
  })
  .select()
```

### Update Menu Item
```typescript
// PATCH /rest/v1/menu_items
const { data, error } = await supabase
  .from('menu_items')
  .update({
    price: 30.00,
    is_available: false
  })
  .eq('id', itemId)
  .eq('tenant_id', tenantId)
```

---

## 🛒 Order Management API

### Create Order
```typescript
// POST /rest/v1/orders
const { data, error } = await supabase
  .from('orders')
  .insert({
    tenant_id: tenantId,
    table_id: tableId,
    order_number: generateOrderNumber(),
    order_type: 'dine_in',
    status: 'pending',
    subtotal: 45.00,
    tax_amount: 3.60,
    total_amount: 48.60,
    special_instructions: 'No onions please'
  })
  .select()

// Then create order items
const { data: items, error: itemsError } = await supabase
  .from('order_items')
  .insert([
    {
      order_id: orderId,
      menu_item_id: 'item_1',
      quantity: 2,
      unit_price: 15.00,
      total_price: 30.00
    },
    {
      order_id: orderId,
      menu_item_id: 'item_2',
      quantity: 1,
      unit_price: 18.00,
      total_price: 18.00
    }
  ])
```

### Update Order Status
```typescript
// PATCH /rest/v1/orders
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
    estimated_ready_time: new Date(Date.now() + 20 * 60 * 1000).toISOString()
  })
  .eq('id', orderId)
  .eq('tenant_id', tenantId)
```

### Get Orders with Items
```typescript
// GET /rest/v1/orders with joins
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      menu_items (
        name,
        image_url,
        allergens,
        dietary_info
      )
    ),
    restaurant_tables (
      table_number,
      location
    ),
    customers (
      first_name,
      last_name,
      email
    )
  `)
  .eq('tenant_id', tenantId)
  .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
  .order('created_at', { ascending: false })
```

---

## 🪑 Table Management API

### Get Table Status
```typescript
// GET /rest/v1/restaurant_tables
const { data, error } = await supabase
  .from('restaurant_tables')
  .select('*')
  .eq('tenant_id', tenantId)
  .order('table_number')

// Response
[
  {
    "id": "uuid",
    "table_number": "T01",
    "capacity": 4,
    "location": "Main Hall",
    "status": "available",
    "qr_code": "QR_T01_ABC123"
  }
]
```

### Update Table Status
```typescript
// PATCH /rest/v1/restaurant_tables
const { data, error } = await supabase
  .from('restaurant_tables')
  .update({
    status: 'occupied'
  })
  .eq('id', tableId)
  .eq('tenant_id', tenantId)
```

---

## 👥 Staff Management API

### Get Staff Members
```typescript
// GET /rest/v1/users
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('tenant_id', tenantId)
  .eq('is_active', true)
  .order('first_name')
```

### Create Staff Member
```typescript
// POST /rest/v1/users
const { data, error } = await supabase
  .from('users')
  .insert({
    tenant_id: tenantId,
    email: 'staff@restaurant.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'staff',
    permissions: ['manage_orders', 'view_kitchen'],
    is_active: true
  })
```

---

## 📊 Analytics API

### Get Sales Summary
```typescript
// GET /rest/v1/daily_sales_summary
const { data, error } = await supabase
  .from('daily_sales_summary')
  .select('*')
  .eq('tenant_id', tenantId)
  .gte('date', startDate)
  .lte('date', endDate)
  .order('date', { ascending: false })
```

### Get Order Analytics
```typescript
// Custom analytics query
const { data, error } = await supabase
  .rpc('get_order_analytics', {
    tenant_id: tenantId,
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  })

// Response
{
  "total_orders": 1250,
  "total_revenue": 45230.50,
  "average_order_value": 36.18,
  "top_selling_items": [
    {
      "item_name": "Grilled Salmon",
      "quantity_sold": 145,
      "revenue": 4060.00
    }
  ]
}
```

---

## 🔔 Real-time Subscriptions

### Order Updates
```typescript
// Subscribe to order changes
const orderSubscription = supabase
  .channel('orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `tenant_id=eq.${tenantId}`
  }, (payload) => {
    console.log('Order update:', payload)
    handleOrderUpdate(payload)
  })
  .subscribe()
```

### Kitchen Updates
```typescript
// Subscribe to kitchen-specific updates
const kitchenSubscription = supabase
  .channel('kitchen')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'order_items',
    filter: `status=in.("preparing","ready")`
  }, (payload) => {
    updateKitchenDisplay(payload)
  })
  .subscribe()
```

### Table Status Updates
```typescript
// Subscribe to table status changes
const tableSubscription = supabase
  .channel('tables')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'restaurant_tables',
    filter: `tenant_id=eq.${tenantId}`
  }, (payload) => {
    updateFloorPlan(payload)
  })
  .subscribe()
```

---

## 🔧 Custom Database Functions

### Order Analytics Function
```sql
CREATE OR REPLACE FUNCTION get_order_analytics(
  tenant_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'total_revenue', SUM(total_amount),
    'average_order_value', AVG(total_amount),
    'top_selling_items', (
      SELECT json_agg(
        json_build_object(
          'item_name', mi.name,
          'quantity_sold', SUM(oi.quantity),
          'revenue', SUM(oi.total_price)
        )
      )
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.tenant_id = tenant_id
        AND o.created_at::date BETWEEN start_date AND end_date
      GROUP BY mi.id, mi.name
      ORDER BY SUM(oi.quantity) DESC
      LIMIT 10
    )
  ) INTO result
  FROM orders
  WHERE orders.tenant_id = tenant_id
    AND created_at::date BETWEEN start_date AND end_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Table Utilization Function
```sql
CREATE OR REPLACE FUNCTION get_table_utilization(
  tenant_id UUID,
  date DATE
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'table_number', rt.table_number,
        'capacity', rt.capacity,
        'total_sessions', COUNT(ts.id),
        'total_revenue', COALESCE(SUM(o.total_amount), 0),
        'avg_session_duration', AVG(
          EXTRACT(EPOCH FROM (ts.ended_at - ts.started_at)) / 60
        ),
        'utilization_percentage', (
          SUM(EXTRACT(EPOCH FROM (ts.ended_at - ts.started_at))) / 
          (24 * 60 * 60) * 100
        )
      )
    )
    FROM restaurant_tables rt
    LEFT JOIN table_sessions ts ON rt.id = ts.table_id 
      AND ts.started_at::date = date
    LEFT JOIN orders o ON ts.id = o.session_id
    WHERE rt.tenant_id = tenant_id
    GROUP BY rt.id, rt.table_number, rt.capacity
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🚨 Error Handling

### API Error Responses
```typescript
// Standard error format
interface APIError {
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  }
  status: number
}

// Example error responses
{
  "error": {
    "message": "Permission denied",
    "details": "User does not have access to this resource",
    "code": "INSUFFICIENT_PRIVILEGE"
  },
  "status": 403
}
```

### Error Handling Patterns
```typescript
// Async/await with error handling
try {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
  
  if (error) throw error
  
  return data
} catch (err) {
  console.error('Order creation failed:', err)
  throw new Error('Failed to create order')
}
```

---

## 📈 Rate Limiting

### API Limits
- **Authenticated Requests**: 1000 requests per minute
- **Anonymous Requests**: 100 requests per minute
- **Real-time Connections**: 100 concurrent connections
- **File Uploads**: 10 MB per file, 100 MB per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 🔍 API Testing

### Example Test Suite
```typescript
// Order creation test
describe('Order API', () => {
  test('should create order successfully', async () => {
    const orderData = {
      tenant_id: 'test_tenant',
      table_id: 'table_1',
      order_type: 'dine_in',
      total_amount: 45.00
    }
    
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
    
    expect(error).toBeNull()
    expect(data[0]).toMatchObject(orderData)
  })
})
```

---

*For complete API reference, see the auto-generated Supabase API documentation in your project dashboard.*