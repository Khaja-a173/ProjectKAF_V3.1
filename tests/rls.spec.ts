import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// ENV required for tests
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY!;
const SUPABASE_JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET; // project JWT secret

if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_JWT_SECRET) {
  throw new Error('Missing env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, JWT_SECRET.');
}

// Helper: mint a test JWT with tenant_id claim (role=anon is fine for RLS testing)
function tokenForTenant(tenantId: string) {
  const payload = {
    role: 'anon',
    tenant_id: tenantId
  };
  return jwt.sign(payload, SUPABASE_JWT_SECRET, { algorithm: 'HS256', expiresIn: '10m' });
}

// Build a Supabase client that uses our minted token
function clientForTenant(tenantId: string) {
  const token = tokenForTenant(tenantId);
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

// Pick a representative set of tenant-scoped tables to test.
// Include write-heavy and read-heavy ones.
const TABLES = [
  'menu_items',
  'categories',
  'orders',
  'order_items',
  'restaurant_tables'
].filter(Boolean);

function cryptoRandomUUID() {
  // Node 18+ has crypto.randomUUID; fallback for TS environments.
  // @ts-ignore
  return (globalThis.crypto?.randomUUID?.() ?? require('crypto').randomUUID());
}

const TENANT_A = cryptoRandomUUID();
const TENANT_B = cryptoRandomUUID();

describe.skip('RLS: tenant isolation', () => {
  const dbA = clientForTenant(TENANT_A);
  const dbB = clientForTenant(TENANT_B);

  // Seed one row per table for tenant A only
  beforeAll(async () => {
    for (const t of TABLES) {
      // Insert minimal row shapes; adapt per-table columns if needed
      const base: Record<string, any> = { tenant_id: TENANT_A };
      // Try to satisfy minimal not-null constraints commonly present:
      if (t === 'categories') base.name = 'Starters';
      if (t === 'menu_items') { 
        base.name = 'Soup'; 
        base.price = 5; 
        base.category_id = null; 
      }
      if (t === 'restaurant_tables') {
        base.table_number = 'T-1';
        base.capacity = 4;
      }
      if (t === 'orders') { 
        base.order_number = 'TEST-001';
        base.status = 'pending'; 
        base.subtotal = 0;
        base.tax_amount = 0;
        base.total_amount = 0;
      }
      if (t === 'order_items') { 
        base.quantity = 1; 
        base.unit_price = 5;
        base.total_price = 5;
        base.order_id = null; 
        base.menu_item_id = null; 
      }

      const { error } = await dbA.from(t).insert(base).single();
      // If table has additional not-null columns, this will fail; surface actionable info:
      if (error) {
        throw new Error(`Seed failed for ${t}: ${error.code} ${error.message}`);
      }
    }
  });

  afterAll(async () => {
    // Optional: attempt cleanup as tenant A (will be constrained by RLS)
    for (const t of TABLES) {
      await dbA.from(t).delete().neq('tenant_id', '00000000-0000-0000-0000-000000000000'); // noop-ish
    }
  });

  it('precondition: tenant A can read its own rows', async () => {
    for (const t of TABLES) {
      const { data, error } = await dbA.from(t).select('tenant_id').limit(1);
      expect(error).toBeNull();
      expect(data && data.length).toBeGreaterThan(0);
      expect(data![0].tenant_id).toBe(TENANT_A);
    }
  });

  it('cross-tenant SELECT is blocked (B cannot see A data)', async () => {
    for (const t of TABLES) {
      const { data, error } = await dbB.from(t).select('tenant_id').eq('tenant_id', TENANT_A);
      // RLS returns 0 rows (not an error) for forbidden SELECT
      expect(error).toBeNull();
      expect((data ?? []).length).toBe(0);
    }
  });

  it('cross-tenant UPDATE is denied (B cannot update A rows)', async () => {
    for (const t of TABLES) {
      // Try to update any A row as B
      const { error } = await dbB.from(t).update({ updated_at: new Date().toISOString() }).eq('tenant_id', TENANT_A);
      // Expect error due to RLS (permission denied)
      expect(error).not.toBeNull();
      expect(error!.code).toBeDefined();
    }
  });

  it('cross-tenant DELETE is denied (B cannot delete A rows)', async () => {
    for (const t of TABLES) {
      const { error } = await dbB.from(t).delete().eq('tenant_id', TENANT_A);
      expect(error).not.toBeNull();
      expect(error!.code).toBeDefined();
    }
  });

  it('INSERT must enforce tenant_id = current tenant', async () => {
    for (const t of TABLES) {
      // B tries to insert a row with tenant_id = A (should fail)
      const bad = { tenant_id: TENANT_A };
      
      // Add required fields per table
      if (t === 'categories') bad.name = 'Bad Category';
      if (t === 'menu_items') { 
        bad.name = 'Bad Item'; 
        bad.price = 10; 
      }
      if (t === 'restaurant_tables') {
        bad.table_number = 'BAD-1';
        bad.capacity = 2;
      }
      if (t === 'orders') { 
        bad.order_number = 'BAD-001';
        bad.status = 'pending'; 
        bad.subtotal = 0;
        bad.tax_amount = 0;
        bad.total_amount = 0;
      }
      if (t === 'order_items') { 
        bad.quantity = 1; 
        bad.unit_price = 10;
        bad.total_price = 10;
      }

      const { error } = await dbB.from(t).insert(bad).single();
      expect(error).not.toBeNull();
    }
  });
});