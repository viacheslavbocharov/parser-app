import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fp from "fastify-plugin";

export default fp(
  async (fastify) => {
    await fastify.register(swagger, {
      openapi: {
        info: { title: "Parser API", version: "1.0.0" },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    });

    await fastify.register(swaggerUI, { routePrefix: "/docs" });
    fastify.pluginLoaded("swagger-plugin");
  },
  { name: "swagger-plugin" },
);

