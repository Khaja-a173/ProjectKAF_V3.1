import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const UpdateBrandingSchema = z.object({
  logo_url: z.string().url().optional(),
  hero_video_url: z.string().url().optional(),
  theme: z.record(z.any()).optional(),
  gallery_urls: z.array(z.string().url()).optional()
});

export default async function brandingRoutes(app: FastifyInstance) {
  // GET /branding - Get tenant branding
  app.get('/branding', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      let { data, error } = await app.supabase
        .from('tenant_branding')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) throw error;

      // Create default branding if none exists
      if (!data) {
        const { data: newBranding, error: createError } = await app.supabase
          .from('tenant_branding')
          .insert({
            tenant_id: tenantId,
            theme: {
              primary: '#2563eb',
              secondary: '#64748b',
              accent: '#22c55e'
            },
            gallery_urls: []
          })
          .select()
          .single();

        if (createError) throw createError;
        data = newBranding;
      }

      return reply.send({ branding: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch branding');
      return reply.code(500).send({ error: 'failed_to_fetch_branding' });
    }
  });

  // PATCH /branding - Update tenant branding
  app.patch('/branding', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const body = UpdateBrandingSchema.parse(req.body);
    const tenantId = req.auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const updates = {
        ...body,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await app.supabase
        .from('tenant_branding')
        .upsert({
          tenant_id: tenantId,
          ...updates
        })
        .select()
        .single();

      if (error) throw error;

      return reply.send({ branding: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update branding');
      return reply.code(500).send({ error: 'failed_to_update_branding' });
    }
  });
}