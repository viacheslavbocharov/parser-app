import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";

export type AppOptions = Partial<FastifyServerOptions>;

async function buildApp(options: AppOptions = {}) {
  const isDev = process.env.NODE_ENV !== "production";

  const fastify = Fastify({
    logger: isDev
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "yyyy-mm-dd HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        }
      : true,
  });

  await fastify.register(configPlugin);

  try {
    fastify.decorate("pluginLoaded", (pluginName: string) => {
      fastify.log.info(`✅ Plugin loaded: ${pluginName}`);
    });

    fastify.log.info("Starting to load plugins");
    await fastify.register(AutoLoad, {
      dir: join(__dirname, "plugins"),
      options: options,
      ignorePattern: /^((?!plugin).)*$/,
    });
    fastify.log.info("✅ Plugins loaded successfully");

    fastify.log.info("Starting to load plugins");
    await fastify.register(AutoLoad, {
      dir: join(__dirname, "routes"),
      options: options,
      ignorePattern: /(^|[\\/])(?![^\\/]*\.route\.)[^\\/]+\.[^\\/]+$/,
    });

    fastify.log.info("Starting to load routes");
    await fastify.register(AutoLoad, {
      dir: join(__dirname, "modules"),
      maxDepth: 8,
      options,
      ignorePattern: /(^|[\\/])(?![^\\/]*\.route\.)[^\\/]+\.[^\\/]+$/,
    });
    fastify.log.info("✅ Routes loaded successfully");
  } catch (error) {
    fastify.log.error("Error in autoload:", error);
    throw error;
  }

  fastify.get("/", async (_request, _reply) => {
    return { hello: "world" };
  });

  return fastify;
}

export default buildApp;
