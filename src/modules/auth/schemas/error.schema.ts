export const errorSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    code: { type: "string" },
  },
  required: ["message"],
} as const;
