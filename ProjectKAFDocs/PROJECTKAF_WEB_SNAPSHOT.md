# ProjectKAF Web Application Snapshot - Frontend Architecture Documentation

## Overview
This document provides a comprehensive snapshot of the ProjectKAF frontend application, including directory structure, tenant context implementation, and configuration files.

## Frontend Directory Structure

```
/src/
├── components/                     # Reusable UI components
│   ├── Header.tsx                 # Main navigation header
│   ├── Footer.tsx                 # Site footer
│   ├── DashboardHeader.tsx        # Admin dashboard header
│   ├── ProtectedRoute.tsx         # Route protection wrapper
│   ├── SessionCart.tsx            # Shopping cart component
│   ├── OrderSuccessModal.tsx      # Order confirmation modal
│   ├── TableSessionBadge.tsx      # Table session indicator
│   ├── ModePrompt.tsx             # Order mode selection
│   ├── JoinPinModal.tsx           # Table session PIN entry
│   ├── BrandingEditor.tsx         # Brand customization tools
│   ├── DynamicPageRenderer.tsx    # Custom page renderer
│   ├── AccessControlDashboard.tsx # Permission management
│   └── menu/                      # Menu management components
│       ├── ItemGrid.tsx           # Menu item grid display
│       ├── ItemEditor.tsx         # Menu item editor modal
│       ├── SectionList.tsx        # Menu section navigation
│       ├── SectionEditor.tsx      # Menu section editor
│       ├── MenuFilters.tsx        # Menu filtering controls
│       └── BulkUploader.tsx       # Bulk menu upload tool
├── pages/                         # Page components
│   ├── Home.tsx                   # Landing page
│   ├── Menu.tsx                   # Customer menu page
│   ├── BookTable.tsx              # Table booking interface
│   ├── Reserve.tsx                # Reservation system
│   ├── TakeAway.tsx               # Takeaway ordering
│   ├── LoginPage.tsx              # Authentication page
│   ├── Dashboard.tsx              # Main admin dashboard
│   ├── MenuManagement.tsx         # Menu administration
│   ├── OrderManagement.tsx        # Order administration
│   ├── KitchenDashboard.tsx       # Kitchen operations
│   ├── LiveOrders.tsx             # Real-time order tracking
│   ├── TableManagement.tsx        # Table administration
│   ├── StaffManagement.tsx        # Staff administration
│   ├── Analytics.tsx              # Business analytics
│   ├── Settings.tsx               # System settings
│   ├── ApplicationCustomization.tsx # Page customization
│   ├── CustomerMenu.tsx           # Customer-facing menu
│   ├── Gallery.tsx                # Photo gallery
│   ├── Events.tsx                 # Events and promotions
│   ├── Contact.tsx                # Contact information
│   └── Pages.tsx                  # Static pages
├── context/                       # React context providers
│   └── TenantContext.tsx          # Multi-tenant context
├── contexts/                      # Additional context providers
│   ├── BrandingContext.tsx        # Brand customization context
│   └── AccessControlContext.tsx   # Permission management context
├── hooks/                         # Custom React hooks
│   ├── useCustomization.ts        # Page customization hook
│   ├── useMenuManagement.ts       # Menu management hook
│   ├── useSessionManagement.ts    # Session and order management
│   ├── useAccessManagement.ts     # Access control management
│   └── useBrandingManagement.ts   # Brand asset management
├── types/                         # TypeScript type definitions
│   ├── menu.ts                    # Menu-related types
│   ├── session.ts                 # Session and order types
│   ├── access.ts                  # Access control types
│   └── customization.ts           # Customization types
├── state/                         # State management
│   └── cartStore.ts               # Shopping cart state
├── lib/                           # Utility libraries
│   ├── supabase.ts                # Supabase client
│   ├── idempotency.ts             # Idempotency helpers
│   └── qr/                        # QR code utilities
│       ├── sign.ts                # QR signing (server-side)
│       └── verify.ts              # QR verification
├── health/                        # Health monitoring
│   ├── HealthBanner.tsx           # Health status display
│   └── supabaseHealth.ts          # Database health checks
├── server/                        # Server-side utilities
│   └── routes/                    # API route handlers
│       ├── health-db.ts           # Database health endpoint
│       ├── table-session.ts       # Table session management
│       └── orders.ts              # Order processing
├── App.tsx                        # Main application component
├── main.tsx                       # Application entry point
├── index.css                      # Global styles
└── vite-env.d.ts                  # Vite environment types
```

## Tenant Context Implementation

### src/context/TenantContext.tsx
```typescript
import React, { createContext, useContext, useMemo, useState } from 'react';

type TenantState = {
  tenantCode?: string;
  tableCode?: string;
  setTenant: (t: { tenantCode?: string; tableCode?: string }) => void;
};

const Ctx = createContext<TenantState | null>(null);

export const TenantProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [tenantCode, setTenantCode] = useState<string>();
  const [tableCode, setTableCode] = useState<string>();
  
  const setTenant = ({ tenantCode, tableCode }: { tenantCode?: string; tableCode?: string }) => {
    setTenantCode(tenantCode);
    setTableCode(tableCode);
  };
  
  const value = useMemo(() => ({ tenantCode, tableCode, setTenant }), [tenantCode, tableCode]);
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTenant = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
};
```

### src/main.tsx - Application Entry Point (Updated)
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TenantProvider } from "./context/TenantContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { AccessControlProvider } from "./contexts/AccessControlContext";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <BrandingProvider tenantId="tenant_123" locationId="location_456">
          <AccessControlProvider
            tenantId="tenant_123"
            locationId="location_456"
            currentUserId="user_admin"
          >
            <App />
          </AccessControlProvider>
        </BrandingProvider>
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: { 
    host: '0.0.0.0', 
    port: 4173,
    strictPort: false 
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### package.json (Frontend Dependencies)
```json
{
  "name": "restaurantos",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "predev": "node scripts/checkEnv.mjs dotenv_config_path=.env",
    "check:env": "node scripts/checkEnv.mjs dotenv_config_path=.env",
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "tsx server/index.ts",
    "healthz": "tsx server/index.ts",
    "test": "vitest run --reporter=dot",
    "test:watch": "vitest",
    "test:rls": "vitest run tests/rls.spec.ts --reporter=dot",
    "test:table": "vitest run tests/table-session.spec.ts --reporter=dot",
    "test:ui": "vitest run tests/ui/**/*.spec.ts tests/ui/**/*.spec.tsx --reporter=dot",
    "test:orders": "vitest run tests/orders.spec.ts --reporter=dot",
    "test:all": "vitest run --reporter=dot"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.56.0",
    "bcryptjs": "^3.0.2",
    "date-fns": "^3.6.0",
    "dotenv": "^17.2.1",
    "fastify": "^5.5.0",
    "fastify-plugin": "^5.0.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.441.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "tsx": "^4.20.5",
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^24.3.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "jsdom": "^26.1.0",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.3",
    "vite": "^5.4.1",
    "vitest": "^3.2.4"
  }
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "noEmitOnError": false
  },
  "include": [
    "src",
    "vitest.config.ts"
  ],
  "references": [
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

## Key Frontend Features

### Multi-Tenant Context
- **TenantProvider**: Global tenant state management
- **Tenant isolation**: Ensures data separation
- **Table context**: QR code table association
- **Session management**: Persistent tenant sessions

### State Management
- **React Context**: For global state (tenant, branding, access control)
- **Local State**: Component-specific state with hooks
- **Cart Store**: Shopping cart with tenant/session scoping
- **Real-time Sync**: Supabase subscriptions for live updates

### Component Architecture
- **Page Components**: Full-page views with routing
- **Layout Components**: Headers, footers, navigation
- **Feature Components**: Business logic components
- **UI Components**: Reusable interface elements
- **Modal Components**: Overlay dialogs and forms

### Routing Structure
```typescript
// Main application routes
const routes = [
  { path: "/", component: "Home" },
  { path: "/menu", component: "Menu" },
  { path: "/book-table", component: "BookTable" },
  { path: "/reserve", component: "Reserve" },
  { path: "/take-away", component: "TakeAway" },
  { path: "/live-orders", component: "LiveOrders" },
  { path: "/gallery", component: "Gallery" },
  { path: "/events", component: "Events" },
  { path: "/contact", component: "Contact" },
  
  // Protected admin routes
  { path: "/login", component: "LoginPage" },
  { path: "/dashboard", component: "Dashboard", protected: true },
  { path: "/admin/menu", component: "MenuManagement", protected: true },
  { path: "/orders", component: "OrderManagement", protected: true },
  { path: "/kitchen-dashboard", component: "KitchenDashboard", protected: true },
  { path: "/table-management", component: "TableManagement", protected: true },
  { path: "/staff-management", component: "StaffManagement", protected: true },
  { path: "/analytics", component: "Analytics", protected: true },
  { path: "/settings", component: "Settings", protected: true },
  { path: "/application-customization", component: "ApplicationCustomization", protected: true },
  { path: "/customer-menu", component: "CustomerMenu" }
];
```

### Styling System
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable style classes
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Theme switching capability
- **Animation System**: Smooth transitions and micro-interactions

## Tenant Context Integration

### Context Provider Setup
```typescript
// Wrapping the entire application with tenant context
<TenantProvider>
  <BrandingProvider tenantId="tenant_123" locationId="location_456">
    <AccessControlProvider
      tenantId="tenant_123"
      locationId="location_456"
      currentUserId="user_admin"
    >
      <App />
    </AccessControlProvider>
  </BrandingProvider>
</TenantProvider>
```

### Usage in Components
```typescript
// Example usage in a component
import { useTenant } from '../context/TenantContext';

function MyComponent() {
  const { tenantCode, tableCode, setTenant } = useTenant();
  
  // Component logic using tenant context
  useEffect(() => {
    if (tenantCode) {
      // Load tenant-specific data
      loadTenantData(tenantCode);
    }
  }, [tenantCode]);
  
  return (
    <div>
      {tenantCode && <p>Current Tenant: {tenantCode}</p>}
      {tableCode && <p>Current Table: {tableCode}</p>}
    </div>
  );
}
```

## Environment Configuration

### Environment Variables (Frontend)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_NAME=RestaurantOS
VITE_TENANT_ID=tenant_123
VITE_LOCATION_ID=location_456

# Payment Integration
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Development
PORT=5173
```

### Environment Type Definitions
```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly STRIPE_PUBLIC_KEY: string
  readonly STRIPE_SECRET_KEY: string
  readonly PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Build Configuration

### Vite Configuration Features
- **React Plugin**: Fast refresh and JSX support
- **TypeScript Support**: Full TypeScript integration
- **Development Server**: Hot module replacement
- **Build Optimization**: Code splitting and minification
- **Preview Server**: Production build testing

### PostCSS Configuration
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Testing Configuration

### Vitest Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  projects: [
    {
      name: 'api',
      test: {
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        include: ['tests/table-session.spec.ts', 'tests/orders.spec.ts'],
        environment: 'node',
        setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'],
        isolate: true,
        clearMocks: true,
      },
    },
    {
      name: 'ui',
      test: {
        reporters: ['dot'],
        hookTimeout: 30_000,
        testTimeout: 30_000,
        include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
        environment: 'jsdom',
        environmentOptions: { jsdom: { url: 'http://localhost' } },
        setupFiles: ['tests/loadEnv.ts', 'tests/ui/setupJSDOM.ts'],
        isolate: true,
        clearMocks: true,
      },
    },
  ],
});
```

## Key Implementation Details

### Real-Time Integration
```typescript
// Supabase real-time subscriptions
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `tenant_id=eq.${tenantId}`
  }, (payload) => {
    handleOrderUpdate(payload);
  })
  .subscribe();
```

### Authentication Integration
```typescript
// Supabase auth integration
const { data: { user }, error } = await supabase.auth.getUser();
if (user) {
  // User is authenticated
  setCurrentUser(user);
}
```

### Error Handling
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    // Send to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Performance Optimizations

### Code Splitting
- **Route-based splitting**: Each page loads independently
- **Component lazy loading**: Large components load on demand
- **Dynamic imports**: Third-party libraries loaded when needed

### Caching Strategy
- **Browser caching**: Static assets with long cache headers
- **Service worker**: Offline capability for PWA features
- **Memory caching**: Frequently accessed data cached in memory

### Bundle Optimization
- **Tree shaking**: Unused code elimination
- **Minification**: Production code compression
- **Asset optimization**: Image and font optimization

## Security Features

### Client-Side Security
- **Environment variable validation**: Required variables checked at startup
- **Input sanitization**: All user inputs validated
- **XSS protection**: Proper HTML escaping
- **CSRF protection**: Token-based request validation

### Authentication Security
- **JWT token management**: Secure token storage and refresh
- **Route protection**: Authenticated routes properly guarded
- **Role-based access**: Component-level permission checks
- **Session management**: Secure session handling

## Development Workflow

### Development Scripts
```bash
# Environment validation
npm run check:env

# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run all tests
npm run test:all

# Run specific test suites
npm run test:ui
npm run test:rls
npm run test:orders
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates

---

**The frontend application provides a modern, scalable foundation for multi-tenant restaurant management with excellent user experience, performance optimization, and security features.**