// src/pages/auth/Callback.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

function getHashParams(): Record<string, string> {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  return Object.fromEntries(new URLSearchParams(h));
}

function getSafeNext(): string | null {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get('next');
  const fromStorage = sessionStorage.getItem('kaf_next') || localStorage.getItem('kaf_next');
  const candidate = fromQuery || fromStorage || null;
  if (!candidate) return null;
  // Only allow same-app relative paths to avoid open redirects
  if (candidate.startsWith('/') && !candidate.startsWith('/auth/callback') && !candidate.startsWith('/login')) {
    return candidate;
  }
  return null;
}

export default function Callback() {
  const nav = useNavigate();
  const [msg, setMsg] = useState('Finalizing sign-in…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const err = url.searchParams.get('error');
        const errCode = url.searchParams.get('error_code');
        const errDesc = url.searchParams.get('error_description');

        // If Supabase returned an auth code (PKCE/magic link), exchange it for a session first
        if (code) {
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) {
            setIsError(true);
            setMsg(exchErr.message || 'Failed to complete sign-in.');
            return;
          }
        }

        // If Supabase sent an error (e.g., otp_expired)
        if (err || errCode) {
          setIsError(true);
          setMsg(errDesc || `${err}${errCode ? ` (${errCode})` : ''}` || 'Sign-in link invalid or expired.');
          return; // stay on page, show message + link back to login
        }

        // Handle implicit flow via token hash only
        const hp = getHashParams();
        const access_token = hp['access_token'];
        const refresh_token = hp['refresh_token'];
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        }

        // Confirm we have a session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          // No session data; go back to login gracefully
          setIsError(true);
          setMsg('No active session. Please request a new sign-in link.');
          return;
        }

        const nextTarget = getSafeNext() || '/dashboard';
        // Clear any stored redirect once consumed
        sessionStorage.removeItem('kaf_next');
        localStorage.removeItem('kaf_next');

        // Clean the URL (remove code/error params) without leaving the current SPA context
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
        if (!cancelled) nav(nextTarget, { replace: true });
      } catch (err: any) {
        if (!cancelled) {
          setIsError(true);
          setMsg(err?.message ?? 'Failed to complete sign-in.');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [nav]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className={`rounded-xl border p-6 shadow-sm max-w-md w-full ${isError ? 'border-red-300 bg-red-50' : ''}`}>
        <p className={`text-sm ${isError ? 'text-red-700' : 'text-gray-700'}`}>{msg}</p>
        {isError && (
          <div className="mt-4 text-sm">
            <Link to={getSafeNext() ? `/login?next=${encodeURIComponent(getSafeNext()!)}` : '/login'} className="underline text-blue-700 hover:text-blue-800">Return to login</Link>
          </div>
        )}
      </div>
    </div>
  );
}