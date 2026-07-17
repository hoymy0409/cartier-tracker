import { Listing, Material, Condition, HasItem } from "@/types/listing";
import { v4 as uuidv4 } from "uuid";

const RSS_URL =
  "https://auctions.yahoo.co.jp/rss/search?p=%E3%82%AB%E3%83%AB%E3%83%86%E3%82%A3%E3%82%A8+%E3%82%B5%E3%83%B3%E3%83%88%E3%82%B9+MM&auccat=&atype=p&slider=0";

function parseMaterial(title: string): Material {
  const hasPG = /ピンクゴールド|PG|ローズゴールド|RG/i.test(title);
  const hasSS = /ステンレス|SS/i.test(title);
  if (hasPG && hasSS) return "コンビ";
  if (hasPG) return "PG";
  if (hasSS) return "SS";
  return "不明";
}

function parseCondition(text: string): Condition {
  if (/未使用|新品/.test(text)) return "未使用";
  if (/極美品|美品/.test(text)) return "美品";
  if (/良品/.test(text)) return "良品";
  if (/使用感/.test(text)) return "使用感あり";
  if (/ジャンク|難あり|不動/.test(text)) return "ジャンク";
  return "不明";
}

function parseWarranty(text: string): HasItem {
  if (/保証書[:：\s]*あり|保証書○|保証書付/.test(text)) return "あり";
  if (/保証書[:：\s]*なし|保証書×|保証書無/.test(text)) return "なし";
  return "不明";
}

function parseBox(text: string): HasItem {
  if (/外箱[:：\s]*あり|箱あり|ボックス付|BOX付/.test(text)) return "あり";
  if (/外箱[:：\s]*なし|箱なし|ボックスなし/.test(text)) return "なし";
  return "不明";
}

function parsePrice(html: string): number | null {
  const m = html.match(/現在([0-9,]+)円/);
  if (m) return parseInt(m[1].replace(/,/g, ""), 10);
  const m2 = html.match(/([0-9,]+)\s*円/);
  if (m2) return parseInt(m2[1].replace(/,/g, ""), 10);
  return null;
}

function parseImageUrl(html: string): string | null {
  const m = html.match(/<img[^>]+src="([^"]+)"/i);
  return m ? m[1] : null;
}

function getText(block: string, tag: string): string {
  const m = block.match(
    new RegExp(
      `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
      "i"
    )
  );
  return m ? (m[1] ?? m[2] ?? "").trim() : "";
}

export async function scrapeYahooAuctions(): Promise<Listing[]> {
  const res = await fetch(RSS_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CartierTracker/1.0)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error(`Yahoo RSS error: ${res.status}`);
    return [];
  }

  const xml = await res.text();
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const listings: Listing[] = [];
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = getText(block, "title");
    const link = getText(block, "link");
    const description = getText(block, "description");
    const pubDate = getText(block, "pubDate");

    if (!title || !link) continue;

    // サントスMMに絞り込み（MMが含まれるものだけ）
    if (!/サントス/i.test(title)) continue;
    if (!/\bMM\b/.test(title)) continue;

    const combined = title + " " + description;

    listings.push({
      id: uuidv4(),
      title,
      price: parsePrice(description),
      image_url: parseImageUrl(description),
      listing_url: link,
      platform: "ヤフオク",
      material: parseMaterial(combined),
      condition: parseCondition(combined),
      has_warranty: parseWarranty(combined),
      has_box: parseBox(combined),
      listed_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }

  return listings;
}
