import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const AddStaffSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'manager', 'staff', 'kitchen', 'cashier'])
});

export default async function staffRoutes(app: FastifyInstance) {
  // GET /staff - List staff members
  app.get('/staff', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('staff')
        .select(`
          *,
          users (
            email,
            first_name,
            last_name,
            phone,
            avatar_url,
            is_active,
            last_login_at
          )
        `)
        .in('tenant_id', tenantIds)
        .order('created_at');

      if (error) throw error;

      return reply.send({ staff: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch staff');
      return reply.code(500).send({ error: 'failed_to_fetch_staff' });
    }
  });

  // POST /staff - Add staff member
  app.post('/staff', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin']);
    }]
  }, async (req, reply) => {
    const body = AddStaffSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      // Check if user exists
      const { data: user, error: userError } = await app.supabase
        .from('users')
        .select('id, email')
        .eq('id', body.user_id)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          return reply.code(404).send({ error: 'user_not_found' });
        }
        throw userError;
      }

      // Add to staff
      const { data, error } = await app.supabase
        .from('staff')
        .insert({
          tenant_id: tenantId,
          user_id: body.user_id,
          role: body.role
        })
        .select(`
          *,
          users (
            email,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return reply.code(409).send({ error: 'staff_already_exists' });
        }
        throw error;
      }

      return reply.code(201).send({ staff: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to add staff');
      return reply.code(500).send({ error: 'failed_to_add_staff' });
    }
  });

  // DELETE /staff/:user_id - Remove staff member
  app.delete('/staff/:user_id', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin']);
    }]
  }, async (req, reply) => {
    const params = z.object({
      user_id: z.string().uuid()
    }).parse(req.params);

    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('staff')
        .delete()
        .eq('user_id', params.user_id)
        .in('tenant_id', tenantIds)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.code(404).send({ error: 'staff_not_found' });
        }
        throw error;
      }

      return reply.send({ removed: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to remove staff');
      return reply.code(500).send({ error: 'failed_to_remove_staff' });
    }
  });

  // GET /staff/shifts - List shifts (basic)
  app.get('/staff/shifts', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const tenantIds = req.auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('shifts')
        .select(`
          *,
          users!shifts_staff_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .in('tenant_id', tenantIds)
        .gte('starts_at', new Date().toISOString().split('T')[0]) // Today and future
        .order('starts_at');

      if (error) throw error;

      return reply.send({ shifts: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch shifts');
      return reply.code(500).send({ error: 'failed_to_fetch_shifts' });
    }
  });
}