import { parseFeed } from "./modules/feedParser/services/feedParserService";

async function main() {
  const url = "https://hnrss.org/frontpage"; // рабочий RSS
  try {
    const result = await parseFeed(url);
    console.log("✅ Feed parsed successfully");
    console.log("Title:", result.title);
    console.log("Items:", result.items.slice(0, 3)); // первые 3 записи
  } catch (err) {
    console.error("❌ Failed to parse feed:", err);
  }
}

void main();
