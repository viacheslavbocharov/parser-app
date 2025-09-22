import type { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { loginSchema } from "../schemas/login.schema";
import { meSchema } from "../schemas/me.schema";
import { registerSchema } from "../schemas/register.schema";
import { verifyCredentials } from "../services/login.service";
import { getMe } from "../services/me.service";
import { registerUser } from "../services/register.service";

export default fp(async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<JsonSchemaToTsProvider>();

  // r.post("/auth/register", { schema: registerSchema }, async (req, reply) => {
  //   try {
  //     const { name, email, password } = req.body as {
  //       name: string;
  //       email: string;
  //       password: string;
  //     };

  //     const dto = await registerUser(app.prisma, { name, email, password });
  //     return reply.code(201).send(dto);
  //   } catch (err) {
  //     const e = err as { statusCode?: number; code?: string; message?: string; name?: string };
  //     req.log.error({ err, body: req.body }, "register route failed");

  //     if (e?.statusCode === 409 || e?.code === "CONFLICT" || e?.name === "HttpError") {
  //       return reply
  //         .status(409)
  //         .send({ message: e?.message ?? "Email already registered", code: "CONFLICT" });
  //     }

  //     return reply.internalServerError("Internal error");
  //   }
  // });

  r.post("/auth/register", { schema: registerSchema }, async (req, reply) => {
    try {
      const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
      };

      const dto = await registerUser(app.prisma, { name, email, password });

      const accessToken = await reply.jwtSign(
        { sub: dto.id, email: dto.email },
        { expiresIn: "7d" },
      );

      reply.setCookie("token", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: app.config.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return reply.code(201).send(dto);
    } catch (err) {
      const e = err as { statusCode?: number; code?: string; message?: string; name?: string };
      req.log.error({ err, body: req.body }, "register route failed");

      if (e?.statusCode === 409 || e?.code === "CONFLICT" || e?.name === "HttpError") {
        return reply
          .status(409)
          .send({ message: e?.message ?? "Email already registered", code: "CONFLICT" });
      }

      return reply.internalServerError("Internal error");
    }
  });

  // r.post("/auth/login", { schema: loginSchema }, async (req, reply) => {
  //   try {
  //     const { email, password } = req.body as {
  //       email: string;
  //       password: string;
  //     };
  //     const payload = await verifyCredentials(app.prisma, { email, password });
  //     const accessToken = await reply.jwtSign(payload);
  //     return reply.send({ accessToken });
  //   } catch (err) {
  //     const e = err as { statusCode?: number; code?: string; message?: string; name?: string };
  //     req.log.error({ err, body: req.body }, "login route failed");

  //     if (e?.statusCode === 401 || e?.code === "UNAUTHORIZED" || e?.name === "HttpError") {
  //       return reply
  //         .status(401)
  //         .send({ message: e?.message ?? "Invalid credentials", code: "UNAUTHORIZED" });
  //     }
  //     return reply.internalServerError("Internal error");
  //   }
  // });
  r.post("/auth/login", { schema: loginSchema }, async (req, reply) => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const payload = await verifyCredentials(app.prisma, { email, password });
      const accessToken = await reply.jwtSign(payload, { expiresIn: "7d" });

      reply.setCookie("token", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return reply.send({ accessToken });
    } catch (err) {
      const e = err as { statusCode?: number; code?: string; message?: string; name?: string };
      req.log.error({ err, body: req.body }, "login route failed");

      if (e?.statusCode === 401 || e?.code === "UNAUTHORIZED" || e?.name === "HttpError") {
        return reply
          .status(401)
          .send({ message: e?.message ?? "Invalid credentials", code: "UNAUTHORIZED" });
      }
      return reply.internalServerError("Internal error");
    }
  });

  r.get(
    "/me",
    { schema: meSchema, preHandler: [app.auth] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = await getMe(app.prisma, req.user.sub);
        return reply.send(data);
      } catch (err) {
        req.log.error({ err }, "me route failed");
        return reply.internalServerError("Internal error");
      }
    },
  );

  r.post("/auth/logout", async (_req, reply) => {
    reply.clearCookie("token", { path: "/" });
    return reply.send({ ok: true });
  });

  app.pluginLoaded("auth-routes");
});
