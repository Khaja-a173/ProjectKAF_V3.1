import type { FastifyInstance } from "fastify";
import { svc } from "../utils/supabase";

export default async function routes(app: FastifyInstance) {
  app.post(
    "/tenants/bootstrap",
    {
      preHandler: [(req, reply) => app.kafRequireAuth(req, reply)],
    },
    async (req, reply) => {
      const a = (req as any).auth;

      // If user already belongs to a tenant, skip bootstrap
      if ((a.memberships || []).length > 0) {
        return reply.send({ skipped: true });
      }

      // Generate tenant code
      const name = (req.body as any)?.restaurant_name || "My Restaurant";
      const code = name
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 4)
        .toUpperCase()
        .padEnd(4, "X");

      // Insert tenant
      const { data: t, error } = await svc
        .from("tenants")
        .insert([{ name, code }])
        .select("id, code")
        .single();

      if (error || !t) {
        app.log.error(`Failed to create tenant: ${error?.message || "Unknown error"}`);
        return reply.status(500).send({ error: "Failed to create tenant" });
      }

      // Insert initial admin staff
      const { error: staffError } = await svc.from("staff").insert([
        {
          tenant_id: t.id,
          user_id: a.userId,
          role: "admin",
        },
      ]);

      if (staffError) {
        app.log.error(`Failed to create staff admin: ${staffError?.message || "Unknown error"}`);
        return reply.status(500).send({ error: "Failed to create staff admin" });
      }

      return reply.send({
        created: true,
        tenant_id: t.id,
        code: t.code,
      });
    }
  );
}