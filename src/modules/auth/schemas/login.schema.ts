import { errorSchema } from "./error.schema";

export const loginSchema = {
  tags: ["auth"],
  summary: "Login user",
  body: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6, maxLength: 100 },
    },
  },
  response: {
    200: {
      type: "object",
      additionalProperties: false,
      properties: { accessToken: { type: "string" } },
      required: ["accessToken"],
    },
    401: errorSchema,
    500: errorSchema,
  },
} as const;
