import type { FastifyInstance } from 'fastify';
import fastifyCron from 'fastify-cron';
import fp from 'fastify-plugin';
import type { Config } from '../config/schema';
import { ingestFeeds } from '../services/feedIngest.service';

export default fp(async function cronFeedPlugin(fastify: FastifyInstance) {
  const config = fastify.config as Config;

  const enabled = config.CRON_ENABLED !== '0';
  if (!enabled) {
    fastify.log.info('⏸️ cron-feed: disabled via CRON_ENABLED=0');
    fastify.pluginLoaded('cron-feed-plugin');
    return;
  }

  const urls =
    config.FEED_URLS && config.FEED_URLS.trim().length > 0
      ? config.FEED_URLS.split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : config.DEFAULT_FEED_URL
      ? [config.DEFAULT_FEED_URL]
      : [];

  if (urls.length === 0) {
    fastify.log.warn(
      'cron-feed: no feed URLs found (FEED_URLS/DEFAULT_FEED_URL). Skipping.'
    );
    fastify.pluginLoaded('cron-feed-plugin');
    return;
  }

  const cronTime = config.FEED_CRON || '*/10 * * * *';

  await fastify.register(fastifyCron, {
    jobs: [
      {
        cronTime,
        onTick: async () => {
          fastify.log.info({ urls }, '⏰ cron-feed tick');
          await ingestFeeds(fastify, urls);
        },
        startWhenReady: true,
        runOnInit: true,
        timeZone: 'UTC',
      },
    ],
  });

  fastify.pluginLoaded('cron-feed-plugin');
});
