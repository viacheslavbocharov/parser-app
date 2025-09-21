import * as cheerio from "cheerio";

function absolutize(src: string | undefined, base: string) {
  if (!src) return null;
  try { return new URL(src, base).toString(); } catch { return src; }
}

export function parseNasaBlog(html: string, pageUrl: string) {
  const $ = cheerio.load(html);

  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text().trim() ||
    null;

  const publishedAt =
    $("time[datetime]").first().attr("datetime") ||
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="date"]').attr("content") ||
    null;

  const author =
    $('[rel="author"]').first().text().trim() ||
    $('meta[name="author"]').attr("content") ||
    $(".byline, .author, .author-name").first().text().trim() ||
    null;

  const heroImage = absolutize(
    $('meta[property="og:image"]').attr("content") ||
    $("figure img").first().attr("src") ||
    $("img").first().attr("src"),
    pageUrl,
  );

  const candidates = [
    "article",
    'div[class*="article"]',
    "main",
    ".entry-content",
    ".rich-text",
    '[data-testid="wysiwyg"]',
    "#content",
    "body",
  ];

  let paragraphs: string[] = [];
  const imagesSet = new Set<string>();

  for (const sel of candidates) {
    const root = $(sel).first();
    if (!root.length) continue;

    const ps = root.find("p")
      .map((_i, el) => $(el).text().trim())
      .toArray()
      .filter(Boolean);

    root.find("img").each((_i, el) => {
      const src = absolutize($(el).attr("src"), pageUrl);
      if (src) imagesSet.add(src);
    });

    if (ps.length >= 3) {
      paragraphs = ps;
      break;
    }
  }

  if (paragraphs.length === 0) {
    paragraphs = $("p").map((_i, el) => $(el).text().trim()).toArray().filter(Boolean);
  }

  return {
    title,
    publishedAt,
    author,
    heroImage: heroImage ?? null,
    paragraphs,
    images: Array.from(imagesSet).slice(0, 10),
  };
}
