import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { getArticleSchema, type GetArticleQuery } from "../schemas/getArticle.schema";
import { getArticleResponse } from "../services/getArticleResponse.service";
import { HttpError } from "../../auth/services/errors";

export default fp(async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  r.get("/article", 
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
  });

  app.pluginLoaded("article-routes");
});
