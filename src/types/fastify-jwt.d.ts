import "@fastify/jwt";
import "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string };
    user: { sub: string; email: string; iat: number; exp: number };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user: import("@fastify/jwt").FastifyJWT["user"];
  }
}
