import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function ordersRoutes(app: FastifyInstance) {
  // ----------------------------------------------------------------------------
  // GET /orders - List orders with filtering
  // ----------------------------------------------------------------------------
  app.get('/orders', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const query = z.object({
      status: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(50)
    }).parse(req.query);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      let queryBuilder = app.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, price)
          ),
          restaurant_tables (table_number),
          customers (first_name, last_name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (query.status) {
        queryBuilder = queryBuilder.eq('status', query.status);
      }

      const offset = (query.page - 1) * query.limit;
      queryBuilder = queryBuilder.range(offset, offset + query.limit - 1);

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return reply.send({
        orders: data || [],
        page: query.page,
        limit: query.limit
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch orders');
      return reply.code(500).send({ error: 'failed_to_fetch_orders' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /orders/:orderId/status - Update order status
  // ----------------------------------------------------------------------------
  app.post('/orders/:orderId/status', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const params = z.object({
      orderId: z.string().uuid()
    }).parse(req.params);

    const body = z.object({
      to_status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled', 'voided']),
      note: z.string().optional()
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status')
        .eq('id', params.orderId)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      const updates: any = { status: body.to_status };
      if (body.to_status === 'ready') updates.ready_at = new Date().toISOString();
      if (body.to_status === 'served') updates.served_at = new Date().toISOString();
      if (body.to_status === 'paid') updates.paid_at = new Date().toISOString();
      if (body.note) updates.note = body.note;

      const { data: updatedOrder, error: updateError } = await app.supabase
        .from('orders')
        .update(updates)
        .eq('id', params.orderId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          return reply.code(404).send({ error: 'order_not_found' });
        }
        throw updateError;
      }

      // Insert into order_status_events (optional)
      try {
        await app.supabase.from('order_status_events').insert({
          tenant_id: tenantId,
          order_id: params.orderId,
          from_status: order.status,
          to_status: body.to_status,
          note: body.note ?? null,
          created_by: req.auth?.userId || 'staff',
          created_at: new Date().toISOString()
        });
      } catch (statusErr: any) {
        app.log.warn('order_status_events insert skipped', statusErr);
      }

      app.log.info(`Order ${params.orderId} status updated to ${body.to_status}`);

      return reply.send({ order: updatedOrder });
    } catch (err: any) {
      app.log.error(err, 'Failed to update order status');
      return reply.code(500).send({ error: 'failed_to_update_order_status' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /orders/:id/emit-status - Explicitly emit a status event
  // ----------------------------------------------------------------------------
  app.post('/orders/:id/emit-status', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z.object({
      to_status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled']),
      note: z.string().optional()
    }).parse(req.body);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(401).send({ error: 'Missing tenant ID' });
    }

    try {
      const { data: latest, error: latestErr } = await app.supabase
        .from('order_status_events')
        .select('to_status')
        .eq('order_id', params.id)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const fromStatus = latestErr ? 'pending' : latest?.to_status || 'pending';

      const { error: insertErr } = await app.supabase.from('order_status_events').insert({
        tenant_id: tenantId,
        order_id: params.id,
        from_status: fromStatus,
        to_status: body.to_status,
        note: body.note ?? null,
        created_by: req.auth?.userId || 'staff',
        created_at: new Date().toISOString()
      });
      if (insertErr) throw insertErr;

      return reply.send({ ok: true });
    } catch (err: any) {
      app.log.error(err, 'Failed to emit status change');
      return reply.code(500).send({ error: 'failed_to_emit_status_change' });
    }
  });

  // ----------------------------------------------------------------------------
  // GET /orders/:id/status - Get order status timeline
  // ----------------------------------------------------------------------------
  app.get('/orders/:id/status', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(400).send({ error: 'tenant_context_missing' });
    }

    try {
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, status')
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({ error: 'order_not_found' });
      }

      const { data: events, error: eventsError } = await app.supabase
        .from('order_status_events')
        .select('*')
        .eq('order_id', params.id)
        .eq('tenant_id', tenantId)
        .order('created_at');

      if (eventsError) {
        return reply.send({
          order_id: params.id,
          current: order.status || 'new',
          timeline: []
        });
      }

      const timeline = (events || []).map(event => ({
        at: event.created_at,
        from: event.from_status,
        to: event.to_status,
        note: event.note || null
      }));

      return reply.send({
        order_id: params.id,
        current: order.status || 'new',
        timeline
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to get order status');
      return reply.code(500).send({ error: 'failed_to_get_order_status' });
    }
  });
}