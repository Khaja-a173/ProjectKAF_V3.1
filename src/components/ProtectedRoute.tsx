// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ProtectedRoute() {
  const loc = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState<boolean>(false);

  // Public routes where we never force redirect to login
  const publicPaths = ['/', '/menu', '/events', '/gallery', '/live-orders', '/contact', '/login', '/auth/callback'];

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setHasSession(!!session);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => unsub();
  }, []);

  useEffect(() => {
    if (hasSession && loc.pathname === '/login') {
      const params = new URLSearchParams(loc.search);
      const next = params.get('next');
      if (next) {
        navigate(next, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [hasSession, loc.pathname, loc.search, navigate]);

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-gray-500">
        Checking session…
      </div>
    );
  }

  // If there's no session and we're NOT on a public page, redirect to login
  if (!hasSession && !publicPaths.includes(loc.pathname)) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // For authenticated users, always render Outlet to support nested routes like dashboard
  return <Outlet />;
}