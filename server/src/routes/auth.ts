// server/src/routes/auth.ts
import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  const handler = async (req: any, reply: any) => {
    const a = (req as any).auth;

    // If the auth plugin did not populate req.auth, no valid token was provided
    if (!a?.userId) {
      return reply.send({ authenticated: false, reason: 'no_token' });
    }

    try {
      // Fetch memberships from staff table for this user
      const { data: memberships, error } = await app.supabase
        .from('staff')
        .select('tenant_id, role')
        .eq('user_id', a.userId);

      if (error) {
        app.log.error({ error }, '[auth] failed to fetch memberships');
        return reply.status(500).send({ authenticated: false, reason: 'db_error' });
      }

      const tenantIds = memberships?.map((m: any) => m.tenant_id) || [];
      const primaryTenantId = a.primaryTenantId ?? memberships?.[0]?.tenant_id ?? null;

      return reply.send({
        authenticated: true,
        user: {
          id: a.userId,
          email: a.email ?? null,
        },
        memberships: memberships || [],
        tenant_ids: tenantIds,
        primary_tenant_id: primaryTenantId,
      });
    } catch (err: any) {
      app.log.error({ err }, '[auth] unexpected error');
      return reply.status(500).send({ authenticated: false, reason: 'server_error' });
    }
  };

  // Mount the SAME handler on all endpoints the UI might call
  app.get('/auth/whoami', handler);
  app.get('/auth/me', handler);
  app.get('/auth/session', handler);
}