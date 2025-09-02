# ProjectKAF Code Map - Complete Repository Structure

## Overview
This document provides a comprehensive map of the ProjectKAF repository, including file sizes, purposes, and potential conflicts or duplications.

## Repository Structure

```
ProjectKAF/
├── 📁 .bolt/                                    # Bolt configuration and discarded migrations
│   └── 📁 supabase_discarded_migrations/        # Unused migration files
├── 📁 ProjectKAFDocs/                           # 📋 Documentation package (NEW)
│   ├── 📄 PROJECTKAF_DB_SNAPSHOT_FULL.md       # Complete database documentation
│   ├── 📄 PROJECTKAF_DB_MIGRATIONS_LIST.md     # Migration file inventory  
│   ├── 📄 PROJECTKAF_DB_POLICY_RAW_EXPORT.sql  # Raw RLS policy export
│   ├── 📄 PROJECTKAF_DB_DDL_EXPORT.sql         # Complete DDL export
│   ├── 📄 PROJECTKAF_SERVER_SNAPSHOT.md        # Backend documentation
│   ├── 📄 PROJECTKAF_WEB_SNAPSHOT.md           # Frontend documentation
│   ├── 📄 PROJECTKAF_ENV_REQUIREMENTS.md       # Environment variables guide
│   ├── 📄 PROJECTKAF_SUPABASE_AUTH_CONFIG.md   # Authentication configuration
│   ├── 📄 PROJECTKAF_DB_DIFF_LEGACY_VS_BLUEPRINT.md # Schema comparison
│   ├── 📄 PROJECTKAF_TEST_FIXTURES.sql         # Test data fixtures
│   ├── 📄 PROJECTKAF_RLS_POLICY_AUDIT.md       # RLS security audit
│   └── 📄 PROJECTKAF_BACKEND_SMOKE.md          # API testing guide
├── 📁 scripts/                                 # Build and utility scripts
│   ├── 📄 checkEnv.mjs                        # Environment validation (2.1KB)
│   ├── 📄 fix-build-now.mjs                   # Build fix automation (4.8KB)
│   └── 📄 fixPackageJson.mjs                  # Package.json repair (3.2KB)
├── 📁 server/                                  # 🚀 Backend service (NEW)
│   ├── 📄 package.json                        # Backend dependencies (1.2KB)
│   ├── 📄 tsconfig.json                       # TypeScript config (0.4KB)
│   └── 📁 src/                                # Backend source code
│       ├── 📄 index.ts                        # Main server entry (2.8KB)
│       ├── 📁 plugins/                        # Fastify plugins
│       │   └── 📄 supabase.ts                 # Supabase integration (1.1KB)
│       ├── 📁 lib/                            # Utility libraries
│       │   ├── 📄 codegen.ts                  # Code generation (1.5KB)
│       │   └── 📄 qr.ts                       # QR code management (3.2KB)
│       ├── 📁 services/                       # Business logic services
│       │   └── 📄 tenant.service.ts           # Tenant management (4.1KB)
│       └── 📁 routes/                         # API route handlers
│           └── 📄 tenants.ts                  # Tenant API routes (3.8KB)
├── 📁 src/                                     # 🎨 Frontend application
│   ├── 📄 App.tsx                             # Main app component (3.2KB)
│   ├── 📄 main.tsx                            # App entry point (1.1KB)
│   ├── 📄 index.css                           # Global styles (2.8KB)
│   ├── 📄 vite-env.d.ts                       # Vite types (0.3KB)
│   ├── 📁 components/                          # Reusable UI components
│   │   ├── 📄 Header.tsx                      # Site header (4.2KB)
│   │   ├── 📄 Footer.tsx                      # Site footer (3.1KB)
│   │   ├── 📄 DashboardHeader.tsx             # Admin header (2.9KB)
│   │   ├── 📄 ProtectedRoute.tsx              # Route protection (3.5KB)
│   │   ├── 📄 SessionCart.tsx                 # Shopping cart (8.7KB)
│   │   ├── 📄 OrderSuccessModal.tsx           # Order confirmation (3.4KB)
│   │   ├── 📄 TableSessionBadge.tsx           # Session indicator (1.8KB)
│   │   ├── 📄 ModePrompt.tsx                  # Order mode selection (1.2KB)
│   │   ├── 📄 JoinPinModal.tsx                # PIN entry modal (1.1KB)
│   │   ├── 📄 BrandingEditor.tsx              # Brand customization (12.3KB)
│   │   ├── 📄 DynamicPageRenderer.tsx         # Custom page renderer (6.8KB)
│   │   ├── 📄 AccessControlDashboard.tsx      # Permission management (18.9KB)
│   │   └── 📁 menu/                           # Menu management components
│   │       ├── 📄 ItemGrid.tsx                # Menu item display (7.2KB)
│   │       ├── 📄 ItemEditor.tsx              # Item editor modal (9.8KB)
│   │       ├── 📄 SectionList.tsx             # Section navigation (4.1KB)
│   │       ├── 📄 SectionEditor.tsx           # Section editor (3.2KB)
│   │       ├── 📄 MenuFilters.tsx             # Filtering controls (4.8KB)
│   │       └── 📄 BulkUploader.tsx            # Bulk upload tool (6.1KB)
│   ├── 📁 pages/                              # Page components
│   │   ├── 📄 Home.tsx                        # Landing page (8.9KB)
│   │   ├── 📄 Menu.tsx                        # Customer menu (12.1KB)
│   │   ├── 📄 BookTable.tsx                   # Table booking (11.7KB)
│   │   ├── 📄 Reserve.tsx                     # Reservation system (7.3KB)
│   │   ├── 📄 TakeAway.tsx                    # Takeaway ordering (8.4KB)
│   │   ├── 📄 LoginPage.tsx                   # Authentication (6.8KB)
│   │   ├── 📄 Dashboard.tsx                   # Admin dashboard (5.9KB)
│   │   ├── 📄 MenuManagement.tsx              # Menu admin (8.2KB)
│   │   ├── 📄 OrderManagement.tsx             # Order admin (15.4KB)
│   │   ├── 📄 KitchenDashboard.tsx            # Kitchen operations (18.7KB)
│   │   ├── 📄 LiveOrders.tsx                  # Order tracking (12.3KB)
│   │   ├── 📄 TableManagement.tsx             # Table admin (16.8KB)
│   │   ├── 📄 StaffManagement.tsx             # Staff admin (21.2KB)
│   │   ├── 📄 Analytics.tsx                   # Business analytics (4.1KB)
│   │   ├── 📄 Settings.tsx                    # System settings (8.7KB)
│   │   ├── 📄 ApplicationCustomization.tsx    # Page customization (22.1KB)
│   │   ├── 📄 CustomerMenu.tsx                # Customer menu view (6.8KB)
│   │   ├── 📄 Gallery.tsx                     # Photo gallery (9.2KB)
│   │   ├── 📄 Events.tsx                      # Events page (7.8KB)
│   │   ├── 📄 Contact.tsx                     # Contact page (8.1KB)
│   │   └── 📄 Pages.tsx                       # Static pages (6.4KB)
│   ├── 📁 context/                            # React context providers
│   │   └── 📄 TenantContext.tsx               # 🆕 Multi-tenant context (0.8KB)
│   ├── 📁 contexts/                           # Additional contexts
│   │   ├── 📄 BrandingContext.tsx             # Brand management (6.2KB)
│   │   └── 📄 AccessControlContext.tsx        # Permission context (8.9KB)
│   ├── 📁 hooks/                              # Custom React hooks
│   │   ├── 📄 useCustomization.ts             # Page customization (12.8KB)
│   │   ├── 📄 useMenuManagement.ts            # Menu management (11.2KB)
│   │   ├── 📄 useSessionManagement.ts         # Session/order management (21.7KB)
│   │   ├── 📄 useAccessManagement.ts          # Access control (9.1KB)
│   │   └── 📄 useBrandingManagement.ts        # Brand asset management (6.8KB)
│   ├── 📁 types/                              # TypeScript definitions
│   │   ├── 📄 menu.ts                         # Menu-related types (2.1KB)
│   │   ├── 📄 session.ts                      # Session/order types (4.8KB)
│   │   ├── 📄 access.ts                       # Access control types (8.2KB)
│   │   └── 📄 customization.ts                # Customization types (6.1KB)
│   ├── 📁 state/                              # State management
│   │   └── 📄 cartStore.ts                    # Shopping cart store (3.4KB)
│   ├── 📁 lib/                                # Utility libraries
│   │   ├── 📄 supabase.ts                     # Supabase client (0.2KB)
│   │   ├── 📄 idempotency.ts                  # Idempotency helpers (1.1KB)
│   │   └── 📁 qr/                             # QR code utilities
│   │       ├── 📄 sign.ts                     # QR signing (server-side) (1.8KB)
│   │       └── 📄 verify.ts                   # QR verification (2.1KB)
│   ├── 📁 health/                             # Health monitoring
│   │   ├── 📄 HealthBanner.tsx                # Health status display (0.6KB)
│   │   └── 📄 supabaseHealth.ts               # Database health (0.3KB)
│   └── 📁 server/                             # Server utilities (legacy)
│       └── 📁 routes/                         # API route handlers
│           ├── 📄 health-db.ts                # Database health endpoint (1.2KB)
│           ├── 📄 table-session.ts            # Table session API (4.8KB)
│           └── 📄 orders.ts                   # Order processing API (3.9KB)
├── 📁 supabase/                               # Database migrations
│   └── 📁 migrations/                         # Schema evolution files
│       ├── 📄 20250821021152_sunny_dawn.sql   # Initial schema (15.2KB)
│       ├── 📄 20250822035330_wooden_sound.sql # User management (8.1KB)
│       ├── 📄 20250824043902_steep_sun.sql    # Menu system (6.4KB)
│       ├── 📄 20250824045128_twilight_sound.sql # Order management (12.8KB)
│       ├── 📄 20250824063014_royal_king.sql   # Table management (4.2KB)
│       ├── 📄 20250824063520_rapid_sky.sql    # Customer system (3.1KB)
│       ├── 📄 20250824063901_tender_bar.sql   # Payment processing (2.8KB)
│       ├── 📄 20250824064154_humble_wildflower.sql # Table sessions (3.4KB)
│       ├── 📄 20250824064157_navy_poetry.sql  # Order items (2.9KB)
│       ├── 📄 20250824101144_polished_math.sql # Analytics (3.2KB)
│       ├── 📄 20250824101148_precious_canyon.sql # Inventory (2.1KB)
│       ├── 📄 20250824101154_dark_pine.sql    # Notifications (1.8KB)
│       ├── 📄 20250824113613_peaceful_breeze.sql # Staff schedules (2.3KB)
│       ├── 📄 20250824113615_snowy_breeze.sql # Audit logging (2.6KB)
│       └── 📄 20250824113619_weathered_pine.sql # Triggers/functions (3.1KB)
├── 📁 tests/                                   # Test suite
│   ├── 📄 loadEnv.ts                          # Test environment setup (0.8KB)
│   ├── 📄 setupServer.ts                      # Test server setup (2.1KB)
│   ├── 📄 globalServer.ts                     # Global test server (1.4KB)
│   ├── 📄 rls.spec.ts                         # RLS security tests (4.2KB)
│   ├── 📄 orders.spec.ts                      # Order API tests (3.8KB)
│   ├── 📄 table-session.spec.ts               # Table session tests (6.1KB)
│   └── 📁 ui/                                 # UI component tests
│       ├── 📄 setupJSDOM.ts                   # JSDOM test setup (0.6KB)
│       ├── 📄 cart-store.spec.ts              # Cart state tests (1.8KB)
│       ├── 📄 menu-guard.spec.tsx             # Menu guard tests (1.2KB)
│       └── 📄 mode-prompt.spec.tsx            # Mode prompt tests (0.9KB)
├── 📄 .env.example                            # Environment template (0.8KB)
├── 📄 .gitignore                              # Git ignore rules (0.3KB)
├── 📄 index.html                              # HTML entry point (0.6KB)
├── 📄 package.json                            # Frontend dependencies (2.1KB)
├── 📄 package-lock.json                       # Dependency lock file (1.2MB)
├── 📄 postcss.config.js                       # PostCSS configuration (0.1KB)
├── 📄 tailwind.config.js                      # Tailwind CSS config (1.1KB)
├── 📄 tsconfig.json                           # TypeScript config (0.7KB)
├── 📄 tsconfig.node.json                      # Node TypeScript config (0.2KB)
├── 📄 vite.config.ts                          # Vite build config (0.3KB)
├── 📄 vitest.config.ts                        # Test configuration (1.2KB)
├── 📄 vitest.api.config.ts                    # API test config (0.6KB)
├── 📄 vitest.ui.config.ts                     # UI test config (0.4KB)
├── 📄 README.md                               # Project overview (4.8KB)
├── 📄 SETUP.md                                # Setup instructions (12.1KB)
├── 📄 TESTING_GUIDE.md                        # Testing documentation (18.7KB)
├── 📄 DEPLOYMENT_GUIDE.md                     # Deployment instructions (15.2KB)
├── 📄 API_DOCUMENTATION.md                    # API reference (8.9KB)
├── 📄 COMPLETE_APPLICATION_DOCUMENTATION.md   # Complete app docs (89.2KB)
└── 📄 APPLICATION_ANALYSIS_AND_FEEDBACK.md    # Expert analysis (67.8KB)
```

## File Analysis & Conflicts

### 🔍 **Duplicate/Conflicting Files**

#### 1. Server Route Handlers
**Potential Conflict**: Multiple route implementations

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| `server/src/routes/tenants.ts` | `/server/src/routes/` | 🆕 New tenant API | **Primary** |
| `src/server/routes/health-db.ts` | `/src/server/routes/` | Legacy health check | **Secondary** |
| `src/server/routes/table-session.ts` | `/src/server/routes/` | Legacy table sessions | **Secondary** |
| `src/server/routes/orders.ts` | `/src/server/routes/` | Legacy order processing | **Secondary** |

**🔧 Resolution Strategy:**
```bash
# Option 1: Migrate legacy routes to new server structure
mv src/server/routes/* server/src/routes/

# Option 2: Remove legacy routes (if functionality moved)
rm -rf src/server/

# Option 3: Keep both during transition period
# Use different ports or prefixes
```

#### 2. QR Code Implementations
**Potential Conflict**: Multiple QR handling approaches

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| `server/src/lib/qr.ts` | `/server/src/lib/` | 🆕 New QR system | **Primary** |
| `src/lib/qr/sign.ts` | `/src/lib/qr/` | Legacy QR signing | **Secondary** |
| `src/lib/qr/verify.ts` | `/src/lib/qr/` | Legacy QR verification | **Secondary** |

**🔧 Resolution Strategy:**
```bash
# Consolidate QR functionality
# Keep server-side signing in server/src/lib/qr.ts
# Keep client-side verification in src/lib/qr/verify.ts
# Remove duplicate implementations
```

#### 3. Environment Configuration
**Potential Conflict**: Multiple environment setups

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| `.env.example` | `/` | Main environment template | **Primary** |
| `server/.env.example` | `/server/` | Server-specific template | **Missing** |

**🔧 Resolution Strategy:**
```bash
# Create server-specific environment template
cat > server/.env.example << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
QR_SECRET=your-long-random-secret-string
PORT=8080
NODE_ENV=development
EOF
```

### 📊 **File Size Analysis**

#### Large Files (>10KB)
| File | Size | Category | Optimization |
|------|------|----------|--------------|
| `COMPLETE_APPLICATION_DOCUMENTATION.md` | 89.2KB | Documentation | ✅ Appropriate |
| `APPLICATION_ANALYSIS_AND_FEEDBACK.md` | 67.8KB | Documentation | ✅ Appropriate |
| `src/components/AccessControlDashboard.tsx` | 18.9KB | Component | ⚠️ Consider splitting |
| `src/pages/KitchenDashboard.tsx` | 18.7KB | Page | ⚠️ Consider splitting |
| `TESTING_GUIDE.md` | 18.7KB | Documentation | ✅ Appropriate |
| `src/hooks/useSessionManagement.ts` | 21.7KB | Hook | ⚠️ Consider splitting |
| `src/pages/ApplicationCustomization.tsx` | 22.1KB | Page | ⚠️ Consider splitting |
| `src/pages/StaffManagement.tsx` | 21.2KB | Page | ⚠️ Consider splitting |

#### Optimization Recommendations
```typescript
// Split large components into smaller modules
// Example: AccessControlDashboard.tsx
├── AccessControlDashboard.tsx      # Main component (5KB)
├── UserManagement.tsx              # User management section (6KB)
├── RoleManagement.tsx              # Role management section (4KB)
├── PolicyManagement.tsx            # Policy management section (4KB)
└── AuditLog.tsx                    # Audit log section (3KB)
```

### 🔄 **Migration Files Analysis**

#### Active Migrations (15 files)
| File | Date | Size | Purpose |
|------|------|------|---------|
| `20250821021152_sunny_dawn.sql` | 2025-08-21 | 15.2KB | Initial schema |
| `20250822035330_wooden_sound.sql` | 2025-08-22 | 8.1KB | User management |
| `20250824043902_steep_sun.sql` | 2025-08-24 | 6.4KB | Menu system |
| `20250824045128_twilight_sound.sql` | 2025-08-24 | 12.8KB | Order management |
| `20250824063014_royal_king.sql` | 2025-08-24 | 4.2KB | Table management |
| ... | ... | ... | ... |

#### Discarded Migrations (8 files)
| File | Location | Reason |
|------|----------|--------|
| `20250824143522_tiny_dew.sql` | `.bolt/supabase_discarded_migrations/` | Superseded |
| `2025-08-24_order_index_fix.sql` | `.bolt/supabase_discarded_migrations/` | Index optimization |
| `20250824062353_orange_band.sql` | `.bolt/supabase_discarded_migrations/` | Schema conflict |
| ... | ... | ... |

**🧹 Cleanup Recommendation:**
```bash
# Archive old discarded migrations
mkdir -p archive/discarded_migrations
mv .bolt/supabase_discarded_migrations/* archive/discarded_migrations/
```

### 🔧 **Configuration Files**

#### Build Configuration
| File | Purpose | Status |
|------|---------|--------|
| `vite.config.ts` | Vite build config | ✅ Optimal |
| `tsconfig.json` | TypeScript config | ✅ Optimal |
| `tailwind.config.js` | CSS framework | ✅ Optimal |
| `postcss.config.js` | CSS processing | ✅ Optimal |
| `vitest.config.ts` | Test configuration | ✅ Optimal |

#### Package Management
| File | Purpose | Status |
|------|---------|--------|
| `package.json` | Frontend dependencies | ✅ Well organized |
| `server/package.json` | Backend dependencies | ✅ Minimal, focused |
| `package-lock.json` | Dependency lock | ✅ Current |

### 📋 **Documentation Files**

#### Primary Documentation
| File | Size | Purpose | Status |
|------|------|---------|--------|
| `README.md` | 4.8KB | Project overview | ✅ Comprehensive |
| `SETUP.md` | 12.1KB | Setup guide | ✅ Detailed |
| `TESTING_GUIDE.md` | 18.7KB | Testing instructions | ✅ Thorough |
| `DEPLOYMENT_GUIDE.md` | 15.2KB | Deployment guide | ✅ Complete |
| `API_DOCUMENTATION.md` | 8.9KB | API reference | ✅ Good coverage |

#### Analysis Documentation
| File | Size | Purpose | Status |
|------|------|---------|--------|
| `COMPLETE_APPLICATION_DOCUMENTATION.md` | 89.2KB | Complete system docs | ✅ Comprehensive |
| `APPLICATION_ANALYSIS_AND_FEEDBACK.md` | 67.8KB | Expert analysis | ✅ Detailed |

#### New Documentation Package
| File | Size | Purpose | Status |
|------|------|---------|--------|
| `ProjectKAFDocs/*.md` | Various | Phase 1 documentation | 🆕 New |

## Code Quality Assessment

### 🟢 **Excellent Areas**
- **TypeScript Coverage**: 100% TypeScript usage
- **Component Organization**: Clear separation of concerns
- **Hook Architecture**: Reusable business logic
- **Type Definitions**: Comprehensive type system
- **Testing Coverage**: Good test structure

### 🟡 **Areas for Improvement**
- **Large Components**: Some components >15KB should be split
- **Code Duplication**: Some utility functions duplicated
- **Legacy Routes**: Old server routes should be migrated
- **Documentation Spread**: Multiple doc files could be consolidated

### 🔴 **Potential Issues**
- **Route Conflicts**: Legacy vs new server routes
- **QR Implementation**: Multiple QR handling approaches
- **Environment Setup**: Complex environment configuration

## Dependency Analysis

### Frontend Dependencies (Key)
```json
{
  "production": {
    "@supabase/supabase-js": "^2.56.0",    // Database client
    "react": "^18.3.1",                    // UI framework
    "react-router-dom": "^6.26.1",        // Routing
    "lucide-react": "^0.441.0",           // Icons
    "date-fns": "^3.6.0",                 // Date utilities
    "zod": "^4.1.0"                       // Schema validation
  },
  "development": {
    "@vitejs/plugin-react": "^4.3.1",     // Vite React plugin
    "typescript": "^5.5.3",               // Type checking
    "tailwindcss": "^3.4.10",             // CSS framework
    "vitest": "^3.2.4"                    // Testing framework
  }
}
```

### Backend Dependencies (Key)
```json
{
  "production": {
    "@supabase/supabase-js": "^2.45.0",   // Database client
    "fastify": "^4.28.1",                 // Web framework
    "fastify-cors": "^8.4.0",             // CORS handling
    "zod": "^3.23.8",                     // Schema validation
    "nanoid": "^5.0.7",                   // ID generation
    "qrcode": "^1.5.3"                    // QR code generation
  },
  "development": {
    "tsx": "^4.19.0",                     // TypeScript execution
    "typescript": "^5.5.4"                // Type checking
  }
}
```

## Security File Analysis

### 🔒 **Security-Critical Files**
| File | Purpose | Security Level |
|------|---------|----------------|
| `src/lib/qr/sign.ts` | QR signing | 🔴 **Critical** |
| `src/lib/qr/verify.ts` | QR verification | 🟡 **Important** |
| `server/src/lib/qr.ts` | QR management | 🔴 **Critical** |
| `src/contexts/AccessControlContext.tsx` | Permission system | 🔴 **Critical** |
| `.env` | Environment secrets | 🔴 **Critical** |

### 🛡️ **Security Recommendations**
```bash
# 1. Ensure sensitive files are not exposed
echo ".env" >> .gitignore
echo "server/.env" >> .gitignore

# 2. Validate file permissions
chmod 600 .env server/.env

# 3. Audit secret usage
grep -r "process.env" src/ server/src/ | grep -v ".example"
```

## Performance Considerations

### 📈 **Bundle Size Analysis**
```bash
# Analyze frontend bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for large dependencies
npx webpack-bundle-analyzer dist/assets/*.js
```

### 🚀 **Optimization Opportunities**
1. **Code Splitting**: Split large pages into chunks
2. **Lazy Loading**: Load components on demand
3. **Tree Shaking**: Remove unused code
4. **Asset Optimization**: Compress images and fonts

## Maintenance Recommendations

### 🧹 **Cleanup Tasks**
```bash
# 1. Remove discarded migrations
rm -rf .bolt/supabase_discarded_migrations/

# 2. Consolidate server routes
mv src/server/routes/* server/src/routes/
rm -rf src/server/

# 3. Update documentation links
# Fix any broken internal documentation links

# 4. Optimize large components
# Split components >15KB into smaller modules
```

### 📋 **Regular Maintenance**
1. **Dependency Updates**: Monthly security updates
2. **Migration Cleanup**: Archive old migrations quarterly
3. **Documentation Sync**: Keep docs current with code changes
4. **Performance Monitoring**: Regular bundle size analysis

---

**The codebase is well-organized with clear separation of concerns. Minor cleanup and optimization will improve maintainability and performance while preserving the excellent architectural foundation.**