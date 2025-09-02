# RestaurantOS Testing Guide

## 🧪 Complete Testing Documentation

### Testing Overview
This guide provides comprehensive testing instructions for RestaurantOS, covering all features, user flows, and edge cases.

---

## 🎯 Test Scenarios

### 1. **Customer Order Flow Testing**

#### Scenario A: QR Code Ordering
```
1. Navigate to /book-table
2. Click "Start Scanning" button
3. Wait for simulated QR scan (2 seconds)
4. Verify redirect to /menu?table=T## (random table)
5. Verify table number displays in hero section
6. Add items to cart
7. Place order
8. Verify order appears in Live Orders with correct table
```

#### Scenario B: Manual Table Selection
```
1. Navigate to /book-table
2. Click "Check Availability & View Menu"
3. Select any available table from grid
4. Verify redirect to /menu?table=T##&source=layout
5. Verify "Table Selected" badge appears
6. Complete order flow
7. Verify table-specific order tracking
```

#### Scenario C: Menu Browsing
```
1. Navigate to /menu (without table)
2. Browse menu categories
3. Search for specific items
4. Filter by dietary preferences
5. Verify all items display correctly
6. Test responsive design on mobile
```

### 2. **Staff Dashboard Testing**

#### Kitchen Dashboard Flow
```
1. Login with chef@restaurant.com / chef123
2. Navigate to /kitchen-dashboard
3. Verify VERTICAL layout (sections stack vertically)
4. Place test order from customer menu
5. Verify order appears in "Order Placed" section
6. Click "Start All" to move to "Preparing"
7. Click "Mark Ready" to move to "Ready"
8. Click "Send Out" to move to "Out for Delivery"
9. Verify real-time updates across all dashboards
```

#### Order Management Flow
```
1. Login with manager@restaurant.com / manager123
2. Navigate to /orders
3. Verify orders display with correct table numbers
4. Test order status updates
5. Test staff assignment functionality
6. Test payment processing
7. Verify orders move to archived section
```

#### Live Orders Tracking
```
1. Navigate to /live-orders
2. Verify VERTICAL section layout
3. Place test order from customer interface
4. Verify order appears in correct section
5. Update order status from kitchen dashboard
6. Verify order moves between sections vertically
7. Test search and filter functionality
```

### 3. **Admin Dashboard Testing**

#### Menu Management
```
1. Login with admin@restaurant.com / admin123
2. Navigate to /admin/menu
3. Create new menu section
4. Add menu items to section
5. Test bulk upload functionality
6. Update item availability
7. Verify changes reflect on customer menu
```

#### Staff Management
```
1. Navigate to /staff-management
2. View staff directory
3. Test role assignments
4. Test permission management
5. Test user status changes
6. Verify access control works
```

#### Application Customization
```
1. Navigate to /application-customization
2. Test page editor functionality
3. Test branding asset uploads
4. Test theme customization
5. Publish changes
6. Verify changes appear on customer pages
```

---

## 🔍 Detailed Test Cases

### Database Integration Tests

#### Test 1: Order Creation
```sql
-- Verify order is created with correct tenant isolation
SELECT * FROM orders 
WHERE tenant_id = 'tenant_123' 
AND order_number = 'test_order';

-- Verify order items are linked correctly
SELECT oi.*, mi.name 
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE oi.order_id = 'test_order_id';
```

#### Test 2: Real-time Updates
```typescript
// Test real-time subscription
const testRealtime = async () => {
  let updateReceived = false
  
  // Subscribe to changes
  const subscription = supabase
    .channel('test')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders'
    }, () => {
      updateReceived = true
    })
    .subscribe()
  
  // Make a change
  await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', testOrderId)
  
  // Wait for update
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Verify update received
  expect(updateReceived).toBe(true)
}
```

### User Interface Tests

#### Test 1: Responsive Design
```typescript
// Test different screen sizes
const screenSizes = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1920, height: 1080, name: 'Desktop' }
]

screenSizes.forEach(size => {
  test(`should render correctly on ${size.name}`, () => {
    // Set viewport size
    cy.viewport(size.width, size.height)
    
    // Test key elements
    cy.visit('/menu')
    cy.get('[data-testid="menu-grid"]').should('be.visible')
    cy.get('[data-testid="cart-sidebar"]').should('be.visible')
  })
})
```

#### Test 2: Accessibility
```typescript
// Test keyboard navigation
test('should be keyboard accessible', () => {
  cy.visit('/menu')
  
  // Tab through interactive elements
  cy.get('body').tab()
  cy.focused().should('have.attr', 'data-testid', 'search-input')
  
  cy.focused().tab()
  cy.focused().should('have.attr', 'data-testid', 'category-filter')
  
  // Test ARIA labels
  cy.get('[aria-label="Add to cart"]').should('exist')
  cy.get('[aria-label="Remove from cart"]').should('exist')
})
```

### Performance Tests

#### Test 1: Page Load Performance
```typescript
// Test Core Web Vitals
test('should meet performance targets', () => {
  cy.visit('/menu')
  
  // First Contentful Paint < 1.5s
  cy.window().its('performance').then(performance => {
    const fcp = performance.getEntriesByType('paint')
      .find(entry => entry.name === 'first-contentful-paint')
    expect(fcp.startTime).to.be.lessThan(1500)
  })
  
  // Largest Contentful Paint < 2.5s
  cy.window().its('performance').then(performance => {
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0]
    expect(lcp.startTime).to.be.lessThan(2500)
  })
})
```

#### Test 2: Real-time Performance
```typescript
// Test real-time update latency
test('should update in real-time', async () => {
  const startTime = Date.now()
  let updateReceived = false
  
  // Subscribe to updates
  const subscription = supabase
    .channel('performance-test')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders'
    }, () => {
      updateReceived = true
      const latency = Date.now() - startTime
      expect(latency).toBeLessThan(1000) // < 1 second
    })
    .subscribe()
  
  // Trigger update
  await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', testOrderId)
  
  // Wait for update
  await waitFor(() => updateReceived)
})
```

---

## 🔧 Test Data Setup

### Sample Data Creation

#### Create Test Tenant
```sql
INSERT INTO tenants (id, name, slug, email, phone) VALUES
('tenant_test', 'Test Restaurant', 'test-restaurant', 'test@restaurant.com', '+1234567890');
```

#### Create Test Users
```sql
INSERT INTO users (id, tenant_id, email, first_name, last_name, role) VALUES
('user_test_admin', 'tenant_test', 'admin@test.com', 'Test', 'Admin', 'tenant_admin'),
('user_test_manager', 'tenant_test', 'manager@test.com', 'Test', 'Manager', 'manager'),
('user_test_chef', 'tenant_test', 'chef@test.com', 'Test', 'Chef', 'staff');
```

#### Create Test Menu
```sql
-- Create category
INSERT INTO categories (id, tenant_id, name, description) VALUES
('cat_test', 'tenant_test', 'Test Items', 'Test menu items');

-- Create menu items
INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available) VALUES
('item_test_1', 'tenant_test', 'cat_test', 'Test Burger', 'Delicious test burger', 15.99, true),
('item_test_2', 'tenant_test', 'cat_test', 'Test Salad', 'Fresh test salad', 12.99, true);
```

#### Create Test Tables
```sql
INSERT INTO restaurant_tables (id, tenant_id, table_number, capacity, status, qr_code) VALUES
('table_test_1', 'tenant_test', 'T01', 4, 'available', 'QR_TEST_T01'),
('table_test_2', 'tenant_test', 'T02', 2, 'available', 'QR_TEST_T02');
```

---

## 🚨 Error Testing

### Error Scenarios

#### Test 1: Network Failures
```typescript
// Test offline functionality
test('should handle network failures gracefully', () => {
  // Simulate network failure
  cy.intercept('POST', '**/rest/v1/orders', { forceNetworkError: true })
  
  // Attempt to place order
  cy.get('[data-testid="place-order"]').click()
  
  // Verify error handling
  cy.get('[data-testid="error-message"]')
    .should('contain', 'Network error')
  
  // Verify retry functionality
  cy.get('[data-testid="retry-button"]').should('be.visible')
})
```

#### Test 2: Invalid Data
```typescript
// Test form validation
test('should validate form inputs', () => {
  cy.visit('/admin/menu')
  
  // Try to create item without required fields
  cy.get('[data-testid="add-item"]').click()
  cy.get('[data-testid="save-item"]').click()
  
  // Verify validation errors
  cy.get('[data-testid="name-error"]')
    .should('contain', 'Name is required')
  cy.get('[data-testid="price-error"]')
    .should('contain', 'Price must be greater than 0')
})
```

#### Test 3: Permission Errors
```typescript
// Test access control
test('should enforce permissions', () => {
  // Login as staff user
  cy.login('staff@restaurant.com', 'staff123')
  
  // Try to access admin-only page
  cy.visit('/admin/menu')
  
  // Verify access denied
  cy.get('[data-testid="access-denied"]')
    .should('contain', 'Access Denied')
  
  // Verify redirect to dashboard
  cy.url().should('include', '/dashboard')
})
```

---

## 📊 Test Automation

### Continuous Integration

#### GitHub Actions Workflow
```yaml
name: Test and Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Build application
        run: npm run build
```

#### Test Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "type-check": "tsc --noEmit"
  }
}
```

### Load Testing

#### Performance Test Script
```typescript
// Load test with Artillery
const loadTest = {
  config: {
    target: 'https://your-app.com',
    phases: [
      { duration: 60, arrivalRate: 10 }, // Ramp up
      { duration: 300, arrivalRate: 50 }, // Sustained load
      { duration: 60, arrivalRate: 10 }  // Ramp down
    ]
  },
  scenarios: [
    {
      name: 'Customer order flow',
      weight: 70,
      flow: [
        { get: { url: '/menu?table=T01' } },
        { post: { url: '/api/cart/add', json: { itemId: 'item_1', quantity: 2 } } },
        { post: { url: '/api/orders', json: { tableId: 'T01' } } }
      ]
    },
    {
      name: 'Staff dashboard',
      weight: 30,
      flow: [
        { get: { url: '/orders' } },
        { get: { url: '/kitchen-dashboard' } },
        { patch: { url: '/api/orders/{{orderId}}', json: { status: 'confirmed' } } }
      ]
    }
  ]
}
```

---

## 🔍 Manual Testing Checklist

### Customer Interface Testing

#### Home Page (`/`)
- [ ] Hero section loads correctly
- [ ] Navigation menu works
- [ ] Featured dishes display
- [ ] Contact information accurate
- [ ] Call-to-action buttons functional
- [ ] Mobile responsive design
- [ ] Page load time < 3 seconds

#### Menu Page (`/menu`)
- [ ] QR code integration works
- [ ] Table selection functions
- [ ] Menu items load correctly
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Dietary filters work
- [ ] Add to cart functions
- [ ] Cart updates in real-time
- [ ] Order placement works
- [ ] Table-specific orders track correctly

#### Book Table Page (`/book-table`)
- [ ] QR scanner simulation works
- [ ] Table layout displays
- [ ] Table selection works
- [ ] Reservation form validates
- [ ] Confirmation system works
- [ ] Email notifications sent
- [ ] Redirect to menu works

#### Live Orders Page (`/live-orders`)
- [ ] **VERTICAL layout** (sections stack vertically)
- [ ] Real-time order updates
- [ ] Order status progression
- [ ] Search and filter work
- [ ] Order details display
- [ ] Estimated times show
- [ ] Customer notifications work

### Staff Dashboard Testing

#### Dashboard Overview (`/dashboard`)
- [ ] **DashboardHeader** displays correctly
- [ ] User switcher works for testing
- [ ] Stats cards show correct data
- [ ] Quick actions work
- [ ] Recent orders display
- [ ] Performance metrics accurate
- [ ] Navigation links work

#### Kitchen Dashboard (`/kitchen-dashboard`)
- [ ] **DashboardHeader** with user switcher
- [ ] **VERTICAL layout** (sections stack vertically)
- [ ] Order queue displays correctly
- [ ] Station filtering works
- [ ] Order actions function
- [ ] Real-time updates work
- [ ] Timer integration works
- [ ] AI insights display

#### Order Management (`/orders`)
- [ ] **DashboardHeader** with user switcher
- [ ] Order list displays
- [ ] Status filters work
- [ ] Order actions function
- [ ] Staff assignment works
- [ ] Payment processing works
- [ ] Archive functionality works

#### Table Management (`/table-management`)
- [ ] **DashboardHeader** displays
- [ ] Floor layout shows
- [ ] Table status updates
- [ ] Session management works
- [ ] Analytics display
- [ ] Settings configuration

#### Staff Management (`/staff-management`)
- [ ] **DashboardHeader** displays
- [ ] Staff directory loads
- [ ] Role assignments work
- [ ] Permission management functions
- [ ] User status changes work
- [ ] Invite system works

### Admin Dashboard Testing

#### Menu Management (`/admin/menu`)
- [ ] **DashboardHeader** displays
- [ ] Section management works
- [ ] Item CRUD operations work
- [ ] Bulk upload functions
- [ ] Real-time sync works
- [ ] Image upload works

#### Analytics (`/analytics`)
- [ ] **DashboardHeader** displays
- [ ] Metrics display correctly
- [ ] Charts render properly
- [ ] Date filtering works
- [ ] Export functionality works
- [ ] Real-time updates work

#### Application Customization (`/application-customization`)
- [ ] **DashboardHeader** displays
- [ ] Page editor works
- [ ] Section management functions
- [ ] Branding tools work
- [ ] Asset management works
- [ ] Publishing system works

#### Settings (`/settings`)
- [ ] **DashboardHeader** displays
- [ ] General settings work
- [ ] Access control functions
- [ ] Notification settings work
- [ ] Security settings work
- [ ] Save functionality works

---

## 🔄 Real-time Testing

### Order Flow Real-time Testing

#### Test Setup
```typescript
// Open multiple browser windows/tabs
// Window 1: Customer menu (/menu?table=T01)
// Window 2: Kitchen dashboard (/kitchen-dashboard)
// Window 3: Live orders (/live-orders)
// Window 4: Order management (/orders)
```

#### Test Execution
```
1. Customer (Window 1): Add items to cart and place order
2. Verify order appears IMMEDIATELY in all other windows
3. Kitchen (Window 2): Confirm order
4. Verify status updates in Windows 3 & 4
5. Kitchen (Window 2): Start preparation
6. Verify order moves to "Preparing" section in all windows
7. Kitchen (Window 2): Mark ready
8. Verify order moves to "Ready" section in all windows
9. Staff (Window 4): Mark for delivery
10. Verify order moves to "Out for Delivery" in all windows
11. Staff (Window 4): Mark served
12. Verify order moves to "Served" section
13. Staff (Window 4): Process payment
14. Verify order moves to "Completed" section
```

### Expected Results
- [ ] **Instant Updates**: Changes appear within 1 second
- [ ] **Consistent State**: All windows show same data
- [ ] **Vertical Layout**: Live Orders and Kitchen use vertical sections
- [ ] **Table Tracking**: Correct table number throughout flow
- [ ] **Status Progression**: Orders move through correct sequence

---

## 🐛 Bug Testing

### Common Bug Scenarios

#### Test 1: Concurrent Order Updates
```
1. Open kitchen dashboard in two browser windows
2. Place test order
3. Simultaneously click "Confirm" in both windows
4. Verify only one confirmation processes
5. Verify no duplicate status updates
6. Verify error handling for second click
```

#### Test 2: Cart Persistence
```
1. Add items to cart on menu page
2. Refresh browser
3. Verify cart items persist
4. Navigate away and back
5. Verify cart still contains items
6. Clear browser storage
7. Verify cart resets appropriately
```

#### Test 3: Permission Edge Cases
```
1. Login as staff user
2. Navigate to allowed page
3. Have admin change user permissions
4. Attempt to access now-restricted page
5. Verify access is properly denied
6. Verify graceful error handling
```

---

## 📱 Mobile Testing

### Mobile-Specific Tests

#### Test 1: Touch Interactions
- [ ] Tap targets are at least 44px
- [ ] Swipe gestures work (if applicable)
- [ ] Pinch-to-zoom disabled on forms
- [ ] Scroll performance is smooth
- [ ] Touch feedback is immediate

#### Test 2: Camera Integration
- [ ] QR scanner requests camera permission
- [ ] Camera preview displays correctly
- [ ] QR code detection works
- [ ] Error handling for camera failures
- [ ] Fallback to manual entry works

#### Test 3: Mobile Performance
- [ ] Page load time < 3 seconds on 3G
- [ ] Images load progressively
- [ ] Offline functionality works
- [ ] App-like experience (PWA)
- [ ] Battery usage is reasonable

---

## 🔐 Security Testing

### Authentication Testing

#### Test 1: Login Security
```
1. Test with valid credentials
2. Test with invalid credentials
3. Test with expired tokens
4. Test with malformed tokens
5. Test session timeout
6. Test concurrent sessions
```

#### Test 2: Authorization Testing
```
1. Test role-based access control
2. Test tenant data isolation
3. Test permission inheritance
4. Test temporary access grants
5. Test permission revocation
6. Test privilege escalation attempts
```

### Data Security Testing

#### Test 1: SQL Injection Prevention
```sql
-- Test malicious input
'; DROP TABLE orders; --
' OR '1'='1
<script>alert('xss')</script>
```

#### Test 2: Cross-Tenant Access
```
1. Login as tenant A user
2. Attempt to access tenant B data
3. Verify access is denied
4. Test API endpoints with different tenant IDs
5. Verify RLS policies prevent access
```

---

## 📈 Performance Benchmarks

### Target Metrics

#### Page Performance
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **First Input Delay**: < 100 milliseconds
- **Cumulative Layout Shift**: < 0.1

#### API Performance
- **Database Queries**: < 100ms average
- **Real-time Updates**: < 1 second latency
- **File Uploads**: < 5 seconds for 5MB
- **Search Queries**: < 200ms response time

#### User Experience
- **Order Placement**: < 30 seconds end-to-end
- **Status Updates**: < 1 second propagation
- **Page Navigation**: < 500ms transition
- **Error Recovery**: < 3 seconds to retry

---

## 🎯 Test Results Documentation

### Test Report Template

#### Test Execution Summary
```
Test Date: [Date]
Environment: [Production/Staging/Development]
Tester: [Name]
Browser: [Chrome/Firefox/Safari/Edge]
Device: [Desktop/Mobile/Tablet]

Total Tests: [Number]
Passed: [Number]
Failed: [Number]
Skipped: [Number]

Pass Rate: [Percentage]
```

#### Failed Test Details
```
Test Case: [Test Name]
Expected Result: [What should happen]
Actual Result: [What actually happened]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Error Messages: [Any error messages]
Screenshots: [Attach screenshots]
Priority: [High/Medium/Low]
Assigned To: [Developer name]
```

---

## 🔄 Regression Testing

### Regression Test Suite

#### Core Functionality Tests
- [ ] User authentication and authorization
- [ ] Menu browsing and ordering
- [ ] Real-time order tracking
- [ ] Kitchen operations
- [ ] Payment processing
- [ ] Staff management
- [ ] Analytics and reporting

#### Integration Tests
- [ ] Database operations
- [ ] Real-time subscriptions
- [ ] External API integrations
- [ ] Email/SMS notifications
- [ ] File upload/download
- [ ] Search functionality

#### UI/UX Tests
- [ ] Responsive design
- [ ] Accessibility compliance
- [ ] Cross-browser compatibility
- [ ] Performance benchmarks
- [ ] Error handling
- [ ] Loading states

---

## 📋 Test Environment Setup

### Local Testing Environment

#### Prerequisites
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
npm install --save-dev cypress @cypress/react
```

#### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
})
```

#### Test Database Setup
```sql
-- Create test database
CREATE DATABASE restaurantos_test;

-- Run migrations
\i supabase/migrations/create_complete_restaurant_schema.sql

-- Insert test data
\i test/fixtures/test_data.sql
```

---

## 🎯 Quality Assurance

### QA Process

#### Pre-Release Checklist
- [ ] All automated tests pass
- [ ] Manual testing completed
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing done
- [ ] Mobile testing completed
- [ ] Documentation updated

#### Release Criteria
- [ ] Zero critical bugs
- [ ] < 5 minor bugs
- [ ] Performance targets met
- [ ] Security requirements satisfied
- [ ] User acceptance testing passed
- [ ] Stakeholder approval received

---

*This testing guide ensures comprehensive coverage of all RestaurantOS features and maintains high quality standards throughout development and deployment.*