import type { FromSchema } from "json-schema-to-ts";

export const EnvSchema = {
  type: "object",
  properties: {
    NODE_ENV: {
      type: "string",
      enum: ["development", "test", "production"],
      default: "development",
    },
    PORT: { type: "number" },
    HOST: { type: "string" },
    DEFAULT_FEED_URL: { type: "string", format: "uri", minLength: 1 },
    JWT_SECRET: { type: "string", minLength: 1, default: "dev-secret" },
    JWT_EXPIRES_IN: { type: "string", minLength: 1, default: "7d" },
  },
  required: ["PORT", "HOST", "DEFAULT_FEED_URL"],
  additionalProperties: false,
} as const;

export type Config = FromSchema<typeof EnvSchema>;
