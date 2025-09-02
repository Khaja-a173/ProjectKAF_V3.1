// src/pages/Login.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextParam = params.get('next');
  const postLoginTarget = nextParam && nextParam.startsWith('/') ? nextParam : '/dashboard';
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${nextParam ? `?next=${encodeURIComponent(postLoginTarget)}` : ''}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send link');
    } finally {
      setSending(false);
    }
  }

  async function devBypassIfSession() {
    // If a session already exists (e.g., came back via magic link), push to dashboard
    const { data } = await supabase.auth.getSession();
    if (data.session) nav(postLoginTarget, { replace: true });
  }

  useEffect(() => {
    devBypassIfSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-10">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-semibold">RestaurantOS</h1>
          <p className="opacity-90">Multi-tenant restaurant platform with real-time dashboards.</p>
          <ul className="space-y-2 opacity-90 text-sm">
            <li>• Passwordless, secure sign-in</li>
            <li>• Tenant-isolated data with RLS</li>
            <li>• Realtime KDS & analytics</li>
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center p-8">
        <form onSubmit={sendMagicLink} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in with your email — we’ll send you a magic link.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <input
              type="email"
              required
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {sent ? (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Check your email for a login link. You can close this tab after you click it.
            </div>
          ) : (
            <button
              type="submit"
              disabled={sending || sent || !email.trim()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send magic link'}
            </button>
          )}
        </form>
      </section>
    </div>
  );
}