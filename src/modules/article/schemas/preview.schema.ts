export const previewSchema = {
  tags: ["article"],
  summary: "Get article preview (public)",
  querystring: {
    type: "object",
    required: ["url"],
    properties: { url: { type: "string", format: "uri" } },
  },
  response: {
    200: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceUrl: { type: "string" },
        title: { type: ["string", "null"] },
        author: { type: ["string", "null"] },
        publishedAt: { type: ["string", "null"] },
        heroImage: { type: ["string", "null"] },
      },
      required: ["sourceUrl"],
    },
  },
} as const;
export type ArticlePreviewResponse = {
  sourceUrl: string;
  title: string | null;
  author: string | null;
  publishedAt: string | null;
  heroImage: string | null;
};
