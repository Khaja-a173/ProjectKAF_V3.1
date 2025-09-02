# ProjectKAF Supabase Authentication Configuration

## Overview
This document summarizes the Supabase authentication configuration for ProjectKAF, including auth providers, JWT settings, database roles, and security policies.

## Authentication Providers

### Enabled Providers
Based on the application configuration, the following auth providers are configured:

#### Email/Password Authentication
- **Status**: ✅ Enabled (Primary method)
- **Configuration**: Standard email/password signup and signin
- **Email Confirmation**: Disabled for faster development/testing
- **Password Requirements**: Minimum 6 characters (Supabase default)

#### Social Providers
- **Google**: Not configured
- **GitHub**: Not configured  
- **Facebook**: Not configured
- **Twitter**: Not configured
- **Apple**: Not configured

*Note: Social providers can be enabled in Supabase Dashboard → Authentication → Providers*

## JWT Configuration

### JWT Settings
```json
{
  "aud": "authenticated",
  "iss": "https://your-project.supabase.co/auth/v1",
  "iat": 1640995200,
  "exp": 1640998800,
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "phone": "",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "tenant_id": "tenant_123",
    "role": "manager"
  },
  "role": "authenticated"
}
```

### Custom Claims
The application uses custom JWT claims for tenant isolation:

```sql
-- Custom claims in JWT token
{
  "tenant_id": "uuid-of-tenant",
  "role": "manager|staff|admin",
  "location_id": "uuid-of-location"
}
```

## Database Roles

### Default Supabase Roles

#### `anon` Role
- **Purpose**: Unauthenticated public access
- **Permissions**: Limited read access to public menu items
- **Usage**: Customer menu browsing without login
- **RLS Policies**: Restricted to `is_available = true` menu items

```sql
-- Example anon access policy
CREATE POLICY "public_read_menu_items_available" ON menu_items
FOR SELECT TO anon
USING (is_available = true);
```

#### `authenticated` Role
- **Purpose**: Authenticated user access
- **Permissions**: Tenant-scoped read/write access
- **Usage**: Staff and customer operations
- **RLS Policies**: Tenant-isolated access based on JWT claims

```sql
-- Example authenticated access policy
CREATE POLICY "auth_read_orders_tenant" ON orders
FOR SELECT TO authenticated
USING (tenant_id = (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid);
```

#### `service_role` Role
- **Purpose**: Server-side privileged operations
- **Permissions**: Full database access (bypasses RLS)
- **Usage**: Backend API operations, migrations, admin tasks
- **Security**: 🚨 Never expose to client-side code

### Custom Roles (If Implemented)

#### `tenant_admin` Role
- **Purpose**: Tenant administrator access
- **Permissions**: Full access within tenant scope
- **Usage**: Restaurant owner/manager operations

#### `staff` Role  
- **Purpose**: Staff member access
- **Permissions**: Limited operational access
- **Usage**: Waiters, kitchen staff, cashiers

## Database Grants

### Function Grants
```sql
-- Grant execute permissions on custom functions
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION orders_fill_defaults() TO authenticated;

-- Grant usage on custom types
GRANT USAGE ON TYPE user_role TO authenticated;
GRANT USAGE ON TYPE order_status TO authenticated;
GRANT USAGE ON TYPE payment_status TO authenticated;
GRANT USAGE ON TYPE table_status TO authenticated;
GRANT USAGE ON TYPE notification_type TO authenticated;
```

### Schema Grants
```sql
-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
```

## Authentication Flow

### User Registration Flow
```typescript
// 1. User signs up with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@restaurant.com',
  password: 'secure_password',
  options: {
    data: {
      tenant_id: 'tenant_uuid',
      role: 'staff',
      first_name: 'John',
      last_name: 'Doe'
    }
  }
});

// 2. Create staff record in database
const { error: staffError } = await supabase
  .from('users')
  .insert({
    id: data.user.id,
    tenant_id: data.user.user_metadata.tenant_id,
    email: data.user.email,
    first_name: data.user.user_metadata.first_name,
    last_name: data.user.user_metadata.last_name,
    role: data.user.user_metadata.role
  });
```

### User Login Flow
```typescript
// 1. User signs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@restaurant.com',
  password: 'secure_password'
});

// 2. Get user profile with tenant info
const { data: profile } = await supabase
  .from('users')
  .select(`
    *,
    tenants (
      id,
      name,
      code,
      plan
    )
  `)
  .eq('id', data.user.id)
  .single();
```

### Session Management
```typescript
// Check current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in
    setUser(session?.user);
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    setUser(null);
  }
});
```

## Row Level Security Integration

### RLS with Auth
The application uses Supabase auth integration with RLS policies:

```sql
-- Current user function
auth.uid() -- Returns current authenticated user ID

-- JWT claims access
current_setting('request.jwt.claims.tenant_id'::text, true)::uuid
```

### Tenant Isolation Pattern
```sql
-- Standard tenant isolation policy
CREATE POLICY "tenant_isolation" ON table_name
FOR ALL TO authenticated
USING (tenant_id = (
  SELECT users.tenant_id 
  FROM users 
  WHERE users.id = auth.uid()
))
WITH CHECK (tenant_id = (
  SELECT users.tenant_id 
  FROM users 
  WHERE users.id = auth.uid()
));
```

### Staff-Based Access
```sql
-- Staff-based access through view
CREATE VIEW v_current_staff AS
SELECT s.*, t.code as tenant_code
FROM staff s
JOIN tenants t ON t.id = s.tenant_id
WHERE s.user_id = auth.uid();

-- Policy using staff view
CREATE POLICY "staff_access" ON orders
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM v_current_staff v 
  WHERE v.tenant_id = orders.tenant_id
));
```

## Security Configuration

### Password Policy
```json
{
  "minLength": 6,
  "requireUppercase": false,
  "requireLowercase": false,
  "requireNumbers": false,
  "requireSpecialChars": false
}
```

### Session Configuration
```json
{
  "sessionTimeout": 3600,
  "refreshTokenRotation": true,
  "reuseInterval": 10
}
```

### Email Configuration
```json
{
  "confirmSignup": false,
  "confirmEmailChange": true,
  "allowedEmailDomains": [],
  "blockedEmailDomains": []
}
```

## Auth Schema Functions

### Custom Auth Functions (If Implemented)

#### Get Current Tenant
```sql
CREATE OR REPLACE FUNCTION auth.current_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (current_setting('request.jwt.claims.tenant_id'::text, true))::uuid;
$$;
```

#### Check User Role
```sql
CREATE OR REPLACE FUNCTION auth.has_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (current_setting('request.jwt.claims.role'::text, true)) = required_role;
$$;
```

#### Get User Permissions
```sql
CREATE OR REPLACE FUNCTION auth.user_permissions()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT permissions 
  FROM users 
  WHERE id = auth.uid();
$$;
```

## Authentication Middleware

### Server-Side Auth Verification
```typescript
// Fastify auth plugin
import fp from 'fastify-plugin';
import { verify } from 'jsonwebtoken';

export default fp(async (app) => {
  app.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const payload = verify(token, process.env.JWT_SECRET!);
      request.user = payload;
    } catch (err) {
      return reply.code(401).send({ error: 'Invalid token' });
    }
  });
});
```

### Client-Side Auth State
```typescript
// React auth context
const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Testing Authentication

### Test User Creation
```sql
-- Create test users for different tenants
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@bellavista.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manager@bellavista.com', crypt('password123', gen_salt('bf')), now(), now(), now());

-- Link to staff records
INSERT INTO users (id, tenant_id, email, first_name, last_name, role)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'tenant_1', 'admin@bellavista.com', 'Admin', 'User', 'tenant_admin'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tenant_1', 'manager@bellavista.com', 'Manager', 'User', 'manager');
```

### RLS Testing
```typescript
// Test tenant isolation
const client1 = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${token1}` } }
});

const client2 = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${token2}` } }
});

// Client 1 should only see tenant 1 data
const { data: tenant1Orders } = await client1.from('orders').select('*');

// Client 2 should only see tenant 2 data  
const { data: tenant2Orders } = await client2.from('orders').select('*');

// Cross-tenant access should be blocked
const { data: crossTenantData, error } = await client1
  .from('orders')
  .select('*')
  .eq('tenant_id', 'different_tenant_id');
// Should return empty array or error
```

## Security Best Practices

### Token Management
- **Secure storage**: Store tokens in httpOnly cookies or secure storage
- **Token refresh**: Implement automatic token refresh
- **Token validation**: Validate tokens on every request
- **Token revocation**: Implement logout and token invalidation

### RLS Policy Design
- **Principle of least privilege**: Grant minimum required access
- **Tenant isolation**: Ensure perfect tenant data separation
- **Role-based access**: Implement granular role permissions
- **Audit trails**: Log all access and modifications

### Error Handling
- **No information leakage**: Don't expose sensitive data in errors
- **Consistent responses**: Use standard error formats
- **Rate limiting**: Prevent brute force attacks
- **Monitoring**: Log authentication events for security analysis

---

**The authentication system provides enterprise-grade security with multi-tenant isolation, role-based access control, and comprehensive audit capabilities.**