// import fp from "fastify-plugin";

// export default fp(async (app) => {
//   app.setErrorHandler((err, _req, reply) => {
//     const isDev = app.config.NODE_ENV === "development";
//     const code = (err as { code?: string }).code ?? "INTERNAL";

//     const statusCode =
//       code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ECONNRESET"
//         ? 502
//         : code === "ETIMEDOUT" || code === "UND_ERR_ABORTED"
//           ? 504
//           : /* isUpstream4xx(err) ? 400 : */ 500;

//     reply.status(statusCode).send({
//       statusCode,
//       code,
//       message: isDev ? (err as Error).message : "Internal error",
//     });
//   });
// });

// import fp from 'fastify-plugin';
// import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

// export default fp(async (app) => {
//   app.setErrorHandler(
//     (err: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
//       const isDev = app.config.NODE_ENV === 'development';

//       let statusCode: number | undefined = err.statusCode;
//       let code: string | undefined = err.code;

//       // fastify-jwt ошибки → 401
//       if (
//         !statusCode &&
//         typeof code === 'string' &&
//         code.startsWith('FST_JWT_')
//       ) {
//         statusCode = 401;
//         code = 'UNAUTHORIZED';
//       }

//       // явное сообщение "Invalid or missing token" → 401
//       if (!statusCode && /invalid or missing token/i.test(err.message)) {
//         statusCode = 401;
//         code = 'UNAUTHORIZED';
//       }

//       // fastify-схема валидации → 400
//       if (!statusCode && (err as { validation?: unknown }).validation) {
//         statusCode = 400;
//         code = 'BAD_REQUEST';
//       }

//       // сетевые ошибки → 502/504
//       if (!statusCode) {
//         switch (err.code) {
//           case 'ENOTFOUND':
//           case 'ECONNREFUSED':
//           case 'ECONNRESET':
//             statusCode = 502;
//             break;
//           case 'ETIMEDOUT':
//           case 'UND_ERR_ABORTED':
//             statusCode = 504;
//             break;
//           default:
//             statusCode = 500;
//         }
//       }

//       reply.status(statusCode).send({
//         statusCode,
//         code: code ?? 'INTERNAL',
//         message: isDev ? err.message : 'Internal error',
//       });
//     }
//   );
// });

import fp from "fastify-plugin";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export default fp(async (app) => {
  app.setErrorHandler((err: FastifyError, _req: FastifyRequest, reply: FastifyReply) => {
    const isDev = app.config.NODE_ENV === "development";

    // базовые поля
    let statusCode: number =
      typeof err.statusCode === "number" ? err.statusCode : Number.NaN;
    let code: string | undefined = err.code;

    // 1) fastify-jwt: их коды начинаются с FST_JWT_
    if (!Number.isFinite(statusCode) && typeof err.code === "string" && err.code.startsWith("FST_JWT_")) {
      statusCode = 401;
    }

    // 2) наше сообщение из preHandler (reply.unauthorized("Invalid or missing token"))
    //    даже если статус уже 401 — проставим человекочитаемый code
    if (/invalid or missing token/i.test(err.message)) {
      statusCode = 401;
      code = "UNAUTHORIZED";
    }

    // 3) fastify валидация схемы
    if (!Number.isFinite(statusCode) && (err as { validation?: unknown }).validation) {
      statusCode = 400;
    }

    // 4) сетевые ошибки
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

    // 5) осмысленные коды по умолчанию, если code не задан
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
