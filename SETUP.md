# RestaurantOS Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase account (free tier works)

### 1. Clone Repository
```bash
git clone https://github.com/Khaja-a173/ProjectKAF.git
cd ProjectKAF
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to be ready (2-3 minutes)

#### Get Your Credentials
1. Go to Project Settings → API
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

#### Setup Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy the entire content from `supabase/migrations/create_complete_restaurant_schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in Table Editor

### 4. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Start Development Server
```bash
npm run dev
```

## 🔧 Environment Variables

### Required Variables
```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application (REQUIRED)
VITE_TENANT_ID=tenant_123
VITE_LOCATION_ID=location_456
```

### Optional Variables
```env
# Development
VITE_DEV_MODE=true
VITE_API_BASE_URL=http://localhost:3000

# Analytics (Optional)
VITE_ANALYTICS_ID=your_analytics_id

# Error Tracking (Optional)
VITE_SENTRY_DSN=your_sentry_dsn
```

## 📱 Testing the Application

### 1. Access Customer Interface
- **Home Page**: `http://localhost:5173/`
- **Menu**: `http://localhost:5173/menu`
- **Book Table**: `http://localhost:5173/book-table`

### 2. Test Table Ordering Flow
1. Go to **Book Table** page
2. **Scan QR** (simulated) or **Select Table** from layout
3. **Menu Page** opens with selected table
4. **Add items** to cart
5. **Place Order** → Order appears in all dashboards

### 3. Access Admin Dashboards
- **Login**: `http://localhost:5173/login`
- **Dashboard**: `http://localhost:5173/dashboard`
- **Live Orders**: `http://localhost:5173/live-orders`
- **Kitchen**: `http://localhost:5173/kitchen-dashboard`
- **Order Management**: `http://localhost:5173/orders`

### 4. Demo Credentials
```
Admin: admin@restaurant.com / admin123
Manager: manager@restaurant.com / manager123
Chef: chef@restaurant.com / chef123
```

## 🔄 Real-time Features

### Order Flow Testing
1. **Customer Places Order** → Appears in "Order Placed" section
2. **Kitchen Confirms** → Moves to "Preparing" section
3. **Kitchen Marks Ready** → Moves to "Ready" section
4. **Staff Delivers** → Moves to "Out for Delivery" section
5. **Mark Served** → Moves to "Served" section
6. **Process Payment** → Moves to "Completed" section

### Live Updates
- **All dashboards sync in real-time**
- **Table-specific orders** track correctly
- **Status changes** propagate instantly

## 🗄️ Database Schema

### Core Tables
- `tenants` - Restaurant locations
- `users` - Staff and admin users
- `menu_items` - Menu with categories
- `restaurant_tables` - Physical tables
- `orders` - Customer orders
- `order_items` - Individual order items
- `payments` - Payment records

### Features
- **Multi-tenant**: Isolated data per restaurant
- **Row Level Security**: Secure data access
- **Real-time**: Live updates via Supabase
- **Audit Trail**: Complete activity logging

## 🚨 Troubleshooting

### Common Issues

#### 1. Supabase Connection Error
```
Error: Missing Supabase environment variables
```
**Solution**: Check your `.env` file has correct Supabase URL and key

#### 2. Database Schema Missing
```
Error: relation "orders" does not exist
```
**Solution**: Run the SQL migration script in Supabase SQL Editor

#### 3. RLS Policy Error
```
Error: new row violates row-level security policy
```
**Solution**: Ensure you're using the correct tenant_id in your queries

#### 4. Build Errors
```
Error: Cannot resolve module
```
**Solution**: Run `npm install` to ensure all dependencies are installed

### Getting Help
1. Check browser console for detailed errors
2. Verify Supabase project is active
3. Ensure all environment variables are set
4. Check network tab for API call failures

## 📊 Features Overview

### Customer Features
- **QR Code Ordering**: Scan table QR to start ordering
- **Real-time Menu**: Live menu with availability
- **Order Tracking**: Track order status in real-time
- **Table Sessions**: Persistent cart per table

### Staff Features
- **Order Management**: Confirm, prepare, serve orders
- **Kitchen Dashboard**: Real-time kitchen operations
- **Table Management**: Manage table status and sessions
- **Live Orders**: Track all orders across restaurant

### Admin Features
- **Menu Management**: Add/edit menu items and categories
- **Staff Management**: User roles and permissions
- **Analytics**: Sales reports and insights
- **Customization**: Brand and page customization

## 🔐 Security Features
- **Row Level Security**: Tenant data isolation
- **Role-based Access**: Granular permissions
- **Audit Logging**: Complete activity trail
- **Secure Authentication**: Supabase Auth integration

---

## 🎯 Ready for Production

The application is now **100% functional** with:
- ✅ **Real-time order management**
- ✅ **Table-specific ordering**
- ✅ **Vertical dashboard layouts**
- ✅ **Professional headers**
- ✅ **Complete database schema**
- ✅ **Comprehensive documentation**

**Start the application and test the complete order flow!**