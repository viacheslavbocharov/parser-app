import type { Config } from "../config/schema";
import type { PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
    pluginLoaded: (pluginName: string) => void;
    prisma: PrismaClient;
    auth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
