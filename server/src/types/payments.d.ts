export type PaymentProvider = 'stripe' | 'razorpay' | 'mock';

// Tenant-level payment configuration
export interface TenantPaymentConfig {
  provider: PaymentProvider;
  live_mode: boolean;
  currency: string;
  enabled_methods: string[];
  publishable_key?: string;
  secret_key?: string; // stored masked, only last4 when returned
  metadata?: Record<string, any>;
}

// Response shape for tenant config reads
export interface PaymentConfigResponse {
  configured: boolean;
  provider?: PaymentProvider;
  live_mode?: boolean;
  currency?: string;
  enabled_methods?: string[];
  publishable_key?: string;
  // secret_key is never fully returned for security
  metadata?: Record<string, any>;
}

// Create a payment intent input
export interface CreateIntentInput {
  amount: number;
  currency: string;
  order_id?: string;
  method?: string;
  metadata?: Record<string, any>;
}

// Capture payment input
export interface CaptureInput {
  intent_id: string;
  provider: PaymentProvider;
  provider_transaction_id?: string; // Part2 compat
  amount?: number;
  metadata?: Record<string, any>;
}

// Refund input
export interface RefundInput {
  payment_id: string;
  amount: number;
  provider: PaymentProvider;
  reason?: string;
  metadata?: Record<string, any>;
}

// Split payments input
export interface SplitInput {
  total: number;
  currency: string;
  splits: Array<{
    amount: number;
    payer_type: 'customer' | 'staff';
    method: string;
    note?: string;
  }>;
}

// Payment intent DB shape
export interface PaymentIntent {
  id: string;
  tenant_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: string;
  client_secret?: string;
  provider_intent_id?: string;
  provider_transaction_id?: string; // compat for Part2
  metadata?: Record<string, any>;
  created_at: string;
}

// Standardized intent response (superset for compat)
export interface PaymentIntentResponse {
  client_secret?: string;
  provider: PaymentProvider;
  status: string;
  intent_id?: string;
  amount?: number;
  currency?: string;
  payment_id?: string; // compat alias when intent acts as payment_id
}

// For webhook events from providers
export interface PaymentWebhookEvent {
  id: string;
  provider: PaymentProvider;
  event_id: string;
  tenant_id?: string;
  payload: any;
  received_at: string;
}