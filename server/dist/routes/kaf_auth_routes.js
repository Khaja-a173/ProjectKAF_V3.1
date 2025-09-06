export default async function r(app) { app.get('/auth/whoami', async (req, reply) => { const a = req.auth; if (!a?.userId)
    return reply.send({ authenticated: false }); return reply.send({ authenticated: true, user_id: a.userId, email: a.email, memberships: a.memberships || [], tenant_ids: a.tenantIds || [], primary_tenant_id: a.primaryTenantId || null }); }); }
