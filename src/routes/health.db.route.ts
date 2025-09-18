import type { FastifyInstance } from "fastify";
export default async function (app: FastifyInstance) {
  app.get("/health/db", async (_req, reply) => {
    try {
      await app.prisma.feedCache.findFirst({ take: 1 });
      return { status: "ok" };
    } catch {
      return reply.status(503).send({ status: "fail" });
    }
  });
}
