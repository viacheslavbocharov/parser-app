import type { FromSchema } from "json-schema-to-ts";

export const schema = {
  tags: ["feed"],
  summary: "Get feed data",
  description: "Parse RSS feed (optionally force refresh)",

  querystring: {
    type: "object",
    properties: {
      url: { type: "string", format: "uri" },
      force: { type: "string", enum: ["0", "1"], default: "0" },
    },
    additionalProperties: false,
  },

  response: {
    200: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceUrl: { type: "string" },
        title: { type: "string" },
        itemsCount: { type: "integer" },
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              guid: { type: "string" },
              title: { type: "string" },
              link: { type: "string" },
              isoDate: {
                anyOf: [{ type: "string", format: "date-time" }, { type: "null" }],
              },
            },
            required: ["guid", "title", "link"],
          },
        },
      },
      required: ["sourceUrl", "title", "itemsCount", "items"],
    },
  },
} as const;

export type FeedResponse = FromSchema<(typeof schema.response)[200]>;
