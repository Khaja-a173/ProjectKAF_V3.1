import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function HealthBanner() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const j: any = await apiFetch('/health/supabase');
        if (!aborted) setOk(!!j?.ok);
      } catch (e) {
        if (!aborted) setOk(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  if (ok !== false) return null; // hide when loading or healthy
  return (
    <div style={{
      padding: 8,
      fontSize: 12,
      background: '#fdecea',
      color: '#b71c1c'
    }}>
      Supabase health check failed. See console/server logs.
    </div>
  );
}