import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyInstance } from 'fastify';
import { schema } from '../schemas/getFeedData.schema';
import { parseFeed } from '../services/feedParserService';

export async function getFeedDataRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  r.get('/feed', { schema }, async (req, reply) => {
    const q = req.query as { url?: string; force?: '0' | '1' };
    const url = q.url || process.env.DEFAULT_FEED_URL!;
    const force = q.force === '1';

    if (!url)
      return reply.badRequest(
        'url is required or DEFAULT_FEED_URL must be set'
      );

    // пока просто парсим (на следующем шаге добавим Prisma-кеш)
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
  });
}
