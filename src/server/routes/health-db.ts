import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

export default fp(async (app: FastifyInstance) => {
  app.get('/api/health/db', async (_req, reply) => {
    try {
      const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE;

      if (!url || !key) {
        return reply.code(500).send({ ok: false, error: 'missing_supabase_env' });
      }

      const sb = createClient(url, key, { auth: { persistSession: false } });

      // Lightweight check: confirm table exists and is readable with service role.
      const { error } = await sb.from('menu_items').select('id').limit(1);
      if (error) {
        return reply.code(500).send({ ok: false, error: 'db_error', detail: error.message });
      }

      return reply.code(200).send({ ok: true });
    } catch (e: any) {
      return reply.code(500).send({ ok: false, error: 'unexpected', detail: e?.message });
    }
  });
});