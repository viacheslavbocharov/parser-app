import fp from "fastify-plugin";

export default fp(async (app) => {
  app.setErrorHandler((err, _req, reply) => {
    const isDev = app.config.NODE_ENV === "development";
    const code = (err as { code?: string }).code ?? "INTERNAL";

    const statusCode =
      code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ECONNRESET" ? 502 :
      code === "ETIMEDOUT" || code === "UND_ERR_ABORTED" ? 504 :
      /* isUpstream4xx(err) ? 400 : */ 500;

    reply.status(statusCode).send({
      statusCode,
      code,
      message: isDev ? (err as Error).message : "Internal error",
    });
  });
});

