import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Helper routes for table management and availability

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
  // GET /tables/available - Check table availability for a given time/party size
  // Query params:
  //   at: ISO datetime (optional; defaults to now)
  //   guests: integer (optional; filters tables by capacity/seats)
  app.get('/tables/available', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    try {
      const tenantIds = req.auth?.tenantIds || [];
      if (tenantIds.length === 0) {
        return reply.code(403).send({ error: 'no_tenant_access' });
      }

      // Parse and normalize query
      const qp = z.object({
        at: z.string().datetime().optional(),
        guests: z.coerce.number().int().positive().optional()
      }).parse((req.query || {}) as any);

      const atISO = qp.at || new Date().toISOString();
      const guests = qp.guests;

      // 1) Fetch tables for tenant(s)
      const { data: tables, error: tablesError } = await app.supabase
        .from('restaurant_tables')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('table_number', { ascending: true });

      if (tablesError) throw tablesError;

      // 2) Fetch "active" orders to determine occupancy NOW.
      //    We consider any order that is not cancelled/paid as occupying the table.
      const { data: activeOrders, error: ordersError } = await app.supabase
        .from('orders')
        .select('id, table_id, status, created_at')
        .in('tenant_id', tenantIds)
        .not('status', 'in', '(cancelled,paid)')
        .not('table_id', 'is', null);

      if (ordersError) throw ordersError;

      // Build a quick lookup of occupied tables
      const occupiedNow = new Set<string>(
        (activeOrders || [])
          .filter(o => !!o.table_id)
          .map(o => String(o.table_id))
      );

      // Optional capacity filter helper
      const fitsParty = (t: any) => {
        if (!guests) return true;
        const seats = (t.seats ?? t.capacity ?? t.max_seats ?? null);
        if (typeof seats === 'number') return seats >= guests;
        return true; // if unknown, do not exclude
      };

      // Partition tables into available/unavailable
      const available = (tables || []).filter(t =>
        !t.is_locked &&
        !occupiedNow.has(String(t.id)) &&
        fitsParty(t)
      );

      const unavailable = (tables || []).filter(t =>
        t.is_locked || occupiedNow.has(String(t.id)) || !fitsParty(t)
      );

      // Heuristic "next available at":
      // If nothing is available right now, estimate the next slot by adding 60 minutes
      // to the OLDEST active order per table (if present). This is a best-effort estimate
      // given current schema (no explicit reservation end time).
      let nextAvailableAt: string | null = null;
      if (available.length === 0 && (activeOrders || []).length > 0) {
        // Oldest created_at + 60 min
        const sorted = [...(activeOrders || [])]
          .filter(o => o.created_at)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sorted.length > 0) {
          const first = sorted[0];
          const dt = new Date(first.created_at);
          dt.setMinutes(dt.getMinutes() + 60);
          nextAvailableAt = dt.toISOString();
        }
      }

      return reply.send({
        at: atISO,
        guests: guests ?? null,
        available,
        unavailable,
        nextAvailableAt
      });
    } catch (err: any) {
      app.log.error({ err }, 'failed_to_check_table_availability');
      return reply.code(500).send({ error: 'failed_to_check_table_availability' });
    }
  });

  const Body = z.object({
    at: z.string().datetime().optional(),
    guests: z.coerce.number().int().positive().optional()
  });

  app.post('/tables/available', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    try {
      const tenantIds = req.auth?.tenantIds || [];
      if (tenantIds.length === 0) {
        return reply.code(403).send({ error: 'no_tenant_access' });
      }

      // Parse and normalize body
      const qp = Body.parse((req.body || {}) as any);

      const atISO = qp.at || new Date().toISOString();
      const guests = qp.guests;

      // 1) Fetch tables for tenant(s)
      const { data: tables, error: tablesError } = await app.supabase
        .from('restaurant_tables')
        .select('*')
        .in('tenant_id', tenantIds)
        .order('table_number', { ascending: true });

      if (tablesError) throw tablesError;

      // 2) Fetch "active" orders to determine occupancy NOW.
      //    We consider any order that is not cancelled/paid as occupying the table.
      const { data: activeOrders, error: ordersError } = await app.supabase
        .from('orders')
        .select('id, table_id, status, created_at')
        .in('tenant_id', tenantIds)
        .not('status', 'in', '(cancelled,paid)')
        .not('table_id', 'is', null);

      if (ordersError) throw ordersError;

      // Build a quick lookup of occupied tables
      const occupiedNow = new Set<string>(
        (activeOrders || [])
          .filter(o => !!o.table_id)
          .map(o => String(o.table_id))
      );

      // Optional capacity filter helper
      const fitsParty = (t: any) => {
        if (!guests) return true;
        const seats = (t.seats ?? t.capacity ?? t.max_seats ?? null);
        if (typeof seats === 'number') return seats >= guests;
        return true; // if unknown, do not exclude
      };

      // Partition tables into available/unavailable
      const available = (tables || []).filter(t =>
        !t.is_locked &&
        !occupiedNow.has(String(t.id)) &&
        fitsParty(t)
      );

      const unavailable = (tables || []).filter(t =>
        t.is_locked || occupiedNow.has(String(t.id)) || !fitsParty(t)
      );

      // Heuristic "next available at":
      // If nothing is available right now, estimate the next slot by adding 60 minutes
      // to the OLDEST active order per table (if present). This is a best-effort estimate
      // given current schema (no explicit reservation end time).
      let nextAvailableAt: string | null = null;
      if (available.length === 0 && (activeOrders || []).length > 0) {
        // Oldest created_at + 60 min
        const sorted = [...(activeOrders || [])]
          .filter(o => o.created_at)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        if (sorted.length > 0) {
          const first = sorted[0];
          const dt = new Date(first.created_at);
          dt.setMinutes(dt.getMinutes() + 60);
          nextAvailableAt = dt.toISOString();
        }
      }

      return reply.send({
        at: atISO,
        guests: guests ?? null,
        available,
        unavailable,
        nextAvailableAt
      });
    } catch (err: any) {
      app.log.error({ err }, 'failed_to_check_table_availability');
      return reply.code(500).send({ error: 'failed_to_check_table_availability' });
    }
  });
}