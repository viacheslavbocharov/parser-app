// import Fastify, {FastifyServerOptions} from "fastify";
// import {join} from "node:path";
// import AutoLoad from "@fastify/autoload";
// import configPlugin from "./config";

// export type AppOptions = Partial<FastifyServerOptions>

// async function buildApp(options: AppOptions = {}){

//   const fastify = Fastify()
//     await  fastify.register(configPlugin)

//     try {
//         fastify.decorate("pluginLoaded", (pluginName: string) => {
//             fastify.log.info(`✅ Plugin loaded: ${pluginName}`);
//         });

//         fastify.log.info("Starting to load plugins");
//         await fastify.register(AutoLoad, {
//             dir: join(__dirname, "plugins"),
//             options: options,
//             ignorePattern: /^((?!plugin).)*$/,
//         });

//         fastify.log.info("✅ Plugins loaded successfully");
//     } catch (error) {
//         fastify.log.error("Error in autoload:", error);
//         throw error;
//     }

//     fastify.get("/", async (request, reply) => {
//         return {hello: "world"}
//     })

//     return fastify
// }

import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
// export default buildApp
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config";
import { getFeedDataRoutes } from "./modules/feedParser/routes/feedParser.route";

export type AppOptions = Partial<FastifyServerOptions>;

async function buildApp(options: AppOptions = {}) {
  const fastify = Fastify({ logger: true });
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
  } catch (error) {
    fastify.log.error("Error in autoload:", error);
    throw error;
  }

  fastify.get("/", async (_request, _reply) => {
    return { hello: "world" };
  });

  fastify.register(getFeedDataRoutes);

  return fastify;
}

export default buildApp;
