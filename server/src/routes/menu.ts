import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// -----------------------------
// Schemas
// -----------------------------
const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  sort_order: z.number().int().default(0)
});

const CreateMenuItemSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  preparation_time: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional()
});

const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

const BulkCsvSchema = z.object({
  csv: z.string().min(1)
});

// -----------------------------
// Helpers (tables compatibility: categories vs menu_categories)
// -----------------------------
async function fetchTenantIdByCode(app: FastifyInstance, tenantCode: string) {
  const { data, error } = await app.supabase
    .from('tenants')
    .select('id')
    .eq('code', tenantCode)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data?.id as string | undefined;
}

type CategoryRow = { id: string; name: string; description?: string | null; sort_order?: number | null };

async function fetchCategories(app: FastifyInstance, tenantId: string): Promise<CategoryRow[]> {
  // Try menu_categories, fall back to categories
  const tryTables = ['menu_categories', 'categories'];
  for (const table of tryTables) {
    try {
      const { data, error } = await app.supabase
        .from(table)
        .select('id, name, description, sort_order')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');
      if (error) {
        // try next table on relation-not-found/unknown-table; otherwise bubble
        if ((error as any)?.code && String((error as any).code).startsWith('42')) continue;
        if ((error as any)?.message?.toLowerCase?.().includes('relation') && (error as any)?.message?.includes('does not exist')) continue;
        throw error;
      }
      if (data) return data as unknown as CategoryRow[];
    } catch {
      // fall through to next
    }
  }
  return [];
}

type PublicItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url?: string | null;
  category_name?: string;
};

async function fetchPublicItems(app: FastifyInstance, tenantId: string, categories: CategoryRow[]): Promise<PublicItem[]> {
  const { data, error } = await app.supabase
    .from('menu_items')
    .select('id, name, description, price, category_id, is_available, image_url, is_active')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('category_id')
    .order('name');
  if (error) throw error;

  const byId = new Map(categories.map((c) => [c.id, c]));
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price ?? 0),
    category_id: row.category_id,
    is_available: !!row.is_available,
    image_url: row.image_url ?? null,
    category_name: byId.get(row.category_id)?.name
  }));
}

export default async function menuRoutes(app: FastifyInstance) {
  // --------------------------------------------------------------------------
  // NEW (merged): GET /menu/public?tenantCode=XXXX  — public menu for tenant
  // --------------------------------------------------------------------------
  app.get('/menu/public', async (req, reply) => {
    const qs = z.object({ tenantCode: z.string().min(1) }).safeParse((req as any).query);
    if (!qs.success) {
      return reply.code(400).send({ error: 'tenantCode_required' });
    }

    try {
      const code = qs.data.tenantCode.toUpperCase();
      const tenantId = await fetchTenantIdByCode(app, code);
      if (!tenantId) return reply.code(404).send({ error: 'tenant_not_found' });

      const categories = await fetchCategories(app, tenantId);
      const items = await fetchPublicItems(app, tenantId, categories);

      return reply.send({ categories, items });
    } catch (err: any) {
      app.log.error({ err }, 'public_menu_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /menu/categories - List categories (auth)
  // --------------------------------------------------------------------------
  app.get('/menu/categories', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const tenantIds = (req as any).auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('categories')
        .select('*')
        .in('tenant_id', tenantIds)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return reply.send({ categories: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch categories');
      return reply.code(500).send({ error: 'failed_to_fetch_categories' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /menu/categories - Create category (auth: admin/manager)
  // --------------------------------------------------------------------------
  app.post('/menu/categories', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const parsed = CreateCategorySchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const tenantId = (req as any).auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const { data, error } = await app.supabase
        .from('categories')
        .insert({
          tenant_id: tenantId,
          name: parsed.data.name,
          description: parsed.data.description,
          sort_order: parsed.data.sort_order
        })
        .select()
        .single();

      if (error) throw error;

      return reply.code(201).send({ category: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to create category');
      return reply.code(500).send({ error: 'failed_to_create_category' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /menu/items - List menu items (auth)
  // --------------------------------------------------------------------------
  app.get('/menu/items', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const query = z.object({
      category_id: z.string().uuid().optional()
    }).safeParse((req as any).query);

    if (!query.success) {
      return reply.code(400).send({ error: 'invalid_query', details: query.error.flatten() });
    }

    const tenantIds = (req as any).auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      let qb = app.supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .in('tenant_id', tenantIds)
        .order('sort_order');

      if (query.data.category_id) {
        qb = qb.eq('category_id', query.data.category_id);
      }

      const { data, error } = await qb;
      if (error) throw error;

      return reply.send({ items: data || [] });
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch menu items');
      return reply.code(500).send({ error: 'failed_to_fetch_menu_items' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /menu/items - Create menu item (auth: admin/manager)
  // --------------------------------------------------------------------------
  app.post('/menu/items', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const parsed = CreateMenuItemSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const tenantId = (req as any).auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const { data, error } = await app.supabase
        .from('menu_items')
        .insert({
          tenant_id: tenantId,
          category_id: parsed.data.category_id,
          name: parsed.data.name,
          description: parsed.data.description,
          price: parsed.data.price,
          cost: parsed.data.cost,
          image_url: parsed.data.image_url,
          video_url: parsed.data.video_url,
          is_available: parsed.data.is_available,
          is_featured: parsed.data.is_featured,
          preparation_time: parsed.data.preparation_time,
          calories: parsed.data.calories
        })
        .select()
        .single();

      if (error) throw error;

      return reply.code(201).send({ item: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to create menu item');
      return reply.code(500).send({ error: 'failed_to_create_menu_item' });
    }
  });

  // --------------------------------------------------------------------------
  // PATCH /menu/items/:id - Update menu item (auth: admin/manager)
  // --------------------------------------------------------------------------
  app.patch('/menu/items/:id', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse((req as any).params);
    if (!params.success) {
      return reply.code(400).send({ error: 'invalid_params', details: params.error.flatten() });
    }

    const body = UpdateMenuItemSchema.safeParse((req as any).body);
    if (!body.success) {
      return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });
    }

    const tenantIds = (req as any).auth?.tenantIds || [];
    if (tenantIds.length === 0) {
      return reply.code(403).send({ error: 'no_tenant_access' });
    }

    try {
      const { data, error } = await app.supabase
        .from('menu_items')
        .update(body.data)
        .eq('id', params.data.id)
        .in('tenant_id', tenantIds)
        .select()
        .maybeSingle();

      if (error) {
        if ((error as any).code === 'PGRST116') {
          return reply.code(404).send({ error: 'menu_item_not_found' });
        }
        throw error;
      }

      return reply.send({ item: data });
    } catch (err: any) {
      app.log.error(err, 'Failed to update menu item');
      return reply.code(500).send({ error: 'failed_to_update_menu_item' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /menu/items:bulk - Bulk import from CSV (auth: admin/manager)
  // --------------------------------------------------------------------------
  app.post('/menu/items:bulk', {
    preHandler: [app.requireAuth, async (req, reply) => {
      await app.requireRole(req, reply, ['admin', 'manager']);
    }]
  }, async (req, reply) => {
    const parsed = BulkCsvSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const tenantId = (req as any).auth?.primaryTenantId;

    if (!tenantId) {
      return reply.code(403).send({ error: 'no_tenant_context' });
    }

    try {
      const lines = parsed.data.csv.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      const items: any[] = [];
      const errors: Array<{ row: number; error: string }> = [];

      // Preload all categories for fewer round-trips
      const { data: allCats } = await app.supabase
        .from('categories')
        .select('id, name')
        .eq('tenant_id', tenantId);
      const byName = new Map((allCats || []).map((c: any) => [String(c.name).trim().toLowerCase(), c.id]));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        try {
          const item: any = { tenant_id: tenantId };

          headers.forEach((header, index) => {
            const value = values[index];
            switch (header) {
              case 'name':
                item.name = value;
                break;
              case 'price':
                item.price = parseFloat(value) || 0;
                break;
              case 'cost':
                item.cost = parseFloat(value) || 0;
                break;
              case 'description':
                item.description = value;
                break;
              case 'image_url':
                item.image_url = value;
                break;
              case 'category': {
                const catId = byName.get(String(value).toLowerCase());
                if (catId) item.category_id = catId;
                break;
              }
            }
          });

          if (item.name && item.price && item.category_id) {
            items.push(item);
          } else {
            errors.push({ row: i + 1, error: 'Missing required fields: name, price, category' });
          }
        } catch {
          errors.push({ row: i + 1, error: 'Parse error' });
        }
      }

      // Insert valid items
      let created = 0;
      if (items.length > 0) {
        const { data, error } = await app.supabase
          .from('menu_items')
          .insert(items)
          .select();

        if (error) throw error;
        created = data?.length || 0;
      }

      return reply.send({
        created,
        errors,
        total_processed: Math.max(0, lines.length - 1)
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to bulk import menu items');
      return reply.code(500).send({ error: 'failed_to_bulk_import' });
    }
  });
}