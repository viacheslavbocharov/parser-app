export const schema = {
  tags: ["feed"],
  summary: "Get feed data",
  description: "Parse RSS feed (optionally force refresh)",
  querystring: {
    type: "object",
    properties: {
      url: { type: "string", format: "uri", nullable: true },
      force: { type: "string", enum: ["0", "1"], default: "0" },
    },
  },
  response: {
    200: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceUrl: { type: "string" },
        title: { type: "string" },
        itemsCount: { type: "number" },
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              guid: { type: "string" },
              title: { type: "string" },
              link: { type: "string" },
              isoDate: { type: ["string", "null"], format: "date-time" },
            },
            required: ["guid", "title", "link"],
          },
        },
      },
      required: ["sourceUrl", "title", "itemsCount", "items"],
    },
  },
} as const;
