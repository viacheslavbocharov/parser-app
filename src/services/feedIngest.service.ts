import type { FastifyInstance } from "fastify";
import { parseFeed } from "../modules/feedParser/services/feedParserService";
import { bulkUpsertFeedItems, upsertFeedCache } from "./dbService";

type MappedItem = {
  guid: string;
  title: string;
  link: string;
  isoDate: string | null;
};

export async function ingestFeeds(fastify: FastifyInstance, urls: readonly string[]): Promise<void> {
  for (const url of urls) {
    try {
      const { title, items } = await parseFeed(url);

      const mapped: MappedItem[] = items.map((i) => ({
        guid: i.guid ?? i.link ?? "",
        title: i.title ?? "",
        link: i.link ?? "",
        isoDate: i.isoDate ? i.isoDate.toISOString() : null,
      }));

      await upsertFeedCache(fastify.prisma, {
        url,
        title,
        itemsCount: mapped.length,
      });

      const { created } = await bulkUpsertFeedItems(fastify.prisma, url, mapped);

      fastify.log.info({ url, title, total: mapped.length, created }, "✅ cron-feed: feed stored");
    } catch (err) {
      fastify.log.error({ err, url }, "❌ cron-feed: failed to ingest feed");
    }
  }
}
