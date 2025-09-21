import type { FastifyInstance } from "fastify";

type MongoPing = { ok?: number };

export default async function (app: FastifyInstance) {
  app.get("/health/server", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: process.version,
  }));

  app.get("/health/db", async (_req, reply) => {
    try {
      const res = (await app.prisma.$runCommandRaw({ ping: 1 })) as unknown as MongoPing;
      if (res.ok === 1) return { status: "ok" };
      return reply.serviceUnavailable("DB ping failed");
    } catch (err) {
      app.log.warn({ err }, "DB health failed");
      return reply.serviceUnavailable("DB health failed");
    }
  });
}
