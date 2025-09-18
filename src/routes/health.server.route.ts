import type { FastifyInstance } from "fastify";
export default async function (app: FastifyInstance) {
  app.get("/health/server", async () => ({
    status: "ok",
    uptime: process.uptime(),
    version: process.version,
  }));
}
