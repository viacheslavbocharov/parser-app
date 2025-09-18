import type { FromSchema } from "json-schema-to-ts";

export const EnvSchema = {
  type: "object",
  properties: {
    PORT: { type: "number" },
    HOST: { type: "string" },
    DEFAULT_FEED_URL: { type: "string", nullable: true },
  },
  required: ["PORT", "HOST"],
  additionalProperties: false,
} as const;

export type Config = FromSchema<typeof EnvSchema>;
