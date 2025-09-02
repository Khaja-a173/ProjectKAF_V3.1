// server/src/routes/checkout.ts
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';

/**
 * Checkout routes
 * - Mounted under prefix /checkout (e.g., app.register(checkoutRoutes, { prefix: '/checkout' }))
 * - Feature flag: ENABLE_PAYMENTS=true to enable routes
 * - Providers: 'mock' implemented; others return 501 until wired
 * - Storage: Supabase (via app.supabase). No app.pg usage.
 */

const CurrencySchema = z.string().min(3).max(8).default('USD');
const ENABLE_PAYMENTS = process.env.ENABLE_PAYMENTS === 'true';
const DEFAULT_CURRENCY = CurrencySchema.parse(process.env.PAYMENTS_CURRENCY ?? 'USD');

// Body schemas
const CreateIntentBody = z.object({
  cart_id: z.string().uuid(),
  provider: z.enum(['stripe', 'razorpay', 'mock']).default('mock')
});

const ConfirmBody = z.object({
  intent_id: z.string().uuid(),
  provider_payload: z.any().optional()
});

const CancelBody = z.object({
  intent_id: z.string().uuid()
});

// Helpers
const money = (v: unknown) => parseFloat(String(v ?? 0)) || 0;

export default async function checkoutRoutes(app: FastifyInstance) {
  if (!ENABLE_PAYMENTS) {
    app.log.info('Payment features disabled via ENABLE_PAYMENTS flag');
    // Provide a harmless probe route to aid diagnostics
    app.get('/_disabled', async () => ({ ok: true, reason: 'payments_disabled' }));
    return;
  }

  // ----------------------------------------------------------------------------
  // POST /checkout/create-intent
  // ----------------------------------------------------------------------------
  app.post('/create-intent', async (req, reply) => {
    const parsed = CreateIntentBody.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const { cart_id, provider } = parsed.data;

    try {
      // 1) Fetch cart
      const { data: cart, error: cartErr } = await app.supabase
        .from('carts')
        .select('id, tenant_id, table_id, order_type')
        .eq('id', cart_id)
        .maybeSingle();
      if (cartErr) throw cartErr;
      if (!cart) return reply.code(404).send({ error: 'cart_not_found' });

      // 2) Compute totals from cart_items x menu_items
      const { data: items, error: itemsErr } = await app.supabase
        .from('cart_items')
        .select('quantity, menu_items!inner(price)')
        .eq('cart_id', cart_id);
      if (itemsErr) throw itemsErr;

      const subtotal = (items || []).reduce((sum: number, row: any) => {
        const unit = money(row.menu_items?.price);
        const qty = parseInt(String(row.quantity || 0), 10) || 0;
        return sum + unit * qty;
      }, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      // 3) Create intent (id in app to easily form mock secret)
      const intentId = randomUUID();
      const clientSecret = provider === 'mock' ? `mock_${intentId}` : null;

      const { error: insErr } = await app.supabase.from('payment_intents').insert({
        id: intentId,
        tenant_id: cart.tenant_id,
        cart_id: cart_id,
        provider,
        amount: Number(total.toFixed(2)),
        currency: DEFAULT_CURRENCY,
        status: 'requires_payment_method',
        client_secret: clientSecret
      });
      if (insErr) throw insErr;

      return reply.send({
        intent: {
          id: intentId,
          amount: Number(total.toFixed(2)),
          currency: DEFAULT_CURRENCY,
          status: 'requires_payment_method'
        },
        client_secret: clientSecret,
        provider_params: provider === 'mock' ? { mock: true } : {}
      });
    } catch (err: any) {
      app.log.error({ err }, 'create_intent_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /checkout/confirm
  // ----------------------------------------------------------------------------
  app.post('/confirm', async (req, reply) => {
    const parsed = ConfirmBody.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const { intent_id } = parsed.data;

    try {
      // 1) Load intent
      const { data: intent, error: iErr } = await app.supabase
        .from('payment_intents')
        .select('*')
        .eq('id', intent_id)
        .maybeSingle();
      if (iErr) throw iErr;
      if (!intent) return reply.code(404).send({ error: 'payment_intent_not_found' });

      // 2) Provider handling
      if (intent.provider === 'mock') {
        // Mark intent succeeded
        const { error: upErr } = await app.supabase
          .from('payment_intents')
          .update({ status: 'succeeded', updated_at: new Date().toISOString() })
          .eq('id', intent_id);
        if (upErr) throw upErr;

        // 3) Create order from cart snapshot
        const orderId = randomUUID();

        // Fetch cart data to carry over order_type/table_id
        const { data: cart, error: cErr } = await app.supabase
          .from('carts')
          .select('tenant_id, table_id, order_type')
          .eq('id', intent.cart_id)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!cart) return reply.code(404).send({ error: 'cart_not_found' });

        // Insert order (paid)
        const { error: orderErr } = await app.supabase.from('orders').insert({
          id: orderId,
          tenant_id: cart.tenant_id,
          table_id: cart.table_id ?? null,
          order_type: cart.order_type,
          status: 'paid',
          total_amount: money(intent.amount),
          payment_intent_id: intent_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        if (orderErr) throw orderErr;

        // Copy cart_items → order_items (using current menu price as unit price)
        const { data: cartItems, error: ciErr } = await app.supabase
          .from('cart_items')
          .select('menu_item_id, quantity, note, menu_items!inner(price)')
          .eq('cart_id', intent.cart_id);
        if (ciErr) throw ciErr;

        if (cartItems && cartItems.length) {
          const orderItems = cartItems.map((ci: any) => ({
            id: randomUUID(),
            order_id: orderId,
            menu_item_id: ci.menu_item_id,
            quantity: parseInt(String(ci.quantity || 0), 10) || 0,
            unit_price: money(ci.menu_items?.price),
            note: ci.note ?? null,
            created_at: new Date().toISOString()
          }));
          const { error: oiErr } = await app.supabase.from('order_items').insert(orderItems);
          if (oiErr) throw oiErr;
        }

        return reply.send({ status: 'succeeded', order_id: orderId });
      }

      // Other providers: not implemented (wire later)
      return reply.code(501).send({ error: 'provider_not_implemented' });
    } catch (err: any) {
      app.log.error({ err }, 'confirm_payment_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });

  // ----------------------------------------------------------------------------
  // POST /checkout/cancel
  // ----------------------------------------------------------------------------
  app.post('/cancel', async (req, reply) => {
    const parsed = CancelBody.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    try {
      const { intent_id } = parsed.data;
      const { error } = await app.supabase
        .from('payment_intents')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('id', intent_id);
      if (error) throw error;

      return reply.send({ status: 'canceled' });
    } catch (err: any) {
      app.log.error({ err }, 'cancel_payment_failed');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'internal_server_error' });
    }
  });
}