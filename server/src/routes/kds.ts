import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

/**
 * KDS routes (Kitchen Display System)
 * - Supabase-only (uses app.supabase from our plugin; service role key is configured there)
 * - No app.pg dependency
 * - Feature flag: ENABLE_KDS_RT=true to enable KDS routes; otherwise lanes/orders return disabled
 * - Endpoints (under /kds/*):
 *   GET    /kds/orders
 *   POST   /kds/orders/:id/advance
 *   GET    /kds/lanes
 *   GET    /kds/latest
 */

const ENABLE_KDS_RT = ((process.env.ENABLE_KDS_RT ?? process.env.ENABLE_KDS ?? 'false').toLowerCase() === 'true');

// Kitchen can advance orders to these statuses
const AdvanceOrderSchema = z.object({
  to_status: z.enum(['preparing', 'ready', 'served'])
});

// Acceptable lane filter
const LaneQuerySchema = z.object({
  lane: z.enum(['queued', 'preparing', 'ready']).optional()
});

// Role guard helper (be lenient if auth payload shape differs)
function hasKitchenRole(req: any): boolean {
  const role =
    req?.auth?.role ??
    req?.auth?.memberships?.role ??
    req?.auth?.memberships?.[0]?.role ??
    req?.auth?.userRole ??
    null;
  return ['kitchen', 'staff', 'manager', 'admin'].includes(role || '');
}

export default async function kdsRoutes(app: FastifyInstance) {
  // All KDS routes require authentication
  app.addHook('preHandler', async (req: any, reply) => {
    const requireAuth = (app as any).requireAuth;
    if (typeof requireAuth === 'function') {
      // our auth plugin exposes the 2-arg form: (req, reply) => Promise<void> | void
      await requireAuth(req, reply);
    }
    // if no auth plugin is present, simply allow (useful for local dev)
  });

  // --------------------------------------------------------------------------
  // GET /kds/orders - Get orders grouped by lanes (queued, preparing, ready)
  // --------------------------------------------------------------------------
  app.get('/kds/orders', async (req: any, reply) => {
    if (!ENABLE_KDS_RT) {
      return reply.code(503).send({ error: 'KDS features disabled', reason: 'feature_flag_off' });
    }

    const parsed = LaneQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_query', details: parsed.error.flatten() });
    }

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    if (!hasKitchenRole(req)) {
      return reply.code(403).send({ error: 'insufficient_role' });
    }

    try {
      let orders: any[] = [];

      // Prefer view if available: v_orders_latest_status
      try {
        const { data: latest, error: viewError } = await app.supabase
          .from('v_orders_latest_status')
          .select('order_id, status, last_changed_at')
          .eq('tenant_id', tenantId);

        if (!viewError && latest && latest.length) {
          const activeOrderIds = latest
            .filter((o: any) => ['new', 'pending', 'confirmed', 'preparing', 'ready'].includes(o.status))
            .map((o: any) => o.order_id);

          if (activeOrderIds.length) {
            const { data: fullOrders, error: ordersErr } = await app.supabase
              .from('orders')
              .select(`
                *,
                order_items (
                  *,
                  menu_items (name, preparation_time, image_url)
                ),
                restaurant_tables (table_number)
              `)
              .in('id', activeOrderIds)
              .eq('tenant_id', tenantId);
            if (!ordersErr && fullOrders) {
              orders = fullOrders;
            }
          }
        }
      } catch (e) {
        app.log.warn('v_orders_latest_status view not available, using fallback for KDS orders');
      }

      // Fallback: query orders directly if view failed or returned nothing
      if (orders.length === 0) {
        const { data: fallbackOrders } = await app.supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              menu_items (name, preparation_time, image_url)
            ),
            restaurant_tables (table_number)
          `)
          .eq('tenant_id', tenantId)
          .not('status', 'in', '(cancelled,paid,served)')
          .order('created_at');

        orders = fallbackOrders || [];
      }

      const lanes = {
        queued: orders.filter((o: any) => ['new', 'pending', 'confirmed'].includes(o.status)),
        preparing: orders.filter((o: any) => o.status === 'preparing'),
        ready: orders.filter((o: any) => o.status === 'ready')
      };

      if (parsed.data.lane) {
        return reply.send({ [parsed.data.lane]: (lanes as any)[parsed.data.lane] });
      }
      return reply.send(lanes);
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch KDS orders');
      return reply.code(500).send({ error: 'failed_to_fetch_kds_orders' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /kds/orders/:id/advance - Advance order status
  // --------------------------------------------------------------------------
  app.post('/kds/orders/:id/advance', async (req: any, reply) => {
    if (!ENABLE_KDS_RT) {
      return reply.code(503).send({ error: 'KDS features disabled', reason: 'feature_flag_off' });
    }

    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    if (!params.success) {
      return reply.code(400).send({ error: 'invalid_params', details: params.error.flatten() });
    }

    const body = AdvanceOrderSchema.safeParse(req.body);
    if (!body.success) {
      return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });
    }

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    if (!hasKitchenRole(req)) {
      return reply.code(403).send({ error: 'insufficient_role' });
    }

    try {
      // Current order
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status, tenant_id')
        .eq('id', params.data.id)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (orderError) {
        app.log.error(orderError, 'order_fetch_failed');
        return reply.code(500).send({ error: 'order_fetch_failed' });
      }
      if (!order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      // Update order status + timestamps
      const updates: any = { status: body.data.to_status };
      const nowISO = new Date().toISOString();
      if (body.data.to_status === 'ready') updates.ready_at = nowISO;
      if (body.data.to_status === 'served') updates.served_at = nowISO;

      const { data: updatedOrder, error: updateError } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.data.id)
        .eq('tenant_id', tenantId)
        .select()
        .maybeSingle();

      if (updateError) {
        app.log.error(updateError, 'order_update_failed');
        return reply.code(500).send({ error: 'order_update_failed' });
      }

      // Insert status event (best-effort)
      try {
        await app.supabase.from('order_status_events').insert({
          tenant_id: tenantId,
          order_id: params.data.id,
          from_status: (order as any).status,
          to_status: body.data.to_status,
          created_by: req.auth?.userId || 'kitchen',
          created_at: nowISO
        });
      } catch (statusErr: any) {
        app.log.warn({ statusErr }, 'order_status_events insert skipped');
      }

      app.log.info(`KDS: Order ${params.data.id} advanced from ${(order as any).status} to ${body.data.to_status}`);
      return reply.send({ order: updatedOrder });
    } catch (err: any) {
      app.log.error(err, 'Failed to advance order status');
      return reply.code(500).send({ error: 'failed_to_advance_order' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /kds/lanes - Aggregate lane counts from view (fallback to zeros)
  // --------------------------------------------------------------------------
  app.get('/kds/lanes', async (req: any, reply) => {
    if (!ENABLE_KDS_RT) {
      return reply.code(503).send({ error: 'KDS features disabled', reason: 'feature_flag_off' });
    }

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('v_kds_lane_counts')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        app.log.warn('v_kds_lane_counts view not available, returning zeros');
        return reply.send({ tenant_id: tenantId, queued: 0, preparing: 0, ready: 0 });
      }

      return reply.send({
        tenant_id: tenantId,
        queued: data?.queued || 0,
        preparing: data?.preparing || 0,
        ready: data?.ready || 0
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch KDS lanes');
      return reply.code(500).send({ error: 'failed_to_fetch_kds_lanes' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /kds/latest - Latest order statuses from view
  // --------------------------------------------------------------------------
  app.get('/kds/latest', async (req: any, reply) => {
    if (!ENABLE_KDS_RT) {
      return reply.code(503).send({ error: 'KDS features disabled', reason: 'feature_flag_off' });
    }

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data, error } = await app.supabase
        .from('v_orders_latest_status')
        .select('order_id, status, last_changed_at')
        .eq('tenant_id', tenantId)
        .order('last_changed_at', { ascending: false });

      if (error) {
        app.log.warn('v_orders_latest_status view not available, returning empty array');
        return reply.send([]);
      }

      return reply.send(data || []);
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch latest statuses');
      return reply.code(500).send({ error: 'failed_to_fetch_latest_statuses' });
    }
  });
}