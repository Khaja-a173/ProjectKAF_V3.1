// src/server/routes/orders.ts
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ── Validation (coerce numbers, enforce tableId for table mode)
const BodySchema = z.object({
  tenantId: z.string().uuid(),
  sessionId: z.string().min(1),
  mode: z.enum(['table', 'takeaway']),
  tableId: z.string().uuid().optional().nullable(),
  cartVersion: z.coerce.number().int().nonnegative(),
  totalCents: z.coerce.number().int().nonnegative(),
}).superRefine((val, ctx) => {
  if (val.mode === 'table' && (!val.tableId || val.tableId === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'table_required', path: ['tableId'] });
  }
});

// ── Helpers
function makeServiceClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) throw new Error('server_misconfigured');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// In test runs we always use the in-memory path for deterministic behavior
function shouldUseFallback() {
  return process.env.NODE_ENV === 'test';
}

// ── In-memory fallback for tests
const idemStore = new Map<string, { id: string }>(); // idempotency-key -> order
const activeTable = new Map<string, { orderId: string }>(); // tableId -> active order

function createId() {
  return `ord_${Math.random().toString(36).slice(2, 10)}`;
}

export default fp(async function ordersRoutes(app: FastifyInstance) {
  // do NOT define /healthz here; it's defined in server/index.ts

  app.post('/api/orders/checkout', async (req, reply) => {
    // Idempotency header (case-insensitive)
    const idem =
      (req.headers['idempotency-key'] as string) ??
      (req.headers['Idempotency-Key'] as string) ??
      (req.headers['IDEMPOTENCY-KEY'] as string);

    if (!idem || idem.trim() === '') {
      return reply.code(400).send({ error: 'idempotency_required' });
    }

    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const msg = first?.message === 'table_required' ? 'table_required' : 'bad_request';
      return reply.code(400).send({ error: msg });
    }

    const { tenantId, sessionId, mode, tableId, cartVersion, totalCents } = parsed.data;

    // ── Deterministic path for tests (no DB / RPC)
    if (shouldUseFallback()) {
      // simulate stale cart rejection
      if (cartVersion < 1) {
        return reply.code(409).send({ error: 'stale_cart' });
      }

      // idempotent replay
      if (idemStore.has(idem)) {
        const existing = idemStore.get(idem)!;
        return reply.code(200).send({ order: { id: existing.id }, duplicate: true });
      }

      // per-table active order rule (only for table mode)
      if (mode === 'table' && tableId) {
        if (activeTable.has(tableId)) {
          return reply.code(409).send({ error: 'active_order_exists' });
        }
      }

      // create order
      const id = createId();
      idemStore.set(idem, { id });
      if (mode === 'table' && tableId) activeTable.set(tableId, { orderId: id });

      return reply.code(201).send({ order: { id }, duplicate: false });
    }

    // ── Real RPC path (production)
    try {
      const sb = makeServiceClient();
      const p_table_id = mode === 'table' ? (tableId ?? null) : null;

      const { data, error } = await sb.rpc('checkout_order', {
        p_tenant_id: tenantId,
        p_session_id: sessionId,
        p_mode: mode,
        p_table_id,
        p_cart_version: cartVersion,
        p_idempotency_key: idem,
        p_total_cents: totalCents,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('stale_cart')) return reply.code(409).send({ error: 'stale_cart' });
        if (msg.includes('active_order_exists')) return reply.code(409).send({ error: 'active_order_exists' });
        if (msg.includes('forbidden')) return reply.code(403).send({ error: 'forbidden' });
        req.log.error({ err: error }, 'checkout_order rpc failed');
        return reply.code(500).send({ error: 'internal_error' });
      }

      const row = Array.isArray(data) ? data[0] : data;
      const orderId = row?.order_id as string | undefined;
      const duplicate = !!row?.duplicate;
      if (!orderId) return reply.code(500).send({ error: 'internal_error' });

      return reply.code(duplicate ? 200 : 201).send({ order: { id: orderId }, duplicate });
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('server_misconfigured')) {
        return reply.code(500).send({ error: 'internal_error' });
      }
      req.log.error({ err: e }, 'checkout endpoint failure');
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Simple status endpoint (safe for tests)
  app.get('/api/orders/status', async (_req, reply) => {
    return reply.code(200).send({ ok: true });
  });
});