import type { FastifyInstance } from "fastify";
import fastifyCron from "fastify-cron";
import fp from "fastify-plugin";
import type { Config } from "../config/schema";
import { parseFeed } from "../modules/feedParser/services/feedParserService";
import { bulkUpsertFeedItems, upsertFeedCache } from "../services/dbService";

export default fp(async function cronFeedPlugin(app: FastifyInstance) {
  const config = app.config as Config;

  const enabled = config.CRON_ENABLED !== "0";
  if (!enabled) {
    app.log.info("⏸️ cron-feed: disabled via CRON_ENABLED=0");
    app.pluginLoaded("cron-feed-plugin");
    return;
  }

  const urls =
    config.FEED_URLS && config.FEED_URLS.trim().length > 0
      ? config.FEED_URLS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : config.DEFAULT_FEED_URL
        ? [config.DEFAULT_FEED_URL]
        : [];

  if (urls.length === 0) {
    app.log.warn("cron-feed: no feed URLs found (FEED_URLS/DEFAULT_FEED_URL). Skipping.");
    app.pluginLoaded("cron-feed-plugin");
    return;
  }

  const cronTime = config.FEED_CRON || "*/10 * * * *";

  await app.register(fastifyCron, {
    jobs: [
      {
        cronTime,
        onTick: async (server: FastifyInstance) => {
          server.log.info({ urls }, "⏰ cron-feed tick: fetching feeds");

          for (const url of urls) {
            try {
              const { title, items } = await parseFeed(url);

              const mapped = items.map((i) => ({
                guid: i.guid ?? i.link ?? "",
                title: i.title ?? "",
                link: i.link ?? "",
                isoDate: i.isoDate ? i.isoDate.toISOString() : null,
              }));

              await upsertFeedCache(server.prisma, {
                url,
                title,
                itemsCount: mapped.length,
              });

              const { created } = await bulkUpsertFeedItems(server.prisma, url, mapped);

              server.log.info(
                { url, title, total: mapped.length, created },
                "✅ cron-feed: feed stored",
              );
            } catch (err) {
              server.log.error({ err, url }, "❌ cron-feed: failed to fetch/store feed");
            }
          }
        },
        startWhenReady: true,
        runOnInit: true, // один раз при старте
        timeZone: "UTC",
      },
    ],
  });

  app.pluginLoaded("cron-feed-plugin");
});
