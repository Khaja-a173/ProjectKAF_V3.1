import 'dotenv/config';     // ensure SUPABASE vars load
import './setupServer';     // start the API server & wait
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SB_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE!;
const sb = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false } });

const TENANT = '11111111-1111-1111-1111-111111111111'; // use a stable UUID for tests
const TABLE = '22222222-2222-2222-2222-222222222222';
const SESSION = 'sess-e2e-1';

async function ensureSession(cartVersion = 0) {
  // create table_sessions row (idempotent)
  await sb.from('table_sessions').upsert([{
    id: SESSION,
    tenant_id: TENANT,
    table_id: TABLE,
    status: 'active',
    cart_version: cartVersion
  }], { onConflict: 'id' });
}

function idem() {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  const arr = new Uint8Array(16);
  require('crypto').randomFillSync(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
}

describe('Idempotent Order Placement', () => {
  beforeAll(async () => {
    await ensureSession(0);
  });

  it('rejects missing idempotency key', async () => {
    const res = await fetch('http://127.0.0.1:3001/api/orders/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tenantId: TENANT, sessionId: SESSION, mode: 'table', tableId: TABLE,
        cartVersion: 0,
        items: [{ id: 'm1', name: 'Burger', price_cents: 1000, qty: 1 }]
      })
    });
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toBe('idempotency_required');
  });

  it('rapid double-click creates exactly one order', async () => {
    // Reset session cart_version to 0
    await sb.from('table_sessions').update({ cart_version: 0 }).eq('tenant_id', TENANT).eq('id', SESSION);
    const key = idem();

    const payload = {
      tenantId: TENANT, sessionId: SESSION, mode: 'table', tableId: TABLE,
      cartVersion: 0,
      totalCents: 1000
    };

    const [r1, r2] = await Promise.allSettled([
      fetch('http://127.0.0.1:3001/api/orders/checkout', {
        method: 'POST', 
        headers: { 
          'content-type': 'application/json',
          'Idempotency-Key': key
        }, 
        body: JSON.stringify(payload)
      }),
      fetch('http://127.0.0.1:3001/api/orders/checkout', {
        method: 'POST', 
        headers: { 
          'content-type': 'application/json',
          'Idempotency-Key': key
        }, 
        body: JSON.stringify(payload)
      })
    ]);

    // At least one must be 201; the other is 200 duplicate or 409 active conflict
    const ok1 = r1.status === 'fulfilled' ? r1.value : null;
    const ok2 = r2.status === 'fulfilled' ? r2.value : null;
    expect([201,200,409]).toContain(ok1?.status ?? 0);
    expect([201,200,409]).toContain(ok2?.status ?? 0);

    // DB: exactly one order row with this idempotency key
    const { data } = await sb.from('orders').select('id').eq('tenant_id', TENANT).eq('idempotency_key', key);
    expect((data ?? []).length).toBe(1);
  });

  it('optimistic cart lock rejects stale cartVersion', async () => {
    // After previous success cart_version should be 1
    const key = idem();
    const res = await fetch('http://127.0.0.1:3001/api/orders/checkout', {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'Idempotency-Key': key
      },
      body: JSON.stringify({
        tenantId: TENANT, sessionId: SESSION, mode: 'table', tableId: TABLE,
        cartVersion: 0, // stale
        totalCents: 1000
      })
    });
    expect(res.status).toBe(409);
    const j = await res.json();
    expect(j.error).toBe('stale_cart');
  });

  it('one active order per table (dine-in)', async () => {
    // Reset to allow a new active order
    await sb.from('table_sessions').update({ cart_version: 1 }).eq('tenant_id', TENANT).eq('id', SESSION);

    // First order (cartVersion=1)
    const k1 = idem();
    let r1 = await fetch('http://127.0.0.1:3001/api/orders/checkout', {
      method: 'POST', 
      headers: { 
        'content-type': 'application/json',
        'Idempotency-Key': k1
      },
      body: JSON.stringify({
        tenantId: TENANT, sessionId: SESSION, mode: 'table', tableId: TABLE,
        cartVersion: 1, totalCents: 1000
      })
    });
    expect([200,201]).toContain(r1.status);

    // Second order attempt with new idempotency key should conflict due to active per table
    const k2 = idem();
    let r2 = await fetch('http://127.0.0.1:3001/api/orders/checkout', {
      method: 'POST', 
      headers: { 
        'content-type': 'application/json',
        'Idempotency-Key': k2
      },
      body: JSON.stringify({
        tenantId: TENANT, sessionId: SESSION, mode: 'table', tableId: TABLE,
        cartVersion: 2, totalCents: 500
      })
    });
    expect(r2.status).toBe(409);
    const j = await r2.json();
    expect(j.error).toBe('active_order_exists');
  });

  it('takeaway orders are not blocked by per-table rule', async () => {
    const k3 = idem();
    // Ensure a takeaway session row exists too
    await sb.from('table_sessions').upsert([{ id: 'sess-take-1', tenant_id: TENANT, table_id: null, status: 'active', cart_version: 0 }], { onConflict: 'id' });

    const res = await fetch('http://127.0.0.1:3001/api/orders/checkout', {
      method: 'POST', 
      headers: { 
        'content-type': 'application/json',
        'Idempotency-Key': k3
      },
      body: JSON.stringify({
        tenantId: TENANT, sessionId: 'sess-take-1', mode: 'takeaway',
        cartVersion: 0,
        totalCents: 700
      })
    });
    expect([200,201]).toContain(res.status);
    const body = await res.json();
    expect(body?.order?.id).toBeTruthy();
  });
});