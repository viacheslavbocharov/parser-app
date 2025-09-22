import * as cheerio from "cheerio";

export function parseNasaGov(html: string, url: string) {
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim() || null;

  const author =
    $('meta[name="author"]').attr("content") || $('[rel="author"]').first().text().trim() || null;

  const publishedAt =
    $('meta[property="article:published_time"]').attr("content") ||
    $("time[datetime]").attr("datetime") ||
    null;

  const heroImage =
    $('meta[property="og:image"]').attr("content") || $("figure img").first().attr("src") || null;

  const $root = $(".wp-block-post-content").first().length
    ? $(".wp-block-post-content").first()
    : $("article").first();

  const paragraphs: string[] = [];
  $root.find("p").each((_i, el) => {
    const txt = $(el).text().trim();
    if (txt) paragraphs.push(txt);
  });

  const images: string[] = [];
  $("img").each((_i, el) => {
    const src = $(el).attr("src");
    if (src && !images.includes(src)) images.push(src);
  });

  const text = paragraphs.join("\n\n");

  return { title, author, publishedAt, heroImage, paragraphs, images, sourceUrl: url, text };
}
