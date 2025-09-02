// server/src/routes/tenants.ts
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { TenantService } from "../services/tenant.service";
import { signQrPayload, generateQrPngUrl } from "../lib/qr";

const CreateTenantSchema = z.object({
  name: z.string().min(2, "name must be at least 2 characters"),
  plan: z.string().optional()
});

const QrParamsSchema = z.object({
  code: z
    .string()
    .length(4, "tenant code must be 4 characters")
    .transform((s) => s.toUpperCase()),
  table: z
    .string()
    .regex(/^T\d{2}$/, "table must match pattern T\\d{2}")
});

export default async function routes(app: FastifyInstance) {
  const service = new TenantService(app);

  // Create tenant
  app.post("/tenants", async (req, reply) => {
    const parsed = CreateTenantSchema.safeParse((req as any).body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid body", details: parsed.error.flatten() });
    }

    try {
      const { name, plan } = parsed.data;
      const created = await service.createTenant(name, plan);
      return reply.code(201).send(created);
    } catch (err) {
      app.log.error({ err }, "failed to create tenant");
      return reply.code(500).send({ error: "Failed to create tenant" });
    }
  });

  // Generate QR for a table within a tenant
  app.get("/tenants/:code/qr/:table", async (req, reply) => {
    const parsed = QrParamsSchema.safeParse((req as any).params);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid params", details: parsed.error.flatten() });
    }

    const { code, table } = parsed.data;

    try {
      const tenant = await service.getTenantByCode(code);
      if (!tenant) {
        return reply.code(404).send({ error: "Tenant not found" });
      }

      const signed = signQrPayload({ tenant_code: code, table_code: table });
      const png = await generateQrPngUrl(signed);
      return reply.send({ data_url: png, signed });
    } catch (err) {
      app.log.error({ err, code, table }, "failed to generate tenant table QR");
      return reply.code(500).send({ error: "Failed to generate QR" });
    }
  });
}