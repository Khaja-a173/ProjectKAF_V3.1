import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const LockTableSchema = z.object({
  is_locked: z.boolean()
});

export default async function tablesRoutes(app: FastifyInstance) {
  // GET /tables - List tables with occupancy
  app.get('/tables', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      // Get tables with occupancy info
      const { data: tables, error: tablesError } = await app.supabase
        .from('restaurant_tables')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('table_number');

      if (tablesError) throw tablesError;

      // Get active orders for occupancy calculation
      const { data: activeOrders, error: ordersError } = await app.supabase
        .from('orders')
        .select('table_id, status')
        .in('tenant_id', tenantIds)
        .not('status', 'in', '(cancelled,paid)')
        .not('table_id', 'is', null);

      if (ordersError) throw ordersError;

      // Calculate occupancy
      const tablesWithOccupancy = (tables || []).map(table => {
        const hasActiveOrder = (activeOrders || []).some(order => 
          order.table_id === table.id && 
          !['cancelled', 'paid'].includes(order.status)
        );

        return {
          ...table,
          is_occupied: hasActiveOrder,
          computed_status: table.is_locked ? 'locked' : 
                          hasActiveOrder ? 'occupied' : 
                          table.status || 'available'
        };
      });

      return reply.send({ tables: tablesWithOccupancy });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch tables');
      return reply.code(500).send({ error: 'failed_to_fetch_tables' });
    }
  });

  // PATCH /tables/:id/lock - Lock/unlock table
  app.patch('/tables/:id/lock', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      id: z.string().uuid()
    }).parse(req.params);

    const body = LockTableSchema.parse(req.body);
    const tenantIds = req.auth?.tenantIds || [];

    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('restaurant_tables')
        .update({
          is_locked: body.is_locked,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .in('tenant_id', tenantIds)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'table_not_found' });
        }
        throw error;
      }

      return reply.send({ table: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update table lock');
      return reply.code(500).send({ error: 'failed_to_update_table' });
    }
  });
}