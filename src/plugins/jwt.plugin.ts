// import fastifyJwt from "@fastify/jwt";
// import type { FastifyInstance } from "fastify";
// import fp from "fastify-plugin";

// export default fp(async (app: FastifyInstance) => {
//   app.register(fastifyJwt, {
//     secret: app.config.JWT_SECRET || "dev-secret",
//     sign: { expiresIn: app.config.JWT_EXPIRES_IN || "7d" },
//   });

//   app.decorate("auth", async (req, reply) => {
//     try {
//       await req.jwtVerify();
//     } catch {
//       return reply.unauthorized("Invalid or missing token");
//     }
//   });

//   app.pluginLoaded("jwt-plugin");
// });

import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "dev-secret",
    cookie: { cookieName: "token", signed: false }, // читаем токен из cookie 'token'
  });

  // auth-декоратор
  app.decorate("auth", async (req, reply) => {
    try {
      await req.jwtVerify(); // fastify-jwt сам посмотрит в cookie (и header)
    } catch {
      return reply.unauthorized("Invalid or missing token");
    }
  });

  app.pluginLoaded("jwt-plugin");
});
