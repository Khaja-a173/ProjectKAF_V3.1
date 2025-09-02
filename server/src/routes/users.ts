// server/src/routes/users.ts
import type { FastifyInstance } from 'fastify';

const ROLES = ['admin','manager','staff','kitchen','cashier'] as const;
type Role = typeof ROLES[number];

const normalizeRole = (r: string | undefined | null): Role | null => {
  const k = String(r || '').toLowerCase();
  const map: Record<string, Role> = {
    admin: 'admin',
    manager: 'manager',
    staff: 'staff',       // previously mapped waiter → staff
    kitchen: 'kitchen',
    cashier: 'cashier'
  };
  return map[k] ?? null;
};

// Map invitation roles -> staff table roles
const toStaffRole = (r: string | undefined | null): 'admin'|'manager'|'waiter'|'kitchen'|null => {
  const k = String(r || '').toLowerCase();
  const map: Record<string, 'admin'|'manager'|'waiter'|'kitchen'> = {
    admin: 'admin',
    manager: 'manager',
    staff: 'waiter',   // <-- important: staff -> waiter
    kitchen: 'kitchen',
    cashier: 'waiter', // cashier not allowed in staff, map to waiter
  };
  return map[k] ?? null;
};

type InviteBody = { email: string; role: Role; tenant_id?: string };
type AcceptBody = { tenant_id?: string };

export default async function usersRoutes(app: FastifyInstance) {
  // Invite a user (admin/manager only)
  app.post('/users/invite', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const { email, role, tenant_id }: InviteBody = (req.body as any) || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const mappedRole = normalizeRole(role as any);
    if (!cleanEmail || !mappedRole) {
      return reply.code(400).send({ error: 'invalid_payload' });
    }

    const tenantId =
      tenant_id ||
      (req as any).auth?.primaryTenantId ||
      (req.headers['x-tenant-id'] as string);

    if (!tenantId) return reply.code(400).send({ error: 'tenant_missing' });

    // requester must be admin/manager for tenant
    const { data: canInvite, error: authErr } = await app.supabase
      .from('staff')
      .select('role')
      .eq('user_id', (req as any).auth?.userId)
      .eq('tenant_id', tenantId)
      .in('role', ['admin','manager'])
      .maybeSingle();

    if (authErr || !canInvite) return reply.code(403).send({ error: 'forbidden' });

    const { data: invite, error: invErr } = await app.supabase
      .from('invitations')
      .insert({
        email: cleanEmail,
        tenant_id: tenantId,
        role: mappedRole,
        invited_by: (req as any).auth?.userId
      })
      .select('*')
      .single();

        if (invErr) {
        return reply.code(500).send({
            error: 'invite_failed',
            detail: invErr.message || invErr.details || invErr.code || 'unknown'
        });
        }

    // Best-effort Supabase email invite (requires service role)
    try {
      const redirectTo = `${process.env.VITE_APP_URL || 'http://localhost:5173'}/accept-invite`;
      await (app.supabase as any).auth.admin.inviteUserByEmail(cleanEmail, { redirectTo });
    } catch {/* ignore */}

    return reply.send({ id: invite.id, status: 'pending' });
  });

  // Accept invitation (must be logged in as invited email)
  app.post('/users/accept', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const userId = (req as any).auth?.userId as string;
    const userEmail = String((req as any).auth?.email || '').toLowerCase();
    const desiredTenant = (req.body as AcceptBody)?.tenant_id;

    let q = app.supabase
      .from('invitations')
      .select('id, tenant_id, role, status')
      .eq('email', userEmail)
      .eq('status', 'pending');

    if (desiredTenant) q = q.eq('tenant_id', desiredTenant);

    const { data: invites, error: invErr } = await q.limit(1);
    if (invErr || !invites || invites.length === 0) {
      return reply.code(404).send({ error: 'invite_not_found' });
    }

    const invite = invites[0];

    const staffRole = toStaffRole((invite as any).role);
    if (!staffRole) {
      return reply.code(400).send({ error: 'invalid_role_for_staff' });
    }

    const { data: existing, error: selErr } = await app.supabase
      .from('staff')
      .select('id, role')
      .eq('tenant_id', invite.tenant_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (selErr) return reply.code(500).send({ error: 'membership_lookup_failed' });

    if (!existing) {
      const { error: insErr } = await app.supabase
        .from('staff')
        .insert({ tenant_id: invite.tenant_id, user_id: userId, role: staffRole });
      if (insErr) return reply.code(500).send({ error: 'membership_failed', detail: insErr.message });
    } else if (existing.role !== staffRole) {
      const { error: updErr } = await app.supabase
        .from('staff')
        .update({ role: staffRole })
        .eq('tenant_id', invite.tenant_id)
        .eq('user_id', userId);
      if (updErr) return reply.code(500).send({ error: 'membership_failed', detail: updErr.message });
    }

    await app.supabase
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    return reply.send({ ok: true, tenant_id: invite.tenant_id, role: staffRole });
  });
}