import { isAllowedHost } from "./allowlist";
import { fetchHtml } from "./fetchHtml.service";
import { parseTheRegister } from "./parseTheRegister.service";
import { parseNasaBlog } from "./parseNasaBlog.service";
import { HttpError } from "../../auth/services/errors";

export async function getArticleResponse(url: string) {
  const host = new URL(url).host;
  if (!isAllowedHost(host)) {
    throw new HttpError(400, "BAD_REQUEST", "This parser supports only theregister.com or science.nasa.gov");
  }

  const html = await fetchHtml(url);

  const parsed =
    host.endsWith("theregister.com")
      ? parseTheRegister(html, url)
      : host.endsWith("science.nasa.gov")
        ? parseNasaBlog(html, url)
        : (() => { throw new HttpError(400, "BAD_REQUEST", "Unsupported host"); })();

const cleanedParagraphs = (parsed.paragraphs ?? [])
  .filter(Boolean)
  .filter(p =>
    !/^\s*\d+\s*min read/i.test(p) &&
    !/^\s*written by/i.test(p) &&
    !/^\s*visit /i.test(p) &&
    !/^\s*explore /i.test(p)
  );

  const text = cleanedParagraphs.join("\n\n");
  
  return {
    sourceUrl: url,
    title: parsed.title,
    publishedAt: parsed.publishedAt,
    author: parsed.author,
    heroImage: parsed.heroImage,
    paragraphs: cleanedParagraphs,
    text,               
    images: parsed.images,
  };
}
