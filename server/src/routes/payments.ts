import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { PaymentsService } from '../services/payments.service';

const PaymentConfigSchema = z.object({
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  live_mode: z.boolean().default(false),
  currency: z.string().default('USD'),
  enabled_methods: z.array(z.string()).default(['card']),
  publishable_key: z.string().optional(),
  secret_key: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const CreateIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  order_id: z.string().uuid().optional(),
  method: z.string().optional(),
  provider: z.enum(['stripe', 'razorpay', 'mock']).optional(),
  metadata: z.record(z.any()).optional()
});

const CaptureSchema = z.object({
  intent_id: z.string(),
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  provider_transaction_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const RefundSchema = z.object({
  payment_id: z.string(),
  amount: z.number().positive(),
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

const SplitSchema = z.object({
  total: z.number().positive(),
  currency: z.string().default('USD'),
  splits: z.array(z.object({
    amount: z.number().positive(),
    payer_type: z.enum(['customer', 'staff']),
    method: z.string(),
    note: z.string().optional()
  }))
});

// Provider CRUD schemas (additive)
const ProviderCreateSchema = z.object({
  provider: z.enum(['stripe', 'razorpay', 'mock']),
  enabled: z.boolean().optional(),
  config: z.record(z.any()).optional()
});

const ProviderUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.any()).optional()
});

/** NEW: emit-event schema */
const EmitEventSchema = z.object({
  event_type: z.string().min(1),
  payload: z.record(z.any()).optional()
});

export default async function paymentsRoutes(app: FastifyInstance) {
  const service = new PaymentsService(app);

  // GET /config
  app.get('/config', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    try {
      const result = await service.getConfig(tenantId);
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to get payment config');
      return reply.code(500).send({ error: 'failed_to_get_config' });
    }
  });

  // PUT /config
  app.put('/config', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    try {
      const body = PaymentConfigSchema.parse(req.body);
      const config = await service.upsertConfig(tenantId, body);
      return reply.send({ configured: true, config });
    } catch (err: any) {
      app.log.error(err, 'Failed to update payment config');
      return reply.code(500).send({ error: 'failed_to_update_config' });
    }
  });

  // POST /intents
  app.post('/intents', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    try {
      const body = CreateIntentSchema.parse(req.body);
      const result = await service.createIntent(tenantId, body);
      if ((result as any).error) {
        const statusCode = (result as any).status || 400;
        return reply.code(statusCode).send(result);
      }
      return reply.code(201).send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to create payment intent');
      return reply.code(500).send({ error: 'failed_to_create_intent' });
    }
  });

  // POST /capture
  app.post('/capture', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    try {
      const body = CaptureSchema.parse(req.body);
      const result = await service.capture(tenantId, body);
      if ((result as any).error) {
        const statusCode = (result as any).status || 400;
        return reply.code(statusCode).send(result);
      }
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to capture payment');
      return reply.code(500).send({ error: 'failed_to_capture_payment' });
    }
  });

  // POST /refund
  app.post('/refund', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    try {
      const body = RefundSchema.parse(req.body);
      const result = await service.refund(tenantId, body);
      if ((result as any).error) {
        const statusCode = (result as any).status || 400;
        return reply.code(statusCode).send(result);
      }
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to process refund');
      return reply.code(500).send({ error: 'failed_to_process_refund' });
    }
  });

  // POST /split
  app.post('/split', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    try {
      const body = SplitSchema.parse(req.body);
      const result = await service.split(tenantId, body);
      if ((result as any).error) {
        const statusCode = (result as any).status || 400;
        return reply.code(statusCode).send(result);
      }
      return reply.send(result);
    } catch (err: any) {
      app.log.error(err, 'Failed to process split payment');
      return reply.code(500).send({ error: 'failed_to_process_split' });
    }
  });

  // GET /providers (tenant-scoped)
  app.get('/providers', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });
    try {
      const db = (req as any).supabaseUser || (app as any).supabase;
      const { data, error } = await db
        .from('payment_providers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('provider');
      if (error) throw error;
      return reply.send(data || []);
    } catch (err: any) {
      app.log.warn({ err }, '[payments] list providers failed');
      return reply.code(400).send({ error: 'list_failed' });
    }
  });

  // POST /providers (create tenant-scoped provider)
  app.post('/providers', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });
    try {
      const body = ProviderCreateSchema.parse(req.body);
      const db = (req as any).supabaseUser || (app as any).supabase;
      const insert = {
        tenant_id: tenantId,
        provider: body.provider,
        enabled: body.enabled ?? true,
        config: body.config ?? {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await db
        .from('payment_providers')
        .insert(insert)
        .select('*')
        .single();
      if (error) throw error;
      return reply.code(201).send(data);
    } catch (err: any) {
      app.log.error({ err }, '[payments] create provider failed');
      return reply.code(400).send({ error: 'create_failed' });
    }
  });

  // PATCH /providers/:id (update tenant-scoped provider)
  app.patch('/providers/:id', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });
    try {
      const params = z.object({ id: z.string().uuid() }).parse(req.params);
      const body = ProviderUpdateSchema.parse(req.body || {});
      const db = (req as any).supabaseUser || (app as any).supabase;
      const { data, error } = await db
        .from('payment_providers')
        .update({
          enabled: body.enabled,
          config: body.config,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('tenant_id', tenantId)
        .select('*')
        .single();
      if (error) throw error;
      return reply.send(data);
    } catch (err: any) {
      app.log.warn({ err }, '[payments] update provider failed');
      return reply.code(400).send({ error: 'update_failed' });
    }
  });

  // **NEW** POST /intents/:id/emit-event
  app.post('/intents/:id/emit-event', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = req.auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'tenant_context_missing' });

    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = EmitEventSchema.parse(req.body);
    const db = (req as any).supabaseUser || (app as any).supabase;

    // Resolve intent & provider (for event row)
    const { data: intent, error: findErr } = await db
      .from('payment_intents')
      .select('id, tenant_id, provider, status')
      .eq('id', params.id)
      .eq('tenant_id', tenantId)
      .single();

    if (findErr || !intent) {
      return reply.code(404).send({ error: 'intent_not_found' });
    }

    // Insert event into payment_events
    const eventId = randomUUID();
    const provider = intent.provider ?? 'mock';
    const payload = body.payload ?? {};

    const { error: insertErr } = await db
      .from('payment_events')
      .insert({
        id: eventId,
        provider,
        event_id: eventId,
        tenant_id: tenantId,
        payment_intent_id: intent.id,
        event_type: body.event_type,
        payload,                 // jsonb NOT NULL in your schema
        created_at: new Date().toISOString()
      });

    if (insertErr) {
      app.log.error(insertErr, 'failed to insert payment_event');
      return reply.code(500).send({ error: 'failed_to_record_event' });
    }

    // Optionally map event -> status
    const statusMap: Record<string, string> = {
      payment_processing: 'processing',
      payment_succeeded: 'succeeded',
      payment_failed: 'failed',
    };
    const newStatus = statusMap[body.event_type];

    if (newStatus) {
      const { error: updErr } = await db
        .from('payment_intents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', intent.id)
        .eq('tenant_id', tenantId);

      if (updErr) {
        app.log.error(updErr, 'failed to update intent status');
        // Still return ok because event is stored
        return reply.send({
          ok: true,
          intent_id: intent.id,
          recorded_event: body.event_type,
          applied_status: null,
          warning: 'event recorded but status update failed'
        });
      }
    }

    return reply.send({
      ok: true,
      intent_id: intent.id,
      recorded_event: body.event_type,
      applied_status: newStatus ?? null
    });
  });

  // POST /webhook/:provider
  app.post('/webhook/:provider', async (req, reply) => {
    const params = z.object({
      provider: z.enum(['stripe', 'razorpay', 'mock'])
    }).parse(req.params);

    try {
      const db = (req as any).supabaseUser || (app as any).supabase;
      const payload: any = (req.body as any) ?? {};
      const eventId: string = (payload?.id || payload?.event_id || `webhook_${Date.now()}`);
      const eventType: string | null = (payload?.type || payload?.event_type || null);

      try {
        await db
          .from('payment_events')
          .insert({
            provider: params.provider,
            event_id: eventId,
            event_type: eventType,
            tenant_id: payload?.tenant_id || null,
            payload,
            received_at: new Date().toISOString()
          });
      } catch (err: any) {
        if (err?.code === '42P01') {
          app.log.warn('payment_events table not available, skipping webhook storage');
        }
      }

      app.log.info(`Webhook received from ${params.provider}: ${eventId}`);
      return reply.code(202).send({ received: true });
    } catch (err: any) {
      app.log.error(err, 'Failed to process webhook');
      return reply.code(500).send({ error: 'webhook_processing_failed' });
    }
  });
}