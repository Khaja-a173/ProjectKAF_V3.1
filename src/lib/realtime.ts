import { supabase } from './supabase';

// -----------------------------
// Shared Types
// -----------------------------
export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  new?: T;
  old?: T;
  errors?: any;
}

export interface OrdersSubscriptionOptions {
  tenantId: string;
  onInsert?: (event: RealtimeEvent) => void;
  onUpdate?: (event: RealtimeEvent) => void;
  onDelete?: (event: RealtimeEvent) => void;
}

export interface OrderStatusEventsSubscriptionOptions {
  tenantId: string;
  onInsert?: (event: RealtimeEvent) => void;
}

export interface PaymentIntentsSubscriptionOptions {
  tenantId: string;
  onInsert?: (event: RealtimeEvent) => void;
  onUpdate?: (event: RealtimeEvent) => void;
}

// -----------------------------
// Safe callback wrapper
// -----------------------------
const safeCallback = (callback?: (event: RealtimeEvent) => void) => {
  return (payload: any) => {
    if (!callback) return;
    try {
      const event: RealtimeEvent = {
        eventType: payload.eventType || payload.type || '*',
        new: payload.new,
        old: payload.old,
        errors: (payload as any)?.errors
      };
      callback(event);
    } catch (error) {
      console.error('Realtime callback error:', error);
    }
  };
};

// -----------------------------
// BACK-COMPAT SIMPLE SUBSCRIPTIONS (ProjectKAF original API)
// -----------------------------
// Returns the RealtimeChannel (same as before)
export function subscribeOrders(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel(`orders-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

export function subscribeMenuItems(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel(`menu-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items', filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

export function subscribeTables(tenantId: string, handler: (payload: any) => void) {
  return supabase
    .channel(`tables-rtc:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'restaurant_tables', filter: `tenant_id=eq.${tenantId}` },
      handler
    )
    .subscribe();
}

// -----------------------------
// ADVANCED / OPTIONS-BASED SUBSCRIPTIONS (Part2 compatible)
// -----------------------------
// Returns an unsubscribe function (same as Part2)
export const subscribeOrdersDetailed = (options: OrdersSubscriptionOptions): (() => void) => {
  const { tenantId, onInsert, onUpdate, onDelete } = options;
  const channel = supabase
    .channel(`orders:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onInsert)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onUpdate)
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onDelete)
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch (err) { console.error('orders unsubscribe error:', err); }
  };
};

export const subscribeOrderStatusEvents = (options: OrderStatusEventsSubscriptionOptions): (() => void) => {
  const { tenantId, onInsert } = options;
  const channel = supabase
    .channel(`order_status_events:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'order_status_events', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onInsert)
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch (err) { console.error('order_status_events unsubscribe error:', err); }
  };
};

export const subscribePaymentIntents = (options: PaymentIntentsSubscriptionOptions): (() => void) => {
  const { tenantId, onInsert, onUpdate } = options;
  const channel = supabase
    .channel(`payment_intents:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'payment_intents', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onInsert)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'payment_intents', filter: `tenant_id=eq.${tenantId}` },
      safeCallback(onUpdate)
    )
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch (err) { console.error('payment_intents unsubscribe error:', err); }
  };
};

// -----------------------------
// Debounced utility + Manager (frontend-safe typings)
// -----------------------------
export const createDebouncedCallback = (callback: () => void, delay: number = 300): (() => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try { callback(); } catch (error) { console.error('Debounced callback error:', error); }
    }, delay);
  };
};

export class RealtimeManager {
  private subscriptions: (() => void)[] = [];
  private debouncedCallbacks: Map<string, () => void> = new Map();

  addSubscription(subscription: () => void): void {
    this.subscriptions.push(subscription);
  }

  createDebounced(key: string, callback: () => void, delay: number = 300): () => void {
    const debouncedFn = createDebouncedCallback(callback, delay);
    this.debouncedCallbacks.set(key, debouncedFn);
    return debouncedFn;
  }

  getDebounced(key: string): (() => void) | undefined {
    return this.debouncedCallbacks.get(key);
  }

  cleanup(): void {
    this.subscriptions.forEach(unsub => {
      try { unsub(); } catch (error) { console.error('Error during subscription cleanup:', error); }
    });
    this.subscriptions = [];
    this.debouncedCallbacks.clear();
  }
}