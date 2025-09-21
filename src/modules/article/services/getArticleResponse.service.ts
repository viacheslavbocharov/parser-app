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

  let parsed:
    | ReturnType<typeof parseTheRegister>
    | ReturnType<typeof parseNasaBlog>;

  if (host.endsWith("theregister.com")) {
    parsed = parseTheRegister(html, url);
  } else if (host.endsWith("science.nasa.gov")) {
    parsed = parseNasaBlog(html, url);    
  } else {
    throw new HttpError(400, "BAD_REQUEST", "Unsupported host");
  }

  return {
    sourceUrl: url,
    title: parsed.title,
    publishedAt: parsed.publishedAt,
    author: parsed.author,
    heroImage: parsed.heroImage,
    paragraphs: parsed.paragraphs,
    images: parsed.images,
  };
}
