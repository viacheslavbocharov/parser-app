import type { PrismaClient } from "@prisma/client";
import { getFeedCacheByUrl, getLatestItems } from "../../../services/dbService";
import type { FeedResponse } from "../schemas/getFeedData.schema";
import { parseFeed } from "./feedParserService";

export async function getFeedResponse(
  prisma: PrismaClient,
  url: string,
  force: boolean,
): Promise<FeedResponse> {
  if (!force) {
    const cache = await getFeedCacheByUrl(prisma, url);
    if (cache) {
      const cachedItems = await getLatestItems(prisma, url, 50);
      return {
        sourceUrl: url,
        title: cache.title ?? "",
        itemsCount: cachedItems.length,
        items: cachedItems.map((i) => ({
          guid: i.guid ?? "",
          title: i.title ?? "",
          link: i.link ?? "",
          isoDate: i.isoDate ? i.isoDate.toISOString() : null,
        })),
      };
    }
  }

  const { title, items } = await parseFeed(url);
  const responseItems = items.map((i) => ({
    guid: i.guid,
    title: i.title,
    link: i.link,
    isoDate: i.isoDate ? i.isoDate.toISOString() : null,
  }));

  return {
    sourceUrl: url,
    title,
    itemsCount: responseItems.length,
    items: responseItems,
  };
}
