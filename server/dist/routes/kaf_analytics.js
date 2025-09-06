import { svc } from '../utils/supabase';
export default async function r(app) { app.get('/analytics/revenue_timeseries', { preHandler: [(req, reply) => app.kafRequireAuth(req, reply)] }, async (req, reply) => { const a = req.auth; const { data } = await svc.rpc('revenue_timeseries', { tenant_ids: a.tenantIds }); return reply.send(data || []); }); }
