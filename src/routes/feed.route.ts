import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { schema } from "../modules/feedParser/schemas/getFeedData.schema";
import { parseFeed, Upstream4xxError } from "../modules/feedParser/services/feedParserService";
import { getFeedCacheByUrl, getLatestItems } from "../services/dbService";

export default fp(async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  r.get("/feed", { schema }, async (req, reply) => {
    try {
      const q = req.query as { url?: string; force?: "0" | "1" };

      const envDefault = app.config.DEFAULT_FEED_URL ?? process.env.DEFAULT_FEED_URL;
      const url = q.url ?? envDefault;
      if (!url) return reply.badRequest("url is required or DEFAULT_FEED_URL must be set");
      const _force = q.force === "1";

      if (!_force) {
        const cache = await getFeedCacheByUrl(app.prisma, url);
        if (cache) {
          const cachedItems = await getLatestItems(app.prisma, url, 50);
          return reply.send({
            sourceUrl: url,
            title: cache.title ?? "",
            itemsCount: cachedItems.length,
            items: cachedItems.map((i) => ({
              guid: i.guid ?? "",
              title: i.title ?? "",
              link: i.link ?? "",
              isoDate: i.isoDate ? i.isoDate.toISOString() : null,
            })),
          });
        }
      }

      // пример финала: (упрощённо)
      const { title, items } = await parseFeed(url);
      const responseItems = items.map((i) => ({
        guid: i.guid,
        title: i.title,
        link: i.link,
        isoDate: i.isoDate ? i.isoDate.toISOString() : null,
      }));
      return reply.send({
        sourceUrl: url,
        title,
        itemsCount: responseItems.length,
        items: responseItems,
      });
    } catch (err) {
      const e = err as { code?: string; message?: string };

      if (err instanceof Upstream4xxError) {
        // входные данные пользователя привели к 4xx у источника → 400
        return reply.badRequest(e.message || "Upstream 4xx");
      }
      if (e.code === "ENOTFOUND" || e.code === "ECONNREFUSED" || e.code === "ECONNRESET") {
        return reply.badGateway(e.message || "Upstream network error");
      }
      if (e.code === "ETIMEDOUT" || e.code === "UND_ERR_ABORTED") {
        return reply.gatewayTimeout(e.message || "Upstream timeout");
      }
      // остальное — 500
      return reply.internalServerError(e.message || "Internal error");
    }
  });

  app.pluginLoaded("feed-routes");
});
