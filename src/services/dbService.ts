import type { PrismaClient } from "@prisma/client";

// ── type guards ────────────────────────────────────────────────────────────────
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function _hasStringMessage(err: unknown): err is { message: string } {
  return isRecord(err) && typeof err.message === "string";
}
function _isString(v: unknown): v is string {
  return typeof v === "string";
}

// ── cache ─────────────────────────────────────────────────────────────────────
export async function getFeedCacheByUrl(prisma: PrismaClient, url: string) {
  return prisma.feedCache.findUnique({ where: { url } });
}

export async function upsertFeedCache(
  prisma: PrismaClient,
  data: { url: string; title?: string | null; itemsCount: number },
) {
  return prisma.feedCache.upsert({
    where: { url: data.url },
    update: { ...data, fetchedAt: new Date() },
    create: { ...data },
  });
}

// ── items ─────────────────────────────────────────────────────────────────────
export async function bulkUpsertFeedItems(
  prisma: PrismaClient,
  url: string,
  items: Array<{ guid: string; title: string; link: string; isoDate: string | null }>,
) {
  const guids = items.map((i) => i.guid).filter((g): g is string => typeof g === "string");
  const existing = await prisma.feedItem.findMany({
    where: { url, guid: { in: guids } },
    select: { guid: true },
  });
  const existingSet = new Set(
    existing.map((e) => e.guid).filter((g): g is string => typeof g === "string"),
  );
  const toCreate = items.filter((i) => !i.guid || !existingSet.has(i.guid));

  let created = 0;
  for (const i of toCreate) {
    try {
      await prisma.feedItem.create({
        data: {
          url,
          guid: i.guid || null,
          title: i.title,
          link: i.link,
          isoDate: i.isoDate ? new Date(i.isoDate) : null,
        },
      });
      created++;
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string" &&
        (err as { message: string }).message.includes("E11000")
      ) {
        // дубликат — игнорируем
      } else {
        throw err instanceof Error ? err : new Error("create failed");
      }
    }
  }

  return { created };
}

export async function getLatestItems(prisma: PrismaClient, url: string, take = 50) {
  return prisma.feedItem.findMany({
    where: { url },
    orderBy: { isoDate: "desc" },
    take,
  });
}
