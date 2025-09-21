import fp from "fastify-plugin";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export default fp(async (app) => {
  app.setErrorHandler((err: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
    const isDev = app.config.NODE_ENV === "development";

    let statusCode: number =
      typeof err.statusCode === "number" ? err.statusCode : Number.NaN;
    let code: string | undefined = err.code;

    if (!Number.isFinite(statusCode) && typeof err.code === "string" && err.code.startsWith("FST_JWT_")) {
      statusCode = 401;
    }

    if (/invalid or missing token/i.test(err.message)) {
      statusCode = 401;
      code = "UNAUTHORIZED";
    }

    if (!Number.isFinite(statusCode) && (err as { validation?: unknown }).validation) {
      statusCode = 400;
    }

    if (!Number.isFinite(statusCode)) {
      switch (err.code) {
        case "ENOTFOUND":
        case "ECONNREFUSED":
        case "ECONNRESET":
          statusCode = 502;
          break;
        case "ETIMEDOUT":
        case "UND_ERR_ABORTED":
          statusCode = 504;
          break;
        default:
          statusCode = 500;
      }
    }

    if (!code) {
      switch (statusCode) {
        case 400:
          code = "BAD_REQUEST";
          break;
        case 401:
          code = "UNAUTHORIZED";
          break;
        case 409:
          code = "CONFLICT";
          break;
        case 502:
          code = "BAD_GATEWAY";
          break;
        case 504:
          code = "GATEWAY_TIMEOUT";
          break;
        default:
          code = "INTERNAL";
      }
    }

    reply.status(statusCode).send({
      statusCode,
      code,
      message: isDev ? err.message : "Internal error",
    });
  });
});
