/// <reference path="../../../types/async-retry.d.ts" />

// import retry, { type Bail } from "async-retry";
// import Parser from "rss-parser";
// import { hasStatusCode } from "../utils/typeGuards";

// type FeedItem = {
//   guid?: string;
//   link?: string;
//   title?: string;
//   isoDate?: string;
// };

// const parser = new Parser<unknown, FeedItem>();

// export async function parseFeed(url: string) {
//   return retry(
//     async (bail: Bail) => {
//       try {
//         const feed = await parser.parseURL(url);
//         const items = (feed.items ?? []).map((i) => ({
//           guid: i.guid ?? i.link ?? "",
//           title: i.title ?? "",
//           link: i.link ?? "",
//           isoDate: i.isoDate ? new Date(i.isoDate) : undefined,
//         }));
//         return { title: feed.title ?? "", items };
//       } catch (err: unknown) {
//         if (hasStatusCode(err) && err.statusCode >= 400 && err.statusCode < 500) {
//           bail(err instanceof Error ? err : new Error("Client error"));
//         }
//         throw err instanceof Error ? err : new Error("Unknown error");
//       }
//     },
//     { retries: 3, factor: 2 },
//   );
// }

import retry, { type Bail } from "async-retry";
import Parser from "rss-parser";
import { hasStatusCode } from "../utils/typeGuards";

// ⬇️ новый класс — чтобы в роуте легко различать 4xx
export class Upstream4xxError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "Upstream4xxError";
  }
}

function extract4xx(err: unknown): number | null {
  if (hasStatusCode(err) && err.statusCode >= 400 && err.statusCode < 500) {
    return err.statusCode;
  }
  if (err instanceof Error && err.message) {
    // ловим "Status code 404" или просто "... 404 ..."
    const m = err.message.match(/\b(4\d{2})\b/);
    if (m) return Number(m[1]);
  }
  return null;
}

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
        const s = extract4xx(err);
        if (s) {
          // ⬇️ bail: не ретраим 4xx
          bail(new Upstream4xxError(`Upstream ${s}`, s));
        }
        // остальное — пусть ретраится/падает как раньше
        throw err instanceof Error ? err : new Error("Unknown error");
      }
    },
    { retries: 3, factor: 2 /*, onRetry: (e,a)=>console.warn('retry',a,e)*/ },
  );
}
