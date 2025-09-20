import type { FastifyInstance } from "fastify";

export default async function (app: FastifyInstance) {
  app.get("/health/server", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: process.version,
  }));

  app.get("/health/db", async (_req, reply) => {
    try {
      await app.prisma.feedCache.findFirst({ select: { url: true } });
      return { status: "ok" };
    } catch (err) {
      app.log.warn({ err }, "DB health failed");
      return reply.status(503).send({ status: "fail" });
    }
  });
}
