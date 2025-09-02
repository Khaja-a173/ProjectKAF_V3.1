# ProjectKAF Server Snapshot - Backend Architecture Documentation

## Overview
This document provides a comprehensive snapshot of the ProjectKAF backend service, including directory structure, configuration files, and key implementation details.

## Directory Structure

```
/server/
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment template
├── src/
│   ├── index.ts                    # Main Fastify server entry point
│   ├── plugins/
│   │   └── supabase.ts            # Supabase client plugin
│   ├── lib/
│   │   ├── codegen.ts             # 4-character tenant code generator
│   │   └── qr.ts                  # QR code signing and generation
│   ├── services/
│   │   └── tenant.service.ts      # Tenant management service
│   └── routes/
│       └── tenants.ts             # Tenant API routes
└── dist/                          # Compiled JavaScript output (generated)
```

## Configuration Files

### package.json
```json
{
  "name": "projectkaf-server",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "fastify": "^4.28.1",
    "fastify-cors": "^8.4.0",
    "fastify-plugin": "^4.5.1",
    "jose": "^5.2.4",
    "nanoid": "^5.0.7",
    "qrcode": "^1.5.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.5.4",
    "@types/qrcode": "^1.5.5"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"]
}
```

### .env.example (Secrets Masked)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# QR Code Signing
QR_SECRET=change-this-long-random-string-for-production

# Server Configuration
PORT=8080
NODE_ENV=development

# Optional: Additional security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=60000
```

## Core Implementation Files

### src/index.ts - Main Server Entry Point
```typescript
import Fastify from 'fastify';
import cors from 'fastify-cors';
import supabasePlugin from './plugins/supabase.js';
import tenantRoutes from './routes/tenants.js';

const app = Fastify({ logger: true });

// Register plugins
await app.register(cors, { origin: true, credentials: true });
await app.register(supabasePlugin);

// Register routes
await app.register(tenantRoutes);

// Health check endpoint
app.get('/health', async () => ({ ok: true }));

// Global error handler
app.setErrorHandler(async (error, request, reply) => {
  app.log.error(error);
  
  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      details: error.validation
    });
  }
  
  if (error.statusCode) {
    return reply.code(error.statusCode).send({
      error: error.message
    });
  }
  
  return reply.code(500).send({
    error: 'Internal Server Error'
  });
});

// Start server
const port = Number(process.env.PORT ?? 8080);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
```

### src/plugins/supabase.ts - Supabase Integration
```typescript
import fp from 'fastify-plugin';
import { createClient } from '@supabase/supabase-js';

export default fp(async (app) => {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  
  if (!url || !key) {
    throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE');
  }
  
  const supabase = createClient(url, key, { 
    auth: { persistSession: false },
    global: {
      headers: {
        'X-Client-Info': 'projectkaf-server'
      }
    }
  });
  
  // Test connection on startup
  try {
    const { error } = await supabase.from('tenants').select('id').limit(1);
    if (error) {
      app.log.error('Supabase connection test failed:', error);
      throw new Error('Failed to connect to Supabase');
    }
    app.log.info('Supabase connection established successfully');
  } catch (err) {
    app.log.error('Supabase initialization failed:', err);
    throw err;
  }
  
  app.decorate('supabase', supabase);
});

// TypeScript declaration merging
declare module 'fastify' {
  interface FastifyInstance {
    supabase: ReturnType<typeof createClient>;
  }
}
```

### src/lib/codegen.ts - Tenant Code Generator
```typescript
import { customAlphabet } from 'nanoid';

// Use alphabet without confusing characters (0, O, I, L, 1)
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nano = customAlphabet(alphabet, 4);

/**
 * Generate a unique 4-character restaurant code
 * Format: XXXX (e.g., KAF1, BELL, CAFE)
 * 
 * Excludes confusing characters: 0, O, I, L, 1
 * Total combinations: 32^4 = 1,048,576 possible codes
 */
export function generateRestaurantCode(): string { 
  return nano(); 
}

/**
 * Validate restaurant code format
 */
export function isValidRestaurantCode(code: string): boolean {
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(code);
}

/**
 * Generate table code (T01, T02, etc.)
 */
export function generateTableCode(number: number): string {
  return `T${number.toString().padStart(2, '0')}`;
}
```

### src/lib/qr.ts - QR Code Management
```typescript
import * as crypto from 'crypto';
import QRCode from 'qrcode';

export type QrPayload = {
  tenant_code: string;
  table_code: string;
  iat: number;  // issued at (unix timestamp)
  exp: number;  // expires at (unix timestamp)
  nonce: string; // random nonce for uniqueness
};

/**
 * Sign QR payload with HMAC-SHA256
 * Creates tamper-proof QR codes with expiration
 */
export function signQrPayload(
  payload: Omit<QrPayload, 'iat' | 'exp' | 'nonce'>, 
  ttlSec = 600 // 10 minutes default
) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSec;
  const nonce = crypto.randomBytes(8).toString('hex');
  
  const data: QrPayload = { ...payload, iat, exp, nonce };
  
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error('QR_SECRET environment variable is required');
  }
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('base64url');
  
  return { data, sig: signature };
}

/**
 * Verify QR payload signature and expiration
 */
export function verifyQrPayload(data: QrPayload, signature: string): boolean {
  const secret = process.env.QR_SECRET;
  if (!secret) return false;
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (data.exp <= now) return false;
  
  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('base64url');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64url'),
    Buffer.from(expectedSig, 'base64url')
  );
}

/**
 * Generate QR code PNG data URL
 * Creates a scannable QR code with custom URI scheme
 */
export async function generateQrPngUrl(signed: { data: QrPayload; sig: string }): Promise<string> {
  const dataEncoded = Buffer.from(JSON.stringify(signed.data)).toString('base64url');
  const uri = `kaf://t?d=${encodeURIComponent(dataEncoded)}&s=${signed.sig}`;
  
  return await QRCode.toDataURL(uri, {
    margin: 1,
    width: 512,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
}

/**
 * Parse QR URI and extract payload
 */
export function parseQrUri(uri: string): { data: QrPayload; sig: string } | null {
  try {
    const url = new URL(uri);
    if (url.protocol !== 'kaf:' || url.hostname !== 't') return null;
    
    const dataParam = url.searchParams.get('d');
    const sigParam = url.searchParams.get('s');
    
    if (!dataParam || !sigParam) return null;
    
    const dataJson = Buffer.from(decodeURIComponent(dataParam), 'base64url').toString('utf8');
    const data = JSON.parse(dataJson) as QrPayload;
    
    return { data, sig: sigParam };
  } catch {
    return null;
  }
}
```

### src/services/tenant.service.ts - Tenant Management
```typescript
import type { FastifyInstance } from 'fastify';
import { generateRestaurantCode, isValidRestaurantCode } from '../lib/codegen.js';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantRequest {
  name: string;
  plan?: string;
  email?: string;
  phone?: string;
}

export class TenantService {
  constructor(private app: FastifyInstance) {}

  /**
   * Create new tenant with unique 4-character code
   * Retries up to 5 times if code collision occurs
   */
  async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    const { supabase } = this.app;
    const { name, plan = 'basic', email, phone } = request;
    
    // Validate input
    if (!name || name.trim().length < 2) {
      throw new Error('Tenant name must be at least 2 characters');
    }
    
    // Generate unique code with retries
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRestaurantCode();
      
      try {
        const { data, error } = await supabase
          .from('tenants')
          .insert({
            name: name.trim(),
            code,
            plan,
            email,
            phone,
            slug: this.generateSlug(name), // Auto-generate slug
            status: 'active'
          })
          .select()
          .single();
        
        if (!error) {
          this.app.log.info(`Created tenant: ${name} (${code})`);
          return data;
        }
        
        // If not a unique violation, throw the error
        if ((error as any).code !== '23505') {
          throw error;
        }
        
        // Code collision, retry with new code
        this.app.log.warn(`Code collision for ${code}, retrying...`);
        
      } catch (err) {
        if (attempt === 4) throw err; // Last attempt
      }
    }
    
    throw new Error('Failed to generate unique tenant code after 5 attempts');
  }

  /**
   * Get tenant by 4-character code
   */
  async getTenantByCode(code: string): Promise<Tenant | null> {
    if (!isValidRestaurantCode(code)) {
      throw new Error('Invalid tenant code format');
    }
    
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (error) {
      this.app.log.error('Error fetching tenant:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<Tenant | null> {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      this.app.log.error('Error fetching tenant by ID:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * Update tenant information
   */
  async updateTenant(id: string, updates: Partial<CreateTenantRequest>): Promise<Tenant> {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      this.app.log.error('Error updating tenant:', error);
      throw error;
    }
    
    return data;
  }

  /**
   * List all tenants (admin only)
   */
  async listTenants(limit = 50, offset = 0): Promise<Tenant[]> {
    const { data, error } = await this.app.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      this.app.log.error('Error listing tenants:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  }
}
```

### src/routes/tenants.ts - API Routes
```typescript
import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { TenantService } from '../services/tenant.service.js';
import { signQrPayload, generateQrPngUrl } from '../lib/qr.js';

// Request/Response schemas
const CreateTenantSchema = z.object({
  name: z.string().min(2).max(100),
  plan: z.string().optional().default('basic'),
  email: z.string().email().optional(),
  phone: z.string().optional()
});

const TenantParamsSchema = z.object({
  code: z.string().length(4).regex(/^[A-Z0-9]{4}$/)
});

const QrParamsSchema = z.object({
  code: z.string().length(4).regex(/^[A-Z0-9]{4}$/),
  table: z.string().regex(/^T\d{2}$/)
});

export default async function tenantRoutes(app: FastifyInstance) {
  const service = new TenantService(app);

  /**
   * POST /tenants - Create new tenant
   */
  app.post('/tenants', {
    schema: {
      body: CreateTenantSchema,
      response: {
        201: z.object({
          id: z.string().uuid(),
          name: z.string(),
          code: z.string(),
          plan: z.string(),
          status: z.string(),
          created_at: z.string(),
          updated_at: z.string()
        })
      }
    }
  }, async (req, reply) => {
    try {
      const body = CreateTenantSchema.parse(req.body);
      const tenant = await service.createTenant(body);
      
      app.log.info(`Tenant created: ${tenant.name} (${tenant.code})`);
      
      return reply.code(201).send(tenant);
    } catch (err) {
      app.log.error('Failed to create tenant:', err);
      
      if (err instanceof Error) {
        return reply.code(400).send({ error: err.message });
      }
      
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /tenants/:code - Get tenant by code
   */
  app.get('/tenants/:code', {
    schema: {
      params: TenantParamsSchema
    }
  }, async (req, reply) => {
    try {
      const { code } = TenantParamsSchema.parse(req.params);
      const tenant = await service.getTenantByCode(code);
      
      if (!tenant) {
        return reply.code(404).send({ error: 'Tenant not found' });
      }
      
      return reply.send(tenant);
    } catch (err) {
      app.log.error('Failed to fetch tenant:', err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * GET /tenants/:code/qr/:table - Generate QR code for table
   */
  app.get('/tenants/:code/qr/:table', {
    schema: {
      params: QrParamsSchema,
      response: {
        200: z.object({
          data_url: z.string(),
          signed: z.object({
            data: z.object({
              tenant_code: z.string(),
              table_code: z.string(),
              iat: z.number(),
              exp: z.number(),
              nonce: z.string()
            }),
            sig: z.string()
          })
        })
      }
    }
  }, async (req, reply) => {
    try {
      const { code, table } = QrParamsSchema.parse(req.params);
      
      // Verify tenant exists
      const tenant = await service.getTenantByCode(code);
      if (!tenant) {
        return reply.code(404).send({ error: 'Tenant not found' });
      }
      
      // Generate signed QR payload
      const signed = signQrPayload({ 
        tenant_code: code, 
        table_code: table 
      }, 3600); // 1 hour expiration
      
      // Generate PNG data URL
      const dataUrl = await generateQrPngUrl(signed);
      
      app.log.info(`Generated QR for ${code}/${table}`);
      
      return reply.send({
        data_url: dataUrl,
        signed
      });
      
    } catch (err) {
      app.log.error('Failed to generate QR:', err);
      return reply.code(500).send({ error: 'Failed to generate QR code' });
    }
  });

  /**
   * GET /tenants - List all tenants (admin only)
   */
  app.get('/tenants', async (req, reply) => {
    try {
      const tenants = await service.listTenants();
      return reply.send(tenants);
    } catch (err) {
      app.log.error('Failed to list tenants:', err);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
```

## Fastify Configuration

### Plugins Registered
1. **fastify-cors**: CORS handling for cross-origin requests
2. **supabase**: Custom Supabase client integration
3. **tenant routes**: Tenant management API endpoints

### Error Handling
- **Global error handler** for consistent error responses
- **Validation errors** with detailed field information
- **HTTP status codes** properly mapped
- **Structured logging** for debugging and monitoring

### CORS Configuration
```typescript
{
  origin: true,           // Allow all origins (configure for production)
  credentials: true,      // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Startup Process

### Environment Validation
1. **Check required environment variables**
2. **Test Supabase connection**
3. **Validate QR_SECRET presence**
4. **Configure logging level**

### Server Initialization
1. **Register plugins** in dependency order
2. **Register route handlers**
3. **Set up error handling**
4. **Start HTTP server** on configured port

### Health Monitoring
- **GET /health** endpoint for load balancer checks
- **Structured logging** for monitoring integration
- **Error tracking** for debugging

## Expected Environment Variables

### Required Variables
- **SUPABASE_URL**: Supabase project URL
- **SUPABASE_SERVICE_ROLE**: Service role key for database access
- **QR_SECRET**: Secret key for QR code signing (min 32 characters)

### Optional Variables
- **PORT**: Server port (default: 8080)
- **NODE_ENV**: Environment mode (development/production)
- **CORS_ORIGINS**: Allowed CORS origins (comma-separated)
- **RATE_LIMIT_MAX**: Rate limiting max requests
- **RATE_LIMIT_WINDOW**: Rate limiting window (ms)

## API Endpoints

### Tenant Management
- **POST /tenants** - Create new tenant
- **GET /tenants/:code** - Get tenant by code
- **GET /tenants** - List all tenants
- **GET /tenants/:code/qr/:table** - Generate table QR code

### System Endpoints
- **GET /health** - Health check for monitoring

## Security Features

### QR Code Security
- **HMAC-SHA256 signing** prevents tampering
- **Time-based expiration** prevents replay attacks
- **Random nonce** ensures uniqueness
- **Custom URI scheme** for app integration

### Database Security
- **Service role access** for privileged operations
- **Connection pooling** for performance
- **Error sanitization** prevents information leakage
- **Input validation** with Zod schemas

### Request Security
- **CORS protection** with configurable origins
- **Input validation** on all endpoints
- **Error handling** without sensitive data exposure
- **Structured logging** for audit trails

---

**The backend service provides a robust, secure foundation for multi-tenant restaurant management with proper separation of concerns and enterprise-grade security features.**