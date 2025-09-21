import type { FromSchema } from "json-schema-to-ts";

export const errorSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    code: { type: "string" },
  },
  required: ["message"],
} as const;

export const getArticleSchema = {
  tags: ["article"],
  summary: "Parse article by URL (preset: theregister.com)",
  querystring: {
    type: "object",
    required: ["url"],
    additionalProperties: false,
    properties: {
      url: { type: "string", format: "uri" },
    },
  },
  response: {
    200: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceUrl: { type: "string" },
        title: { type: ["string", "null"] },
        publishedAt: { type: ["string", "null"], format: "date-time" },
        author: { type: ["string", "null"] },
        heroImage: { type: ["string", "null"] },
        paragraphs: { type: "array", items: { type: "string" } },
        text: { type: "string" },          
        images: { type: "array", items: { type: "string" } },
      },
      required: ["sourceUrl", "title", "paragraphs", "text", "images"], 
    },
    400: errorSchema,
    502: errorSchema,
    504: errorSchema,
    500: errorSchema,
  },
} as const;

export type GetArticleQuery = FromSchema<typeof getArticleSchema.querystring>;
export type Article200 = FromSchema<(typeof getArticleSchema.response)[200]>;
export type ErrorResponse = FromSchema<typeof errorSchema>;
