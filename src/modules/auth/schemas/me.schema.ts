export const meSchema = {
  tags: ["auth"],
  summary: "Get current user",
  response: {
    200: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: ["string", "null"] },
        name: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
      },
    },
  },
} as const;
