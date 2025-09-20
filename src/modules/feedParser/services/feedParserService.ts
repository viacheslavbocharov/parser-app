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

export type Upstream4xx = Error & {
  kind: "Upstream4xx";
  statusCode: number;
};

export function makeUpstream4xx(message: string, statusCode: number): Upstream4xx {
  const base = new Error(message);
  base.name = "Upstream4xx";
  const enriched = Object.assign(base, {
    kind: "Upstream4xx" as const,
    statusCode,
  });
  return enriched as Upstream4xx;
}

export function isUpstream4xx(e: unknown): e is Upstream4xx {
  if (!(e instanceof Error)) return false;
  const maybe = e as { kind?: unknown; statusCode?: unknown };
  return maybe.kind === "Upstream4xx" && typeof maybe.statusCode === "number";
}

function extract4xx(err: unknown): number | null {
  if (hasStatusCode(err) && err.statusCode >= 400 && err.statusCode < 500) {
    return err.statusCode;
  }
  if (err instanceof Error && err.message) {
    const m = err.message.match(/\b(4\d{2})\b/);
    if (m) return Number(m[1]);
  }
  return null;
}

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
          bail(makeUpstream4xx(`Upstream ${s}`, s));
        }
        throw err instanceof Error ? err : new Error("Unknown error");
      }
    },
    { retries: 3, factor: 2 },
  );
}
