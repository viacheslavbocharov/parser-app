import { errorSchema } from "./error.schema";

export const registerSchema = {
  tags: ["auth"],
  summary: "Register user",
  body: {
    type: "object",
    required: ["name", "email", "password"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6, maxLength: 100 },
    },
  },
  response: {
    201: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
      },
      required: ["id", "name", "email"],
    },
    409: errorSchema,
    500: errorSchema,
  },
} as const;
