// server/src/routes/health.ts
import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

// Prefer SUPABASE_SERVICE_ROLE, fallback to SUPABASE_SERVICE_ROLE_KEY for compatibility
const SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE as string) || (process.env.SUPABASE_SERVICE_ROLE_KEY as string);

export default async function healthRoutes(app: FastifyInstance) {
  const runCheck = async () => {
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      SERVICE_ROLE_KEY as string
    );
    if (!process.env.SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_URL or service role key');
    }
    const started = Date.now();
    const { error } = await supabase.from('menu_items').select('id').limit(1);
    const ms = Date.now() - started;
    if (error) throw new Error(error.message);
    return { ms };
  };

  app.get('/health/supabase', async (_req, reply) => {
    try {
      const res = await runCheck();
      return reply.send({ ok: true, latency_ms: res?.ms });
    } catch (err: any) {
      app.log.error({ err: err?.message }, 'health/supabase failed');
      return reply.code(500).send({ ok: false, error: err?.message || 'unknown' });
    }
  });

  // Compatibility for older UIs that call /health/db
  app.get('/health/db', async (req, reply) => {
    try {
      const res = await runCheck();
      return reply.send({ ok: true, latency_ms: res?.ms });
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: err?.message || 'unknown' });
    }
  });

  // Simple root health for reverse proxies and uptime checks
  app.get('/health', async (_req, reply) => {
    try {
      const res = await runCheck();
      return reply.send({ ok: true, services: { supabase: true }, latency_ms: res?.ms });
    } catch (err: any) {
      app.log.error({ err: err?.message }, 'health root failed');
      return reply.code(500).send({ ok: false, error: err?.message || 'unknown' });
    }
  });
}