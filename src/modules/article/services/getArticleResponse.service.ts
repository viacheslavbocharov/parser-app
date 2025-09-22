import { HttpError } from "../../auth/services/errors";
import { isAllowedHost } from "./allowlist";
import { fetchHtml } from "./fetchHtml.service";
import { parseNasaBlog } from "./parseNasaBlog.service";
import { parseNasaGov } from "./parseNasaGov.service";
import { parseTheRegister } from "./parseTheRegister.service";

export async function getArticleResponse(url: string) {
  const host = new URL(url).host;
  if (!isAllowedHost(host)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "This parser supports only theregister.com or science.nasa.gov",
    );
  }

  const html = await fetchHtml(url);

  let parsed:
    | ReturnType<typeof parseTheRegister>
    | ReturnType<typeof parseNasaBlog>
    | ReturnType<typeof parseNasaGov>;

  if (host.endsWith("theregister.com")) {
    parsed = parseTheRegister(html, url);
  } else if (host.endsWith("science.nasa.gov")) {
    parsed = parseNasaBlog(html, url);
  } else if (host.endsWith("nasa.gov")) {
    parsed = parseNasaGov(html, url);
  } else {
    throw new HttpError(400, "BAD_REQUEST", "Unsupported host");
  }

  const cleanedParagraphs = (parsed.paragraphs ?? [])
    .filter(Boolean)
    .filter(
      (p) =>
        !/^\s*\d+\s*min read/i.test(p) &&
        !/^\s*written by/i.test(p) &&
        !/^\s*visit /i.test(p) &&
        !/^\s*explore /i.test(p),
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
