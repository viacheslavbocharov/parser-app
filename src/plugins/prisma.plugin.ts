import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

export default fp(
  async (fastify) => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    fastify.decorate("prisma", prisma);
    fastify.pluginLoaded("prisma-plugin");

    fastify.addHook("onClose", async () => prisma.$disconnect());
  },
  { name: "prisma-plugin" },
);
