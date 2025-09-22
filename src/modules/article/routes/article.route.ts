import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { HttpError } from "../../auth/services/errors";
import { type GetArticleQuery, getArticleSchema } from "../schemas/getArticle.schema";
import { previewSchema } from "../schemas/preview.schema";
import { getArticlePreviewResponse } from "../services/getArticlePreviewResponse.service";
import { getArticleResponse } from "../services/getArticleResponse.service";

export default fp(async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  r.get(
    "/article",
    { schema: { ...getArticleSchema, security: [{ bearerAuth: [] }] }, preHandler: [app.auth] },
    async (req, reply) => {
      try {
        const { url } = req.query as GetArticleQuery;
        const dto = await getArticleResponse(url);
        return reply.send(dto);
      } catch (err) {
        const e = err as { statusCode?: number; message?: string; code?: string };
        req.log.error({ err, query: req.query }, "article route failed");

        if (err instanceof HttpError) {
          if (err.statusCode === 400) return reply.badRequest(e.message ?? "Bad request");
          if (err.statusCode === 502) return reply.badGateway(e.message ?? "Upstream error");
          if (err.statusCode === 504) return reply.gatewayTimeout(e.message ?? "Upstream timeout");
        }

        return reply.internalServerError("Internal error");
      }
    },
  );

  r.get("/article/preview", { schema: previewSchema }, async (req, reply) => {
    try {
      const { url } = req.query as { url: string };
      const data = await getArticlePreviewResponse(url);
      return reply.send(data);
    } catch (err) {
      req.log.error({ err, query: req.query }, "article preview failed");
      const e = err as { statusCode?: number; message?: string; code?: string };

      if (e?.statusCode === 400 || e?.code === "BAD_REQUEST") {
        return reply.badRequest(e?.message ?? "Bad request");
      }
      return reply.internalServerError("Internal error");
    }
  });

  app.pluginLoaded("article-routes");
});
