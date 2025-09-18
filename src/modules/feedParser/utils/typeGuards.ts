export function hasStatusCode(e: unknown): e is { statusCode: number } {
  return typeof (e as { statusCode?: unknown })?.statusCode === "number";
}
