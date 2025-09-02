import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import type { 
  PaymentProvider, 
  TenantPaymentConfig, 
  CreateIntentInput, 
  CaptureInput, 
  RefundInput, 
  SplitInput 
} from '../types/payments';

// In-memory fallback for when DB tables don't exist yet
const configFallback = new Map<string, TenantPaymentConfig>();

type GetConfigResult = { configured: boolean; config?: TenantPaymentConfig };

export class PaymentsService {
  constructor(private app: FastifyInstance) {}

  // --------------------------------------------------------------------------
  // Read tenant payment configuration (DB → in-memory fallback)
  // --------------------------------------------------------------------------
  async getConfig(tenantId: string): Promise<GetConfigResult> {
    try {
      const { data, error } = await this.app.supabase
        .from('payment_providers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_enabled', true)
        .maybeSingle();

      if (error) {
        // 42P01: relation does not exist
        if ((error as any).code === '42P01') {
          this.app.log.warn('payment_providers table not available, using fallback');
          const fallbackConfig = configFallback.get(tenantId);
          return fallbackConfig ? { configured: true, config: fallbackConfig } : { configured: false };
        }
        throw error;
      }

      if (!data) {
        // No DB row → check fallback
        const fallbackConfig = configFallback.get(tenantId);
        return fallbackConfig ? { configured: true, config: fallbackConfig } : { configured: false };
      }

      // Mask secret key in response
      const config: TenantPaymentConfig = {
        provider: data.provider as PaymentProvider,
        live_mode: data.is_live || false,
        currency: data.currency || 'USD',
        enabled_methods: data.enabled_methods || ['card'],
        publishable_key: data.publishable_key,
        secret_key: data.secret_last4 ? `***${data.secret_last4}` : undefined,
        metadata: data.metadata
      };

      return { configured: true, config };
    } catch (err: any) {
      this.app.log.error(err, 'Failed to get payment config');
      const fallbackConfig = configFallback.get(tenantId);
      return fallbackConfig ? { configured: true, config: fallbackConfig } : { configured: false };
    }
  }

  // --------------------------------------------------------------------------
  // Upsert tenant payment configuration (DB → in-memory fallback)
  // --------------------------------------------------------------------------
  async upsertConfig(tenantId: string, payload: TenantPaymentConfig): Promise<TenantPaymentConfig> {
    try {
      const { data, error } = await this.app.supabase
        .from('payment_providers')
        .upsert({
          tenant_id: tenantId,
          provider: payload.provider,
          is_live: !!payload.live_mode,
          publishable_key: payload.publishable_key,
          // Store only last4 for security; full secret should be kept in provider vault
          secret_last4: payload.secret_key ? String(payload.secret_key).slice(-4) : null,
          is_enabled: true,
          is_default: false,
          metadata: payload.metadata
        })
        .select()
        .single();

      if (error) {
        if ((error as any).code === '42P01') {
          this.app.log.warn('payment_providers table not available, using in-memory fallback');
          configFallback.set(tenantId, payload);
          return payload;
        }
        throw error;
      }

      // Return masked config (aligns with getConfig)
      return {
        provider: data.provider as PaymentProvider,
        live_mode: data.is_live || false,
        currency: data.currency || 'USD',
        enabled_methods: data.enabled_methods || ['card'],
        publishable_key: data.publishable_key,
        secret_key: data.secret_last4 ? `***${data.secret_last4}` : undefined,
        metadata: data.metadata
      };
    } catch (err: any) {
      this.app.log.error(err, 'Failed to upsert payment config');
      // Fallback to in-memory storage
      configFallback.set(tenantId, payload);
      return payload;
    }
  }

  // --------------------------------------------------------------------------
  // Create a payment intent
  // - Mock provider returns client_secret & intent_id
  // - For real providers, returns 501 until wired
  // - Persists to payment_intents if table exists (best-effort)
  // --------------------------------------------------------------------------
  async createIntent(tenantId: string, body: CreateIntentInput): Promise<any> {
    const { configured, config } = await this.getConfig(tenantId);

    if (!configured || !config) {
      return { error: 'payment_not_configured', message: 'Payment provider not configured for this tenant' };
    }

    if (config.provider === 'mock') {
      const intentId = `mock_intent_${randomUUID()}`;
      const clientSecret = `mock_secret_${intentId}`;
      const clientSecretLast4 = clientSecret.slice(-4);

      // Try to store in DB (best-effort)
      try {
        await this.app.supabase
          .from('payment_intents')
          .insert({
            id: randomUUID(),
            tenant_id: tenantId,
            order_id: body.order_id ?? null,
            amount: body.amount,
            currency: body.currency || config.currency || 'USD',
            provider: 'mock',
            status: 'requires_payment_method',
            provider_intent_id: intentId,
            client_secret_last4: clientSecretLast4,
            metadata: body.metadata ?? null
          });
      } catch (err: any) {
        if (err?.code === '42P01') {
          this.app.log.warn('payment_intents table not available, skipping storage');
        } else {
          this.app.log.warn({ err }, 'payment_intents insert failed (non-fatal)');
        }
      }

      // Return a shape compatible with both codebases
      return {
        intent_id: intentId,
        client_secret: clientSecret,
        provider: 'mock',
        status: 'requires_capture',
        amount: body.amount,
        currency: body.currency || config.currency || 'USD'
      };
    }

    // Real providers – ensure keys present
    if (config.provider === 'stripe' || config.provider === 'razorpay') {
      if (!config.publishable_key || !config.secret_key) {
        return {
          error: 'provider_not_configured',
          message: `${config.provider} keys not configured`,
          status: 501
        };
      }
      // TODO: Implement Stripe/Razorpay SDK integration
      return { error: 'not_implemented', message: `${config.provider} integration coming soon`, status: 501 };
    }

    return { error: 'unsupported_provider', message: 'Unsupported payment provider', status: 400 };
  }

  // --------------------------------------------------------------------------
  // Capture a payment (mock succeeds; others 501 until wired)
  // - Updates payment_intents if table exists
  // --------------------------------------------------------------------------
  async capture(tenantId: string, body: CaptureInput): Promise<any> {
    const { configured, config } = await this.getConfig(tenantId);
    if (!configured || !config) {
      return { error: 'payment_not_configured', message: 'Payment provider not configured' };
    }

    if (config.provider === 'mock') {
      const txnId = body.provider_transaction_id || `mock_txn_${randomUUID()}`;
      try {
        await this.app.supabase
          .from('payment_intents')
          .update({ status: 'succeeded', updated_at: new Date().toISOString() })
          .eq('tenant_id', tenantId)
          .eq('provider_intent_id', body.intent_id);
      } catch (err: any) {
        if (err?.code === '42P01') {
          this.app.log.warn('payment_intents table not available, skipping update');
        } else {
          this.app.log.warn({ err }, 'payment_intents update failed (non-fatal)');
        }
      }
      // Response compatible with Part2 expectations
      return {
        success: true,
        provider: 'mock',
        transaction_id: txnId,
        payment_id: txnId, // compat field
        status: 'succeeded',
        amount: body.amount ?? undefined,
        captured_at: new Date().toISOString()
      };
    }

    return { error: 'not_implemented', message: `${config.provider} capture coming soon`, status: 501 };
  }

  // --------------------------------------------------------------------------
  // Refund (mock succeeds; others 501 until wired)
  // - Persists to payment_refunds if table exists
  // --------------------------------------------------------------------------
  async refund(tenantId: string, body: RefundInput): Promise<any> {
    const { configured, config } = await this.getConfig(tenantId);
    if (!configured || !config) {
      return { error: 'payment_not_configured', message: 'Payment provider not configured' };
    }

    if (config.provider === 'mock') {
      const refundId = `mock_refund_${randomUUID()}`;
      try {
        await this.app.supabase
          .from('payment_refunds')
          .insert({
            id: randomUUID(),
            tenant_id: tenantId,
            payment_id: body.payment_id ?? null,
            amount: body.amount,
            reason: body.reason || 'customer_request',
            status: 'completed',
            provider_refund_id: refundId
          });
      } catch (err: any) {
        if (err?.code === '42P01') {
          this.app.log.warn('payment_refunds table not available, skipping storage');
        } else {
          this.app.log.warn({ err }, 'payment_refunds insert failed (non-fatal)');
        }
      }
      return { success: true, refund_id: refundId, amount: body.amount, status: 'completed', refunded_at: new Date().toISOString() };
    }

    return { error: 'not_implemented', message: `${config.provider} refund coming soon`, status: 501 };
  }

  // --------------------------------------------------------------------------
  // Split payments
  // - Validates totals; persists to payment_splits if table exists
  // - Returns compat fields (split_id, split_item_id per Part2)
  // --------------------------------------------------------------------------
  async split(tenantId: string, body: SplitInput): Promise<any> {
    // Validate split totals (allow 1 cent tolerance)
    const splitTotal = body.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(splitTotal - body.total) > 0.01) {
      return { error: 'invalid_split_total', message: 'Split amounts must equal total amount' };
    }

    const splitId = `split_${randomUUID()}`;
    const createdAt = new Date().toISOString();

    try {
      // Attempt to persist
      const splitRecords = body.splits.map((split, index) => ({
        id: `split_item_${index + 1}_${randomUUID()}`,
        split_group_id: splitId,
        tenant_id: tenantId,
        amount: split.amount,
        payer_type: split.payer_type,
        method: split.method,
        note: split.note ?? null,
        status: 'pending',
        created_at: createdAt
      }));

      await this.app.supabase.from('payment_splits').insert(splitRecords);

      return {
        success: true,
        split_id: splitId,
        total: body.total,
        currency: body.currency,
        splits: splitRecords.map(r => ({
          amount: r.amount,
          payer_type: r.payer_type,
          method: r.method,
          note: r.note ?? undefined,
          split_item_id: r.id
        })),
        created_at: createdAt
      };
    } catch (err: any) {
      this.app.log.warn({ err }, 'payment_splits insert failed (validation-only fallback)');
      return {
        success: true,
        split_id: splitId,
        total: body.total,
        currency: body.currency,
        splits: body.splits.map((s, i) => ({ ...s, split_item_id: `split_item_${i + 1}_${randomUUID()}` })),
        created_at: createdAt,
        note: 'Splits validated but not persisted'
      };
    }
  }
}