import 'fastify';

declare module 'fastify' {
  interface FastifyReply {
    requireAuth: (req: FastifyRequest) => void;
    requireRole: (req: FastifyRequest, roles: string[]) => void;
    requireTenantCtx: (req: FastifyRequest, tenantId?: string) => void;
  }
}