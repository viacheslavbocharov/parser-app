import { HttpError } from "../../auth/services/errors";
import { isAllowedHost } from "./allowlist";
import { fetchHtml } from "./fetchHtml.service";
import { parseNasaBlog } from "./parseNasaBlog.service";
import { parseNasaGov } from "./parseNasaGov.service";
import { parseTheRegister } from "./parseTheRegister.service";

export async function getArticlePreviewResponse(url: string) {
  const host = new URL(url).host;
  if (!isAllowedHost(host)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "This parser supports only theregister.com, science.nasa.gov, or www.nasa.gov",
    );
  }

  const html = await fetchHtml(url);

  const parsed = host.endsWith("theregister.com")
    ? parseTheRegister(html, url)
    : host.endsWith("science.nasa.gov")
      ? parseNasaBlog(html, url)
      : parseNasaGov(html, url);

  return {
    sourceUrl: url,
    title: parsed.title ?? null,
    author: parsed.author ?? null,
    publishedAt: parsed.publishedAt ?? null,
    heroImage: parsed.heroImage ?? null,
  };
}
