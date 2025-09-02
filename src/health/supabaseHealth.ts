import { API_BASE } from '@/lib/api';

/**
 * Health check for Supabase that does NOT query tables from the browser.
 * Uses API (service role) instead. In development, soft-fail to avoid blocking UI.
 */
export async function checkMenuHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health/supabase`, { credentials: 'include' });
    if (res.ok) {
      const json = await res.json().catch(() => ({} as any));
      return !!json?.ok;
    }
    return process.env.NODE_ENV === 'development' ? true : false;
  } catch {
    return process.env.NODE_ENV === 'development' ? true : false;
  }
}
