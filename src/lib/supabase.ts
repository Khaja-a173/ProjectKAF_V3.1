// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  // Fail fast in dev if env is missing
  // (Vite prints this in console; avoids silent auth failures)
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // handles magic link redirects
    // Removed flowType: 'pkce' to default to implicit for magic links
  },
});

// ✅ Export constants for reuse
export const supabaseUrl = url;
export const supabaseAnonKey = anon;

// ✅ Helper: send magic link
export async function signInWithEmail(email: string) {
  // Support ?next= for redirect after magic link
  const params = new URLSearchParams(window.location.search);
  const nextParam = params.get('next');
  const redirectTo = `${window.location.origin}/auth/callback${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ''}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

// ✅ Helper: finalize session after magic link callback
export async function finalizeSessionFromHash() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return false;
  const params = new URLSearchParams(hash.slice(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    return true;
  }
  return false;
}