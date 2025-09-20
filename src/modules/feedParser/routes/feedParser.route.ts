import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { schema } from "../schemas/getFeedData.schema";
import { isUpstream4xx } from "../services/feedParserService";
import { getFeedResponse } from "../services/getFeedResponse.service";

export default fp(async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  r.get("/feed", { schema }, async (req, reply) => {
    try {
      const q = req.query as { url?: string; force?: "0" | "1" };
      const url = q.url ?? app.config.DEFAULT_FEED_URL;
      if (!url) return reply.badRequest("url is required or DEFAULT_FEED_URL must be set");

      const data = await getFeedResponse(app, url, q.force === "1");
      return reply.send(data);
    } catch (err) {
      req.log.error({ err, query: req.query }, "feed route failed");
      const e = err as { code?: string; message?: string };

      if (isUpstream4xx(err)) return reply.badRequest(e.message || "Upstream 4xx");
      if (e.code === "ENOTFOUND" || e.code === "ECONNREFUSED" || e.code === "ECONNRESET") {
        return reply.badGateway(e.message || "Upstream network error");
      }
      if (e.code === "ETIMEDOUT" || e.code === "UND_ERR_ABORTED") {
        return reply.gatewayTimeout(e.message || "Upstream timeout");
      }
      return reply.internalServerError(e.message || "Internal error");
    }
  });

  app.pluginLoaded("feed-routes");
});
