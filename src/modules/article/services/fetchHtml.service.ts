import { fetch } from "undici";
import { HttpError } from "../../auth/services/errors";

type FetchOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export async function fetchHtml(url: string, opts: FetchOptions = {}) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ParserApp/1.0 (+https://example.local)",
        Accept: "text/html,application/xhtml+xml",
        ...opts.headers,
      },
    });

    if (!res.ok) {
      throw new HttpError(502, "BAD_GATEWAY", `Upstream ${res.status}`);
    }

    return await res.text();
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      throw new HttpError(504, "GATEWAY_TIMEOUT", "Upstream timeout");
    }
    throw new HttpError(502, "BAD_GATEWAY", (e as Error).message || "Upstream error");
  } finally {
    clearTimeout(to);
  }
}
