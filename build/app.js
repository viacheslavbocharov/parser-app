"use strict";
// import Fastify, {FastifyServerOptions} from "fastify";
// import {join} from "node:path";
// import AutoLoad from "@fastify/autoload";
// import configPlugin from "./config";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const node_path_1 = require("node:path");
const autoload_1 = __importDefault(require("@fastify/autoload"));
// export default buildApp
const fastify_1 = __importDefault(require("fastify"));
const config_1 = __importDefault(require("./config"));
const feedParser_route_1 = require("./modules/feedParser/routes/feedParser.route");
async function buildApp(options = {}) {
    const fastify = (0, fastify_1.default)({ logger: true });
    await fastify.register(config_1.default);
    try {
        fastify.decorate("pluginLoaded", (pluginName) => {
            fastify.log.info(`✅ Plugin loaded: ${pluginName}`);
        });
        fastify.log.info("Starting to load plugins");
        await fastify.register(autoload_1.default, {
            dir: (0, node_path_1.join)(__dirname, "plugins"),
            options: options,
            ignorePattern: /^((?!plugin).)*$/,
        });
        fastify.log.info("✅ Plugins loaded successfully");
    }
    catch (error) {
        fastify.log.error("Error in autoload:", error);
        throw error;
    }
    fastify.get("/", async (_request, _reply) => {
        return { hello: "world" };
    });
    fastify.register(feedParser_route_1.getFeedDataRoutes);
    return fastify;
}
exports.default = buildApp;
