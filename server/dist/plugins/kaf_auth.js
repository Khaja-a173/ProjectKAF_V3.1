import fp from "fastify-plugin";
import { svc } from "../utils/supabase";
export default fp(async function kafAuth(app) {
    app.addHook("preHandler", async (req, reply) => {
        const authz = req.headers["authorization"];
        if (!authz?.startsWith("Bearer "))
            return;
        const token = authz.slice("Bearer ".length);
        try {
            const { data: userData } = await svc.auth.getUser(token);
            const userId = userData?.user?.id;
            const email = userData?.user?.email || null;
            if (!userId)
                return;
            const { data: memberships } = await svc.from("staff").select("tenant_id, role").eq("user_id", userId);
            const tenantIds = (memberships || []).map((m) => m.tenant_id);
            req.auth = { userId, email, memberships: memberships || [], tenantIds, primaryTenantId: tenantIds[0] || null };
        }
        catch (e) {
            app.log.error({ e }, "kafAuth preHandler");
        }
    });
    app.decorate("kafRequireAuth", async (req, reply) => { if (!req.auth?.userId)
        return reply.code(401).send({ authenticated: false, reason: "no_token" }); });
    app.decorate("kafRequireRole", async (req, reply, roles) => {
        const ok = !!req.auth?.memberships?.some(m => roles.includes(m.role));
        if (!ok)
            return reply.code(403).send({ error: "forbidden" });
    });
});
