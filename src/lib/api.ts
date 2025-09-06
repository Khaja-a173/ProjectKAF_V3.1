import { supabase } from '@/lib/supabase';
/* src/lib/api.ts
   Unified frontend API client for ProjectKAF (Vite).
   - Uses VITE_API_URL for the Fastify backend base URL
   - Exposes minimal, stable functions required by current pages
   - Handles auth bearer & optional tenant header
*/

export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:8090";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

let AUTH_TOKEN: string | null = null;
let TENANT_ID: string | null = null;

export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
}

export function clearAuthToken() {
  AUTH_TOKEN = null;
}

export function setTenantId(tenantId: string | null) {
  TENANT_ID = tenantId;
}

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function buildQuery(q?: Record<string, unknown>) {
  if (!q) return "";
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, String(vv)));
    else params.append(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    query?: Record<string, unknown>;
    body?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const { method = "GET", query, body, headers, signal } = options;

  const url = `${API_BASE}${path}${buildQuery(query)}`;
  // Attempt to fetch Supabase access token (non-fatal if unavailable)
  let accessToken: string | null = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    accessToken = sessionData?.session?.access_token ?? null;
  } catch {}
  const token = AUTH_TOKEN || accessToken;
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(TENANT_ID ? { 'X-Tenant-ID': TENANT_ID } : {}),
    ...(token ? { Authorization: `Bearer ${token}`, 'x-supabase-auth': token } : {}),
  };

  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body; // browser sets boundary
  } else if (body !== undefined) {
    baseHeaders["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers: { ...baseHeaders, ...(headers || {}) },
    body: fetchBody,
    signal,
    credentials: "include",
  });

  // No content
  if (res.status === 204) return undefined as unknown as T;

  let data: any = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new HttpError(res.status, msg, data);
  }

  return data as T;
}

/* ======================
   Types (subset needed)
====================== */

export type UUID = string;

export interface MenuCategory {
  id: UUID;
  name: string;
  sort_order?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: UUID;
  name: string;
  description?: string | null;
  price: number; // cents or the smallest currency unit your API uses
  currency?: string;
  image_url?: string | null;
  category_id?: UUID | null;
  sort_order?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ---------- Tables (for reservations) ---------- */
export interface DiningTable {
  id: UUID;
  code: string;            // e.g., T01, VIP2
  label?: string | null;   // human-friendly label
  seats: number;
  status?: 'available' | 'reserved' | 'occupied' | 'blocked';
  type?: 'standard' | 'window' | 'vip' | 'outdoor' | 'booth' | string;
  notes?: string | null;   // special description to show in popup
  created_at?: string;
  updated_at?: string;
}

export interface TableSearchParams {
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  guests: number;
  preference?: string; // type or area hint
}

export type ReceiptChannel = "email" | "sms" | "whatsapp";

export type PaymentProviderName = "stripe" | "razorpay" | "mock";

export interface PaymentProvider {
  id: UUID;
  tenant_id: UUID;
  provider: PaymentProviderName;
  enabled: boolean;
  config: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentIntent {
  id: UUID;
  order_id: UUID;
  provider: PaymentProviderName;
  status:
    | "requires_confirmation"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled";
  amount: number;
  currency?: string;
  client_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentEvent {
  id: UUID;
  intent_id: UUID;
  type: string; // e.g., 'payment_succeeded'
  payload?: any;
  created_at?: string;
}

/* ======================
   Menu (Admin + Client)
====================== */

export function getMenuCategories() {
  return request<MenuCategory[]>("/menu/categories");
}

export function getMenuItems(params?: { category_id?: UUID; active_only?: boolean }) {
  return request<MenuItem[]>("/menu/items", { query: params });
}

export function createMenuCategory(input: {
  name: string;
  sort_order?: number;
  description?: string | null;
}) {
  return request<MenuCategory>("/menu/categories", {
    method: "POST",
    body: input,
  });
}

export function createMenuItem(input: {
  name: string;
  price: number;
  currency?: string;
  description?: string | null;
  image_url?: string | null;
  category_id?: UUID | null;
  sort_order?: number | null;
  is_active?: boolean;
}) {
  return request<MenuItem>("/menu/items", { method: "POST", body: input });
}

export function updateMenuItem(
  id: UUID,
  patch: Partial<Omit<MenuItem, "id">>
) {
  return request<MenuItem>(`/menu/items/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

/** Accepts either a list of item objects or CSV text. Backend should support both shapes. */
export function bulkImportMenuItems(payload:
  | { items: Array<Partial<MenuItem> & { name: string; price: number }> }
  | { csv: string }) {
  return request<{ imported: number; errors?: Array<{ row: number; message: string }> }>(
    "/menu/bulk-import",
    { method: "POST", body: payload }
  );
}

/* ======================
   Tables (Search & Details)
====================== */

/** Search tables for a given date/time and party size */
export function searchTables(params: TableSearchParams) {
  return request<DiningTable[]>('/tables/search', {
    method: 'GET',
    query: params as unknown as Record<string, unknown>,
  });
}
/** Availability snapshot at a specific datetime (and optional party size) */
export function getAvailableTables(params: { at: string; guests?: number }) {
  return request<{
    at: string;
    guests?: number;
    available: DiningTable[];
    unavailable: DiningTable[];
    nextAvailableAt?: string | null;
  }>('/tables/available', {
    method: 'GET',
    query: params as unknown as Record<string, unknown>,
  });
}

/** Fetch full details for a specific table (for popup with specialties) */
export function getTableDetails(tableId: UUID) {
  return request<DiningTable>(`/tables/${tableId}`, { method: 'GET' });
}

/* ======================
   Payments
====================== */

export function getPaymentProviders() {
  return request<PaymentProvider[]>("/payments/providers");
}

export function createPaymentProvider(input: {
  provider: PaymentProviderName;
  config: Record<string, any>;
  enabled?: boolean;
}) {
  return request<PaymentProvider>("/payments/providers", {
    method: "POST",
    body: input,
  });
}

export function updatePaymentProvider(
  id: UUID,
  patch: Partial<{ config: Record<string, any>; enabled: boolean }>
) {
  return request<PaymentProvider>(`/payments/providers/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

// Admin Payments API Wrappers (used by AdminPayments & PaymentSettings pages)
export const listPaymentProviders = () => getPaymentProviders();

export const createTenantPaymentProvider = (body: {
  provider: PaymentProviderName;
  config: Record<string, any>;
  enabled?: boolean;
}) => createPaymentProvider(body);

export const updateTenantPaymentProvider = (
  id: UUID,
  body: Partial<{ config: Record<string, any>; enabled: boolean }>
) => updatePaymentProvider(id, body);

export function createPaymentIntent(input: {
  order_id: UUID;
  amount: number;
  method?: string; // optional hint to provider
}) {
  return request<PaymentIntent>("/payments/intents", {
    method: "POST",
    body: input,
  });
}

export function confirmPaymentIntent(id: UUID, body?: Record<string, any>) {
  return request<PaymentIntent>(`/payments/intents/${id}/confirm`, {
    method: "POST",
    body,
  });
}

export function refundPaymentIntent(id: UUID, amount?: number) {
  return request<PaymentIntent>(`/payments/intents/${id}/refund`, {
    method: "POST",
    body: amount ? { amount } : undefined,
  });
}

export function listPaymentIntents(params?: {
  order_id?: UUID;
  limit?: number;
  cursor?: string;
}) {
  return request<{ data: PaymentIntent[]; next_cursor?: string }>(
    "/payments/intents",
    { query: params }
  );
}

export function listPaymentEvents(intentId: UUID) {
  return request<PaymentEvent[]>(`/payments/intents/${intentId}/events`);
}

/** Test hook for your mock emitter (kept for parity with your snapshot) */
export function emitPaymentIntentEvent(intentId: UUID, type: string) {
  return request<{ ok: true }>(`/payments/intents/${intentId}/emit-event`, {
    method: "POST",
    body: { type },
  });
}

/* ======================
   Receipts
====================== */

export function sendReceipt(input: {
  order_id: UUID;
  channel: ReceiptChannel;
  to: string;
}) {
  return request<{ ok: true; message_id?: string }>("/receipts/send", {
    method: "POST",
    body: input,
  });
}

/* ======================
   KDS (feature-flagged)
====================== */

export function advanceOrder(
  orderId: UUID,
  to_state: "queued" | "preparing" | "ready" | "served" | "completed" | "cancelled"
) {
  return request<{ ok: true; order_id: UUID; status: string }>(
    `/kds/orders/${orderId}/advance`,
    { method: "POST", body: { to_state } }
  );
}

/* ======================
   Analytics (subset)
====================== */

export function revenueTimeseries(params: {
  range?: "7d" | "30d" | "90d";
  interval?: "hour" | "day" | "week" | "month";
}) {
  // Call snake_case endpoint and adapt to legacy shape { t, revenue }
  return request<any>("/analytics/revenue_timeseries", { query: params as any }).then((resp) => {
    const series: any[] = Array.isArray(resp?.series)
      ? resp.series
      : Array.isArray(resp?.points)
        ? resp.points
        : Array.isArray(resp)
          ? resp
          : [];
    return series.map((p: any) => ({
      t: String(p.bucket ?? p.t ?? p.time ?? p.date ?? ""),
      revenue: Number(p.revenue_total ?? p.revenue ?? p.total_minor ?? 0),
    }));
  });
}

export function paymentConversionFunnel(params?: { range?: "7d" | "30d" | "90d" }) {
  // Call snake_case endpoint and adapt to legacy shape { stage, value }
  return request<any>("/analytics/payment_conversion_funnel", { query: params as any }).then((resp) => {
    const rows: any[] = Array.isArray(resp?.rows)
      ? resp.rows
      : Array.isArray(resp)
        ? resp
        : [];
    return rows.map((r: any) => ({
      stage: String(r.stage ?? r.name ?? "unknown"),
      value: Number(r.value ?? r.intents ?? r.count ?? 0),
    }));
  });
}

export function orderFulfillmentTimeline(params?: { range?: "7d" | "30d" | "90d" }) {
  // Call snake_case endpoint and adapt
  return request<any>("/analytics/order_fulfillment_timeline", { query: params as any }).then((resp) => {
    const rows: any[] = Array.isArray(resp?.rows)
      ? resp.rows
      : Array.isArray(resp)
        ? resp
        : [];
    return rows.map((r: any) => ({
      step: String(r.step ?? r.name ?? ""),
      p50_ms: Number(r.p50_ms ?? r.p50 ?? 0),
      p95_ms: Number(r.p95_ms ?? r.p95 ?? 0),
    }));
  });
}

/* ======================
   Helpers
====================== */

export function getErrorMessage(err: unknown) {
  if (err instanceof HttpError) return err.message;
  if (err && typeof err === "object" && "message" in err)
    return String((err as any).message);
  return "Something went wrong";
}

/* Default export for convenience */
const api = {
  setAuthToken,
  clearAuthToken,
  setTenantId,
  getMenuCategories,
  getMenuItems,
  createMenuCategory,
  createMenuItem,
  updateMenuItem,
  bulkImportMenuItems,
  getPaymentProviders,
  createPaymentProvider,
  updatePaymentProvider,
  listPaymentProviders,
  createTenantPaymentProvider,
  updateTenantPaymentProvider,
  createPaymentIntent,
  confirmPaymentIntent,
  refundPaymentIntent,
  listPaymentIntents,
  listPaymentEvents,
  emitPaymentIntentEvent,
  sendReceipt,
  advanceOrder,
  revenueTimeseries,
  paymentConversionFunnel,
  orderFulfillmentTimeline,
  searchTables,
  getAvailableTables,
  getTableDetails,
  getErrorMessage,
};

// Expose a generic fetch helper for components that need raw access
export { request as apiFetch };

export default api;
