import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { schema } from '../schemas/getFeedData.schema';
import { parseFeed, isUpstream4xx } from '../services/feedParserService';
import { getFeedCacheByUrl, getLatestItems } from '../../../services/dbService';

export default fp(async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  r.get('/feed', { schema }, async (req, reply) => {
    try {
      const q = req.query as { url?: string; force?: '0' | '1' };

      const url = q.url ?? app.config.DEFAULT_FEED_URL;
      if (!url)
        return reply.badRequest(
          'url is required or DEFAULT_FEED_URL must be set'
        );
      const _force = q.force === '1';

      if (!_force) {
        const cache = await getFeedCacheByUrl(app.prisma, url);
        if (cache) {
          const cachedItems = await getLatestItems(app.prisma, url, 50);
          return reply.send({
            sourceUrl: url,
            title: cache.title ?? '',
            itemsCount: cachedItems.length,
            items: cachedItems.map((i) => ({
              guid: i.guid ?? '',
              title: i.title ?? '',
              link: i.link ?? '',
              isoDate: i.isoDate ? i.isoDate.toISOString() : null,
            })),
          });
        }
      }

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

      if (isUpstream4xx(err)) {
        return reply.badRequest(e.message || 'Upstream 4xx');
      }
      if (
        e.code === 'ENOTFOUND' ||
        e.code === 'ECONNREFUSED' ||
        e.code === 'ECONNRESET'
      ) {
        return reply.badGateway(e.message || 'Upstream network error');
      }
      if (e.code === 'ETIMEDOUT' || e.code === 'UND_ERR_ABORTED') {
        return reply.gatewayTimeout(e.message || 'Upstream timeout');
      }
      return reply.internalServerError(e.message || 'Internal error');
    }
  });

  app.pluginLoaded('feed-routes');
});
