// server/src/routes/cart.ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// ----------------------------------------------------------------------------
// Feature flags
// ----------------------------------------------------------------------------
const ENABLE_CART_DB = process.env.ENABLE_CART_DB === 'true';            // DB-backed carts (carts/cart_items tables)
const ENABLE_CART_CHECKOUT = process.env.ENABLE_CART_CHECKOUT !== 'false'; // allow checkout endpoints (default true)

// ----------------------------------------------------------------------------
// In-memory cart store (dev fallback)
// ----------------------------------------------------------------------------
type MemoryCartItem = {
  menu_item_id: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};
type MemoryCart = {
  id: string;
  tenant_id: string;
  table_id?: string | null;
  mode: 'dine_in' | 'takeaway';
  items: MemoryCartItem[];
  created_at: string;
  updated_at: string;
};
const memStore = new Map<string, MemoryCart>();

// Helpers
const uuidLike = () =>
  (globalThis as any)?.crypto?.randomUUID?.() ??
  ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }));

const money = (v: unknown) => parseFloat(String(v ?? 0)) || 0;
const int = (v: unknown) => parseInt(String(v ?? 0)) || 0;

// ----------------------------------------------------------------------------
// Schemas
// ----------------------------------------------------------------------------
const StartCartSchema = z.object({
  mode: z.enum(['dine_in', 'takeaway']),
  table_id: z.string().uuid().nullable().optional()
});

const CartItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  qty: z.number().int().positive(),
  notes: z.string().optional()
});

const AddItemsSchema = z.object({
  cart_id: z.string(),
  items: z.array(CartItemSchema).min(1)
});

const ConfirmOrderSchema = z.object({
  cart_id: z.string(),
  notes: z.string().optional(),
  assign_staff_id: z.string().uuid().optional()
});

// Part‑2 compatibility: POST /cart payload
const CreateCartCompatSchema = z.object({
  items: z.array(z.object({ menu_item_id: z.string().uuid(), qty: z.number().int().positive(), note: z.string().optional() })).min(1),
  order_type: z.enum(['dine_in', 'takeaway']),
  table_id: z.string().uuid().optional(),
  tenant_code: z.string().min(1)
});

export default async function cartRoutes(app: FastifyInstance) {
  // Guard: checkout toggle
  if (!ENABLE_CART_CHECKOUT) {
    app.log.info('Cart/Checkout features disabled via ENABLE_CART_CHECKOUT=false');
    // Provide a noop health to avoid 404s for mounted prefix
    app.get('/cart/_disabled', async () => ({ ok: true, reason: 'checkout_disabled' }));
    return;
  }

  // --------------------------------------------------------------------------
  // POST /cart/start  → start a cart session
  // --------------------------------------------------------------------------
  app.post('/cart/start', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const body = StartCartSchema.safeParse((req as any).body);
    if (!body.success) return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });

    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(400).send({ error: 'tenant_context_missing' });

    try {
      if (ENABLE_CART_DB) {
        // DB-backed: create carts row (let DB default generate id)
        const { data: cartRow, error } = await app.supabase
          .from('carts')
          .insert({
            tenant_id: tenantId,
            order_type: body.data.mode,
            table_id: body.data.table_id ?? null
          })
          .select('id')
          .single();
        if (error) throw error;
        return reply.code(201).send({ cart_id: cartRow!.id });
      }

      // Memory-backed
      const cartId = `cart_${uuidLike()}`;
      const cart: MemoryCart = {
        id: cartId,
        tenant_id: tenantId,
        table_id: body.data.table_id ?? null,
        mode: body.data.mode,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memStore.set(cartId, cart);
      return reply.code(201).send({ cart_id: cartId });
    } catch (err: any) {
      app.log.error({ err }, 'cart_start_failed');
      return reply.code(500).send({ error: 'failed_to_start_cart' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /cart  → Part‑2 compatibility (create cart + items)
  // --------------------------------------------------------------------------
  app.post('/cart', async (req, reply) => {
    const parsed = CreateCartCompatSchema.safeParse((req as any).body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });

    const { items, order_type, table_id, tenant_code } = parsed.data;

    try {
      // Resolve tenant by code
      const { data: tenant, error: tErr } = await app.supabase
        .from('tenants')
        .select('id, is_active')
        .eq('code', tenant_code)
        .eq('is_active', true)
        .maybeSingle();
      if (tErr) throw tErr;
      if (!tenant) return reply.code(404).send({ error: 'tenant_not_found' });

      if (!ENABLE_CART_DB) {
        // Create in-memory cart and push items (compat path)
        const cartId = `cart_${uuidLike()}`;
        const cart: MemoryCart = {
          id: cartId,
          tenant_id: tenant.id,
          table_id: table_id ?? null,
          mode: order_type,
          items: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        // Fetch menu item details for pricing
        const menuIds = items.map(i => i.menu_item_id);
        const { data: menuItems, error: miErr } = await app.supabase
          .from('menu_items')
          .select('id, name, price, is_available')
          .in('id', menuIds)
          .eq('tenant_id', tenant.id);
        if (miErr) throw miErr;
        if (!menuItems || menuItems.length !== menuIds.length || menuItems.some(m => !m.is_available)) {
          return reply.code(400).send({ error: 'invalid_menu_items' });
        }
        for (const i of items) {
          const m = menuItems.find(m => m.id === i.menu_item_id)!;
          cart.items.push({ menu_item_id: i.menu_item_id, name: m.name, price: money(m.price), qty: i.qty, notes: i.note });
        }
        memStore.set(cartId, cart);
        return reply.code(201).send({ cart_id: cartId });
      }

      // DB-backed: create cart then cart_items
      const { data: newCart, error: cErr } = await app.supabase
        .from('carts')
        .insert({
          tenant_id: tenant.id,
          order_type: order_type,
          table_id: table_id ?? null
        })
        .select('id')
        .single();
      if (cErr) throw cErr;

      // Validate menu ids & availability
      const menuIds = items.map(i => i.menu_item_id);
      const { data: menuItems, error: miErr } = await app.supabase
        .from('menu_items')
        .select('id, is_available')
        .in('id', menuIds)
        .eq('tenant_id', tenant.id);
      if (miErr) throw miErr;
      if (!menuItems || menuItems.length !== menuIds.length || menuItems.some(m => !m.is_available)) {
        return reply.code(400).send({ error: 'invalid_menu_items' });
      }

      const insertItems = items.map(i => ({
        cart_id: newCart!.id,
        menu_item_id: i.menu_item_id,
        quantity: i.qty,
        note: i.note ?? null
      }));
      const { error: ciErr } = await app.supabase.from('cart_items').insert(insertItems);
      if (ciErr) throw ciErr;

      return reply.code(201).send({ cart_id: newCart!.id });
    } catch (err: any) {
      app.log.error({ err }, 'cart_create_failed');
      if (err?.code === '42P01') {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // --------------------------------------------------------------------------
  // GET /cart/:id  → fetch cart (works for both modes)
  // --------------------------------------------------------------------------
  app.get('/cart/:id', async (req, reply) => {
    const params = z.object({ id: z.string() }).safeParse((req as any).params);
    if (!params.success) return reply.code(400).send({ error: 'invalid_params', details: params.error.flatten() });

    try {
      if (ENABLE_CART_DB) {
        // Fetch cart
        const { data: cart, error: cErr } = await app.supabase
          .from('carts')
          .select('id, tenant_id, order_type, table_id, created_at, updated_at')
          .eq('id', params.data.id)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!cart) return reply.code(404).send({ error: 'cart_not_found' });

        // Fetch items joined w/ menu_items
        const { data: items, error: iErr } = await app.supabase
          .from('cart_items')
          .select(`
            id, quantity, note,
            menu_items!inner(id, name, description, price)
          `)
          .eq('cart_id', params.data.id);
        if (iErr) throw iErr;

        const rows = (items || []).map((r: any) => ({
          id: r.id,
          quantity: int(r.quantity),
          note: r.note ?? null,
          menu_item_id: r.menu_items?.id,
          name: r.menu_items?.name,
          description: r.menu_items?.description,
          price: money(r.menu_items?.price)
        }));

        const subtotal = rows.reduce((sum, r) => sum + r.price * r.quantity, 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        return reply.send({
          cart,
          items: rows,
          totals: {
            subtotal: +subtotal.toFixed(2),
            tax: +tax.toFixed(2),
            total: +total.toFixed(2)
          }
        });
      }

      // Memory mode
      const cart = memStore.get(params.data.id);
      if (!cart) return reply.code(404).send({ error: 'cart_not_found' });

      const subtotal = cart.items.reduce((s, it) => s + it.price * it.qty, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      return reply.send({
        cart: { id: cart.id, tenant_id: cart.tenant_id, order_type: cart.mode, table_id: cart.table_id },
        items: cart.items,
        totals: { subtotal, tax, total }
      });
    } catch (err: any) {
      app.log.error({ err }, 'cart_get_failed');
      if (err?.code === '42P01') {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /cart/items  → add items to cart
  // --------------------------------------------------------------------------
  app.post('/cart/items', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const body = AddItemsSchema.safeParse((req as any).body);
    if (!body.success) return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(400).send({ error: 'tenant_context_missing' });

    try {
      if (ENABLE_CART_DB) {
        // Validate menu items & insert
        const menuIds = body.data.items.map(i => i.menu_item_id);
        const { data: menuItems, error: miErr } = await app.supabase
          .from('menu_items')
          .select('id, is_available, tenant_id, price')
          .in('id', menuIds)
          .eq('tenant_id', tenantId);
        if (miErr) throw miErr;
        if (!menuItems || menuItems.length !== menuIds.length || menuItems.some(m => !m.is_available)) {
          return reply.code(400).send({ error: 'invalid_menu_items' });
        }

        // Confirm cart exists and belongs to tenant (via join)
        const { data: cart, error: cErr } = await app.supabase
          .from('carts')
          .select('id, tenant_id')
          .eq('id', body.data.cart_id)
          .eq('tenant_id', tenantId)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!cart) return reply.code(404).send({ error: 'cart_not_found' });

        const toInsert = body.data.items.map(i => ({
          cart_id: body.data.cart_id,
          menu_item_id: i.menu_item_id,
          quantity: i.qty,
          note: i.notes ?? null
        }));
        const { error: insErr } = await app.supabase.from('cart_items').insert(toInsert);
        if (insErr) throw insErr;

        return reply.send({ ok: true });
      }

      // Memory mode
      const mem = memStore.get(body.data.cart_id);
      if (!mem || mem.tenant_id !== tenantId) return reply.code(404).send({ error: 'cart_not_found' });

      // Fetch details for pricing
      const menuIds = body.data.items.map(i => i.menu_item_id);
      const { data: menuItems, error: miErr } = await app.supabase
        .from('menu_items')
        .select('id, name, price, is_available')
        .in('id', menuIds)
        .eq('tenant_id', tenantId);
      if (miErr) throw miErr;
      if (!menuItems || menuItems.length !== menuIds.length || menuItems.some(m => !m.is_available)) {
        return reply.code(400).send({ error: 'invalid_menu_items' });
      }

      for (const i of body.data.items) {
        const found = menuItems.find(m => m.id === i.menu_item_id)!;
        const idx = mem.items.findIndex(it => it.menu_item_id === i.menu_item_id);
        if (idx >= 0) mem.items[idx].qty += i.qty;
        else mem.items.push({ menu_item_id: i.menu_item_id, name: (found as any).name, price: money((found as any).price), qty: i.qty, notes: i.notes });
      }
      mem.updated_at = new Date().toISOString();
      memStore.set(mem.id, mem);

      // Recalculate totals for response
      const subtotal = mem.items.reduce((s, it) => s + it.price * it.qty, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      return reply.send({ items: mem.items, totals: { subtotal, tax, total } });
    } catch (err: any) {
      app.log.error({ err }, 'cart_items_failed');
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // --------------------------------------------------------------------------
  // POST /orders/confirm  → creates an order from cart
  // --------------------------------------------------------------------------
  app.post('/orders/confirm', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const body = ConfirmOrderSchema.safeParse((req as any).body);
    if (!body.success) return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(400).send({ error: 'tenant_context_missing' });

    try {
      let items: { menu_item_id: string; qty: number; price: number; notes?: string }[] = [];
      let tableId: string | null = null;
      let mode: 'dine_in' | 'takeaway' = 'takeaway';

      if (ENABLE_CART_DB) {
        // Load cart & items from DB
        const { data: cart, error: cErr } = await app.supabase
          .from('carts')
          .select('id, tenant_id, order_type, table_id')
          .eq('id', body.data.cart_id)
          .eq('tenant_id', tenantId)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!cart) return reply.code(404).send({ error: 'cart_not_found' });
        tableId = (cart as any).table_id ?? null;
        mode = (cart as any).order_type;

        const { data: cartItems, error: iErr } = await app.supabase
          .from('cart_items')
          .select('menu_item_id, quantity, note, menu_items!inner(price)')
          .eq('cart_id', body.data.cart_id);
        if (iErr) throw iErr;

        items = (cartItems || []).map((r: any) => ({
          menu_item_id: r.menu_item_id,
          qty: int(r.quantity),
          price: money(r.menu_items?.price),
          notes: r.note ?? undefined
        }));
      } else {
        // Memory mode
        const mem = memStore.get(body.data.cart_id);
        if (!mem || mem.tenant_id !== tenantId) return reply.code(404).send({ error: 'cart_not_found' });
        tableId = mem.table_id ?? null;
        mode = mem.mode;
        items = mem.items.map(i => ({ menu_item_id: i.menu_item_id, qty: i.qty, price: i.price, notes: i.notes }));
      }

      if (!items.length) return reply.code(400).send({ error: 'cart_empty' });

      // Totals
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const tax = subtotal * (ENABLE_CART_DB ? 0.1 : 0.08);
      const total = subtotal + tax;

      // Order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // Create order
      const { data: order, error: oErr } = await app.supabase
        .from('orders')
        .insert({
          tenant_id: tenantId,
          table_id: tableId,
          staff_id: body.data.assign_staff_id ?? null,
          order_number: orderNumber,
          order_type: mode,
          status: 'pending',
          subtotal,
          tax_amount: tax,
          total_amount: total,
          special_instructions: body.data.notes ?? null,
          mode,
          session_id: body.data.cart_id
        })
        .select('id, total_amount')
        .single();
      if (oErr) throw oErr;

      // Create order_items
      const rows = items.map((i) => ({
        order_id: order!.id,
        menu_item_id: i.menu_item_id,
        quantity: i.qty,
        unit_price: i.price,
        total_price: i.price * i.qty,
        special_instructions: i.notes ?? null,
        tenant_id: tenantId
      }));
      const { error: oiErr } = await app.supabase.from('order_items').insert(rows);
      if (oiErr) throw oiErr;

      // Optional status event (best-effort)
      try {
        await app.supabase.from('order_status_events').insert({
          order_id: order!.id,
          from_status: null,
          to_status: 'new',
          created_by: (req as any)?.auth?.userId || 'customer'
        });
      } catch (e) {
        app.log.warn('order_status_events insert skipped');
      }

      // Cleanup memory cart
      if (!ENABLE_CART_DB) memStore.delete(body.data.cart_id);

      return reply.code(201).send({
        order_id: order!.id,
        order_number: orderNumber,
        status: 'new',
        total_amount: order!.total_amount
      });
    } catch (err: any) {
      app.log.error({ err }, 'order_confirm_failed');
      return reply.code(500).send({ error: 'failed_to_confirm_order' });
    }
  });
}