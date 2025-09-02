import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const QrResolveSchema = z.object({
  code: z.string().min(1).max(10),
  table: z.string().regex(/^T\d{2}$/)
});

export default async function qrRoutes(app: FastifyInstance) {
  // --------------------------------------------------------------------------
  // GET /qr/resolve?code=<tenantCode>&table=<tableNumber>  (ProjectKAF enriched)
  // --------------------------------------------------------------------------
  app.get('/qr/resolve', async (req, reply) => {
    const query = QrResolveSchema.safeParse((req as any).query);
    if (!query.success) {
      return reply.code(400).send({ error: 'invalid_query', details: query.error.flatten() });
    }
    const { code, table } = query.data;

    try {
      // Lookup tenant by code, fallback by slug
      let { data: tenant, error: tenantError } = await app.supabase
        .from('tenants')
        .select('id, name, slug, code, branding')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (tenantError || !tenant) {
        const { data: tenantBySlug } = await app.supabase
          .from('tenants')
          .select('id, name, slug, code, branding')
          .eq('slug', code.toLowerCase())
          .maybeSingle();

        if (!tenantBySlug) {
          return reply.code(404).send({ error: 'tenant_not_found' });
        }
        tenant = tenantBySlug;
      }

      // Lookup table by table_number
      const { data: tableData, error: tableError } = await app.supabase
        .from('restaurant_tables')
        .select('id, table_number, status, capacity, section')
        .eq('tenant_id', tenant.id)
        .eq('table_number', table)
        .maybeSingle();

      if (tableError || !tableData) {
        return reply.code(404).send({ error: 'table_not_found' });
      }

      // Get branding (safe fallback if missing)
      const { data: branding } = await app.supabase
        .from('tenant_branding')
        .select('theme, logo_url, hero_video_url')
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      // Get menu categories
      const { data: categories } = await app.supabase
        .from('categories')
        .select('id, name, description, sort_order')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('sort_order');

      // Get menu items
      const { data: items } = await app.supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, is_available, preparation_time, calories, allergens, dietary_info, is_featured, sort_order')
        .eq('tenant_id', tenant.id)
        .eq('is_available', true)
        .order('sort_order');

      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          code: tenant.code,
          branding: tenant.branding || {}
        },
        table: {
          id: tableData.id,
          table_number: tableData.table_number,
          section: tableData.section,
          status: tableData.status,
          capacity: tableData.capacity
        },
        branding: branding || { theme: {}, logo_url: null, hero_video_url: null },
        menu_bootstrap: {
          categories: categories || [],
          items: items || []
        }
      });
    } catch (err: any) {
      app.log.error({ err }, 'qr_resolve_failed');
      return reply.code(500).send({ error: 'qr_resolve_failed' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /qr/:tenantCode/:tableNumber  (Part2 compatibility, simpler payload)
  // --------------------------------------------------------------------------
  app.get<{
    Params: { tenantCode: string; tableNumber: string }
  }>('/qr/:tenantCode/:tableNumber', async (req, reply) => {
    const { tenantCode, tableNumber } = req.params;

    try {
      // Find tenant by code
      const { data: tenant, error: tErr } = await app.supabase
        .from('tenants')
        .select('id, name, code, branding')
        .eq('code', tenantCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!tenant) return reply.code(404).send({ error: 'tenant_not_found' });

      // Find table
      const { data: table, error: tabErr } = await app.supabase
        .from('restaurant_tables')
        .select('id, table_number, section, capacity')
        .eq('tenant_id', tenant.id)
        .eq('table_number', tableNumber)
        .maybeSingle();
      if (tabErr) throw tabErr;
      if (!table) return reply.code(404).send({ error: 'table_not_found' });

      return reply.send({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          code: tenant.code,
          branding: tenant.branding || {}
        },
        table: {
          id: table.id,
          number: table.table_number,
          section: table.section,
          capacity: table.capacity
        }
      });
    } catch (err: any) {
      app.log.error({ err }, 'qr_simple_failed');
      return reply.code(500).send({ error: 'qr_simple_failed' });
    }
  });
}