import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

export default fp(
  async (app) => {
    const prisma = new PrismaClient();

    try {
      await prisma.$connect();
      app.decorate("prisma", prisma);
      app.pluginLoaded("prisma-plugin");
      app.log.info("✅ Prisma connected");
    } catch (err: unknown) {
      app.log.error({ err }, "❌ Prisma connect failed");
      try {
        await prisma.$disconnect();
      } catch {}

      const msg = err instanceof Error ? err.message : "Database connection failed";
      throw new Error(msg);
    }

    app.addHook("onClose", async () => {
      try {
        await prisma.$disconnect();
        app.log.info("✅ Prisma disconnected");
      } catch (e: unknown) {
        app.log.warn({ err: e }, "⚠️ Prisma disconnect failed");
      }
    });
  },
  { name: "prisma-plugin" },
);
