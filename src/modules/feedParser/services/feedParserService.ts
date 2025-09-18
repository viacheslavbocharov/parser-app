/// <reference path="../../../types/async-retry.d.ts" />

import retry, { type Bail } from "async-retry";
import Parser from "rss-parser";
import { hasStatusCode } from "../utils/typeGuards";

type FeedItem = {
  guid?: string;
  link?: string;
  title?: string;
  isoDate?: string;
};

const parser = new Parser<unknown, FeedItem>();

export async function parseFeed(url: string) {
  return retry(
    async (bail: Bail) => {
      try {
        const feed = await parser.parseURL(url);
        const items = (feed.items ?? []).map((i) => ({
          guid: i.guid ?? i.link ?? "",
          title: i.title ?? "",
          link: i.link ?? "",
          isoDate: i.isoDate ? new Date(i.isoDate) : undefined,
        }));
        return { title: feed.title ?? "", items };
      } catch (err: unknown) {
        if (hasStatusCode(err) && err.statusCode >= 400 && err.statusCode < 500) {
          bail(err instanceof Error ? err : new Error("Client error"));
        }
        throw err instanceof Error ? err : new Error("Unknown error");
      }
    },
    { retries: 3, factor: 2 },
  );
}
