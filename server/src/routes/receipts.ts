import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// -----------------------------
// Schemas (support both payload styles)
// -----------------------------
const SendReceiptSchema = z.object({
  order_id: z.string().uuid(),
  channel: z.enum(['email', 'sms']).optional(),
  recipient: z.string().optional(),
  // Part2 compatibility
  email: z.string().email().optional(),
  phone: z.string().optional()
});

const PrinterConfigSchema = z.object({
  enabled: z.boolean().default(false),
  printer_name: z.string().optional(),
  paper_size: z.enum(['80mm', '58mm']).default('80mm')
});

export default async function receiptsRoutes(app: FastifyInstance) {
  // ------------------------------------------------------------
  // POST /receipts/send  — send receipt via email or SMS
  //   - Accepts both:
  //       { order_id, channel: 'email'|'sms', recipient? }
  //       { order_id, email?, phone? }     // Part2 compat
  //   - Persists to receipt_deliveries if table exists, else mock
  // ------------------------------------------------------------
  app.post('/receipts/send', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const body = SendReceiptSchema.safeParse((req as any).body);
    if (!body.success) {
      return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });
    }
    const data = body.data;

    const tenantId = (req as any).auth?.primaryTenantId;
    if (!tenantId) return reply.code(400).send({ error: 'tenant_context_missing' });

    try {
      // Verify order exists and belongs to tenant
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id, order_number, total_amount, status')
        .eq('id', data.order_id)
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return reply.code(404).send({ error: 'order_not_found' });

      // Normalize channel + recipient from either style
      let channel: 'email' | 'sms' | null = data.channel ?? null;
      if (!channel) {
        if (data.email) channel = 'email';
        else if (data.phone) channel = 'sms';
      }
      if (!channel) return reply.code(400).send({ error: 'channel_required' });

      const recipient =
        data.recipient ??
        (channel === 'email' ? data.email : data.phone) ??
        (channel === 'email' ? 'customer@example.com' : '+10000000000');

      // Try insert into receipt_deliveries (if table exists)
      const { data: receipt, error: receiptError } = await app.supabase
        .from('receipt_deliveries')
        .insert({
          tenant_id: tenantId,
          order_id: data.order_id,
          channel,
          status: 'queued',
          recipient,
          content: {
            order_number: order.order_number,
            total_amount: order.total_amount
          }
        })
        .select()
        .maybeSingle();

      if (receiptError) {
        // Table missing or RLS blocked → return mock accepted (Part2 behavior)
        app.log.warn({ err: receiptError }, 'receipt_deliveries insert failed, returning mock');
        return reply.code(202).send({
          accepted: true,
          message: 'Receipt send request accepted (simulated)',
          order_id: data.order_id,
          delivery_methods: {
            email: channel === 'email',
            sms: channel === 'sms'
          },
          mock: true
        });
      }

      return reply.code(202).send({
        accepted: true,
        receipt_id: receipt?.id,
        channel,
        order_id: data.order_id
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to send receipt');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'failed_to_send_receipt' });
    }
  });

  // ------------------------------------------------------------
  // POST /receipts/invoice/:orderId  — generate invoice PDF (mock)
  //   - Part2 endpoint, Supabase-only verification
  // ------------------------------------------------------------
  app.post<{ Params: { orderId: string } }>('/receipts/invoice/:orderId', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = (req as any).auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'Missing tenant ID' });

    const { orderId } = req.params;
    try {
      // Verify order exists
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return reply.code(404).send({ error: 'order_not_found' });

      // Mock PDF
      const mockPDF = Buffer.from(`Mock PDF content for order ${orderId}`);
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
      return reply.send(mockPDF);
    } catch (err: any) {
      app.log.error(err, 'Failed to generate invoice PDF');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'failed_to_generate_invoice' });
    }
  });

  // ------------------------------------------------------------
  // POST /receipts/print  — print to thermal printer (mock)
  //   - Part2 endpoint, Supabase-only verification
  // ------------------------------------------------------------
  app.post('/receipts/print', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = (req as any).auth?.primaryTenantId;
    if (!tenantId) return reply.code(401).send({ error: 'Missing tenant ID' });

    const body = z.object({
      order_id: z.string().uuid(),
      printer_id: z.string().optional()
    }).safeParse((req as any).body);
    if (!body.success) {
      return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });
    }

    try {
      const { data: order, error: orderError } = await app.supabase
        .from('orders')
        .select('id')
        .eq('id', body.data.order_id)
        .eq('tenant_id', tenantId)
        .maybeSingle();
      if (orderError) throw orderError;
      if (!order) return reply.code(404).send({ error: 'order_not_found' });

      // Optionally persist print job if table exists
      try {
        const { error: pjErr } = await app.supabase.from('print_jobs').insert({
          tenant_id: tenantId,
          order_id: body.data.order_id,
          printer_id: body.data.printer_id ?? 'default',
          status: 'queued'
        });
        if (pjErr) app.log.warn({ pjErr }, 'print_jobs insert failed, continuing with mock');
      } catch {
        // ignore
      }

      return reply.code(202).send({
        accepted: true,
        message: 'Receipt print request accepted',
        order_id: body.data.order_id,
        printer_id: body.data.printer_id ?? 'default'
      });
    } catch (err: any) {
      app.log.error(err, 'Failed to print receipt');
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return reply.code(503).send({ error: 'Service not available', reason: 'missing_table' });
      }
      return reply.code(500).send({ error: 'failed_to_print_receipt' });
    }
  });

  // ------------------------------------------------------------
  // GET /printer/config  — fetch printer settings (with fallback)
  // ------------------------------------------------------------
  app.get('/printer/config', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const tenantId = (req as any).auth?.primaryTenantId;
    if (!tenantId) return reply.code(400).send({ error: 'tenant_context_missing' });

    try {
      const { data: config, error: configError } = await app.supabase
        .from('printer_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (configError || !config) {
        return reply.send({
          enabled: false,
          printer_name: null,
          paper_size: '80mm',
          mock: true
        });
      }

      return reply.send(config);
    } catch (err: any) {
      app.log.error(err, 'Failed to get printer config');
      return reply.send({
        enabled: false,
        mock: true
      });
    }
  });

  // ------------------------------------------------------------
  // POST /printer/config  — upsert printer settings (with mock)
  // ------------------------------------------------------------
  app.post('/printer/config', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const body = PrinterConfigSchema.safeParse((req as any).body);
    if (!body.success) return reply.code(400).send({ error: 'invalid_body', details: body.error.flatten() });

    const tenantId = (req as any).auth?.primaryTenantId;
    if (!tenantId) return reply.code(400).send({ error: 'tenant_context_missing' });

    try {
      const { data: config, error: configError } = await app.supabase
        .from('printer_configs')
        .upsert({
          tenant_id: tenantId,
          enabled: body.data.enabled,
          printer_name: body.data.printer_name,
          paper_size: body.data.paper_size
        })
        .select()
        .maybeSingle();

      if (configError) {
        return reply.send({
          ...body.data,
          mock: true,
          message: 'Printer config saved (simulated)'
        });
      }

      return reply.send(config);
    } catch (err: any) {
      app.log.error(err, 'Failed to update printer config');
      return reply.code(500).send({ error: 'failed_to_update_printer_config' });
    }
  });
}