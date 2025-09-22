import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "dev-secret",
    cookie: { cookieName: "token", signed: false },
  });

  app.decorate("auth", async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.unauthorized("Invalid or missing token");
    }
  });

  app.pluginLoaded("jwt-plugin");
});
