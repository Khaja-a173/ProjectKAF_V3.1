# ProjectKAF Environment Requirements - Complete Configuration Guide

## Overview
This document lists all environment variables required for the ProjectKAF application, including server and web components, with validation requirements and usage locations.

## Environment Variables by Scope

### 1. Server Environment Variables (Backend)

#### 1.1 Critical Variables (Required for Startup)

**SUPABASE_URL**
- **Purpose**: Supabase project URL for database connection
- **Scope**: Server
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Used in**: `server/src/plugins/supabase.ts:8`
- **Validation**: Must be valid HTTPS URL ending in `.supabase.co`
- **Critical**: ✅ Application will not start without this

**SUPABASE_SERVICE_ROLE**
- **Purpose**: Service role key for privileged database operations
- **Scope**: Server
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (masked)
- **Used in**: `server/src/plugins/supabase.ts:9`
- **Validation**: Must be valid JWT token starting with `eyJ`
- **Critical**: ✅ Database operations will fail without this
- **Security**: 🚨 NEVER expose to client-side code

**QR_SECRET**
- **Purpose**: Secret key for QR code HMAC signing
- **Scope**: Server
- **Example**: `your-super-secret-qr-signing-key-min-32-chars`
- **Used in**: `server/src/lib/qr.ts:25`, `server/src/lib/qr.ts:45`
- **Validation**: Minimum 32 characters for security
- **Critical**: ✅ QR code generation will fail without this
- **Security**: 🚨 Must be cryptographically secure random string

#### 1.2 Optional Variables (Server)

**PORT**
- **Purpose**: HTTP server port
- **Scope**: Server
- **Default**: `8080`
- **Example**: `8080`
- **Used in**: `server/src/index.ts:45`
- **Validation**: Valid port number (1-65535)

**NODE_ENV**
- **Purpose**: Environment mode for conditional logic
- **Scope**: Server
- **Default**: `development`
- **Example**: `production`
- **Used in**: `server/src/index.ts:46`, error handling logic
- **Validation**: `development` | `production` | `test`

**CORS_ORIGINS**
- **Purpose**: Allowed CORS origins (comma-separated)
- **Scope**: Server
- **Default**: `*` (allow all)
- **Example**: `http://localhost:3000,https://myapp.com`
- **Used in**: `server/src/index.ts:12`
- **Validation**: Comma-separated valid URLs

**RATE_LIMIT_MAX**
- **Purpose**: Maximum requests per window
- **Scope**: Server
- **Default**: `1000`
- **Example**: `1000`
- **Used in**: Rate limiting middleware (if implemented)
- **Validation**: Positive integer

**RATE_LIMIT_WINDOW**
- **Purpose**: Rate limiting window in milliseconds
- **Scope**: Server
- **Default**: `60000` (1 minute)
- **Example**: `60000`
- **Used in**: Rate limiting middleware (if implemented)
- **Validation**: Positive integer

### 2. Web Environment Variables (Frontend)

#### 2.1 Critical Variables (Required for Startup)

**VITE_SUPABASE_URL**
- **Purpose**: Supabase project URL for client-side database connection
- **Scope**: Web (Client-side)
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Used in**: `src/lib/supabase.ts:3`
- **Validation**: Must be valid HTTPS URL ending in `.supabase.co`
- **Critical**: ✅ Client database operations will fail without this

**VITE_SUPABASE_ANON_KEY**
- **Purpose**: Anonymous/public key for client-side Supabase access
- **Scope**: Web (Client-side)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (masked)
- **Used in**: `src/lib/supabase.ts:4`
- **Validation**: Must be valid JWT token starting with `eyJ`
- **Critical**: ✅ Client authentication will fail without this
- **Security**: ✅ Safe to expose (public key)

#### 2.2 Application Configuration

**VITE_APP_NAME**
- **Purpose**: Application display name
- **Scope**: Web
- **Default**: `RestaurantOS`
- **Example**: `RestaurantOS`
- **Used in**: Various UI components for branding
- **Validation**: Non-empty string

**VITE_TENANT_ID**
- **Purpose**: Default tenant ID for development/demo
- **Scope**: Web
- **Default**: `tenant_123`
- **Example**: `tenant_123`
- **Used in**: Multiple components as fallback tenant
- **Validation**: Valid UUID or tenant identifier

**VITE_LOCATION_ID**
- **Purpose**: Default location ID for development/demo
- **Scope**: Web
- **Default**: `location_456`
- **Example**: `location_456`
- **Used in**: Location-specific features
- **Validation**: Valid UUID or location identifier

#### 2.3 Payment Integration

**STRIPE_PUBLIC_KEY**
- **Purpose**: Stripe publishable key for payment processing
- **Scope**: Web (Client-side)
- **Example**: `pk_test_...` or `pk_live_...`
- **Used in**: Payment components (when implemented)
- **Validation**: Must start with `pk_test_` or `pk_live_`
- **Security**: ✅ Safe to expose (public key)

**STRIPE_SECRET_KEY**
- **Purpose**: Stripe secret key for server-side payment processing
- **Scope**: Server
- **Example**: `sk_test_...` or `sk_live_...` (masked)
- **Used in**: Payment processing endpoints
- **Validation**: Must start with `sk_test_` or `sk_live_`
- **Security**: 🚨 NEVER expose to client-side code

#### 2.4 Development Variables

**PORT**
- **Purpose**: Development server port
- **Scope**: Web (Development)
- **Default**: `5173`
- **Example**: `5173`
- **Used in**: `vite.config.ts:11`
- **Validation**: Valid port number (1-65535)

### 3. Shared Variables

**JWT_SECRET**
- **Purpose**: JWT token signing secret (if using custom auth)
- **Scope**: Server
- **Example**: `your-jwt-secret-key-min-32-characters`
- **Used in**: Authentication middleware
- **Validation**: Minimum 32 characters
- **Security**: 🚨 Must be cryptographically secure

## Environment Validation

### Startup Validation Script
```javascript
// scripts/checkEnv.mjs
import { config as loadEnv } from 'dotenv';

const argPath = process.argv
  .find((a) => a.startsWith('dotenv_config_path='))
  ?.split('=')[1] ?? '.env';

loadEnv({ path: argPath });

// Required vars for ProjectKAF
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
  'JWT_SECRET',
  'QR_SECRET',
  'SUPABASE_SERVICE_ROLE',
];

// Validate presence (non-empty)
const missing = requiredEnvVars.filter((k) => {
  const v = process.env[k];
  return v === undefined || v === null || String(v).trim() === '';
});

if (missing.length) {
  console.error('❌ Missing required environment variables:');
  for (const k of missing) console.error('  - ' + k);
  process.exit(1);
}

console.log('✅ ENV OK');
```

### Runtime Validation
```typescript
// Environment validation in application code
function validateEnvironment() {
  const required = {
    server: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE', 'QR_SECRET'],
    web: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  };
  
  const missing: string[] = [];
  
  // Check server variables (if running server)
  if (typeof process !== 'undefined') {
    required.server.forEach(key => {
      if (!process.env[key]) missing.push(key);
    });
  }
  
  // Check web variables (if running in browser)
  if (typeof window !== 'undefined') {
    required.web.forEach(key => {
      if (!import.meta.env[key]) missing.push(key);
    });
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

## Security Considerations

### Variable Classification

#### 🔴 **NEVER EXPOSE TO CLIENT** (Server-only)
- `SUPABASE_SERVICE_ROLE` - Full database access
- `QR_SECRET` - QR code signing key
- `STRIPE_SECRET_KEY` - Payment processing secret
- `JWT_SECRET` - Token signing secret

#### 🟡 **CLIENT-SAFE** (Can be exposed)
- `VITE_SUPABASE_URL` - Public Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Public/anonymous key
- `STRIPE_PUBLIC_KEY` - Stripe publishable key
- `VITE_APP_NAME` - Application name

#### 🟢 **CONFIGURATION** (Environment-specific)
- `PORT` - Server/client ports
- `NODE_ENV` - Environment mode
- `CORS_ORIGINS` - CORS configuration

### Best Practices

#### Secret Management
```typescript
// ✅ Good: Server-side secret usage
const secret = process.env.QR_SECRET;
if (!secret) throw new Error('QR_SECRET required');

// ❌ Bad: Exposing secrets to client
const clientSecret = import.meta.env.VITE_SECRET_KEY; // DON'T DO THIS
```

#### Environment Separation
```env
# Development (.env.local)
VITE_SUPABASE_URL=https://dev-project.supabase.co
STRIPE_PUBLIC_KEY=pk_test_...

# Production (.env.production)
VITE_SUPABASE_URL=https://prod-project.supabase.co
STRIPE_PUBLIC_KEY=pk_live_...
```

## Deployment Configuration

### Development Environment
```env
# .env.development
NODE_ENV=development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_PUBLIC_KEY=pk_test_...
PORT=5173
```

### Production Environment
```env
# .env.production
NODE_ENV=production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_PUBLIC_KEY=pk_live_...
PORT=80
```

### Docker Environment
```dockerfile
# Dockerfile environment setup
ENV NODE_ENV=production
ENV PORT=8080
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_SERVICE_ROLE=${SUPABASE_SERVICE_ROLE}
ENV QR_SECRET=${QR_SECRET}
```

## Troubleshooting

### Common Issues

#### Missing Environment Variables
```bash
# Error: Missing required environment variables
# Solution: Check .env file exists and contains all required variables
cp .env.example .env
# Edit .env with your actual values
```

#### Invalid Supabase Configuration
```bash
# Error: Failed to connect to Supabase
# Solution: Verify URL and keys are correct
curl -H "apikey: YOUR_ANON_KEY" "YOUR_SUPABASE_URL/rest/v1/"
```

#### QR Secret Issues
```bash
# Error: QR_SECRET missing or too short
# Solution: Generate secure random string
openssl rand -base64 32
```

### Environment Validation Commands
```bash
# Check all environment variables are set
npm run check:env

# Test Supabase connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/"

# Test server health
curl http://localhost:8080/health
```

## File Locations

### Environment Files
- **`.env`** - Local development environment (gitignored)
- **`.env.example`** - Template with all required variables
- **`.env.local`** - Local overrides (gitignored)
- **`.env.production`** - Production environment template

### Configuration Files
- **`vite.config.ts`** - Vite build configuration
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration

### Validation Scripts
- **`scripts/checkEnv.mjs`** - Environment validation script
- **`tests/loadEnv.ts`** - Test environment setup

---

**Proper environment configuration is critical for application security, functionality, and deployment success. Always validate environment variables before deployment and never expose server-side secrets to client-side code.**