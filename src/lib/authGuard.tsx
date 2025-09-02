import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useSession() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token ?? null);

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setToken(session?.access_token ?? null);
      });

      return () => { authListener.subscription.unsubscribe(); };
    })();
  }, []);

  return token;
}

export function Protected({ children }: { children: React.ReactNode }) {
  const token = useSession();
  if (token === null) return <div className="p-6">Checking session…</div>;
  return <>{children}</>;
}