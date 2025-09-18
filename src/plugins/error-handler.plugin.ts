import fp from "fastify-plugin";

export default fp(
  async (fastify) => {
    fastify.setErrorHandler((err, _req, reply) => {
      const statusCode = (err.statusCode as number) || 500;
      fastify.log.error({ err }, "request error");
      reply.status(statusCode).send({
        statusCode,
        code: err.code || "INTERNAL",
        message: process.env.NODE_ENV === "development" ? err.message : "Internal error",
      });
    });
    fastify.pluginLoaded("error-handler-plugin");
  },
  { name: "error-handler-plugin" },
);
