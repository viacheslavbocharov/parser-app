import cookie from "@fastify/cookie";
import fp from "fastify-plugin";

export default fp(async (app) => {
  await app.register(cookie, {
    // секрет для подписанных кук, если нужно: secret: app.config.COOKIE_SECRET
  });
  app.pluginLoaded("cookie-plugin");
});
