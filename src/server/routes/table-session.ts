import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import FastifyPlugin from 'fastify-plugin';
import { verifyQr } from '../../lib/qr/verify';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function sbAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) throw new Error('SUPABASE URL/SERVICE ROLE missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

const OpenBody = z.object({ token: z.string() });
const JoinBody = z.object({ token: z.string(), pin: z.string().min(4).max(6) });

function genPin(len = Number(process.env.JOIN_PIN_LENGTH || 4)) {
  const n = Math.max(4, Math.min(6, len));
  let p = '';
  while (p.length < n) p += Math.floor(Math.random() * 10).toString();
  return p;
}

export default FastifyPlugin(async (app: FastifyInstance) => {
  // POST /api/table-session/open  -> first device; locks table, returns PIN (only on first join)
  app.post('/api/table-session/open', async (req, reply) => {
    const { token } = OpenBody.parse(req.body);
    let payload;
    try { payload = verifyQr(token); } catch (e: any) {
      return reply.code(401).send({ error: e.message || 'Invalid QR' });
    }

    const { tenant_id, table_id, exp } = payload;
    const sb = sbAdmin();

    // Is there an active lock?
    const { data: existing, error: selErr } = await sb
      .from('table_sessions')
      .select('id,status,expires_at')
      .eq('tenant_id', tenant_id)
      .eq('table_id', table_id)
      .eq('status', 'active')
      .maybeSingle();

    if (selErr) return reply.code(500).send({ error: 'db_select_failed' });

    // TTL for session follows QR max exp (or env TTL)
    const ttlMin = Number(process.env.TABLE_SESSION_TTL_MIN || 15);
    const sessExp = new Date(Math.min(exp * 1000, Date.now() + ttlMin * 60_000));

    if (!existing) {
      // First join → generate PIN, create session, return PIN once
      const pinPlain = genPin();
      const pin_hash = await bcrypt.hash(pinPlain, 10);
      const { data: created, error: insErr } = await sb
        .from('table_sessions')
        .insert({
          tenant_id,
          table_id,
          pin_hash,
          status: 'active',
          expires_at: sessExp.toISOString()
        })
        .select('id')
        .single();

      if (insErr) return reply.code(500).send({ error: 'db_insert_failed' });
      return reply.code(201).send({
        session_id: created!.id,
        requires_pin: false,
        pin: pinPlain
      });
    }

    // Already locked → second device must provide PIN
    return reply.code(409).send({
      requires_pin: true,
      reason: 'table_locked'
    });
  });

  // POST /api/table-session/join  -> subsequent devices join with PIN
  app.post('/api/table-session/join', async (req, reply) => {
    const { token, pin } = JoinBody.parse(req.body);
    let payload;
    try { payload = verifyQr(token); } catch (e: any) {
      return reply.code(401).send({ error: e.message || 'Invalid QR' });
    }
    const { tenant_id, table_id } = payload;
    const sb = sbAdmin();

    const { data: sess, error: selErr } = await sb
      .from('table_sessions')
      .select('id,pin_hash,status,expires_at')
      .eq('tenant_id', tenant_id)
      .eq('table_id', table_id)
      .eq('status', 'active')
      .maybeSingle();

    if (selErr) return reply.code(500).send({ error: 'db_select_failed' });
    if (!sess) return reply.code(404).send({ error: 'no_active_session' });

    // Expiry check for active session
    if (new Date(sess.expires_at).getTime() <= Date.now()) {
      return reply.code(410).send({ error: 'session_expired' });
    }

    const ok = await bcrypt.compare(pin, sess.pin_hash);
    if (!ok) return reply.code(401).send({ error: 'bad_pin' });

    return reply.code(200).send({
      session_id: sess.id,
      joined: true
    });
  });

  // POST /api/table-session/close  -> optional: close lock (owner action)
  app.post('/api/table-session/close', async (req, reply) => {
    const { token } = OpenBody.parse(req.body);
    let payload;
    try { payload = verifyQr(token); } catch (e: any) {
      return reply.code(401).send({ error: e.message || 'Invalid QR' });
    }
    const { tenant_id, table_id } = payload;
    const sb = sbAdmin();
    const { error } = await sb
      .from('table_sessions')
      .update({ status: 'closed' })
      .eq('tenant_id', tenant_id)
      .eq('table_id', table_id)
      .eq('status', 'active');
    if (error) return reply.code(500).send({ error: 'db_update_failed' });
    return reply.code(200).send({ closed: true });
  });
});