import { Listing, Material, Condition, HasItem } from "@/types/listing";
import { v4 as uuidv4 } from "uuid";

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
  if (/外箱[:：\s]*なし|箱なし/.test(text)) return "なし";
  return "不明";
}

export async function scrapeYahooAuctions(): Promise<Listing[]> {
  const query = encodeURIComponent("カルティエ サントス MM");
  const url = `https://auctions.yahoo.co.jp/search/search?p=${query}&s1=new&o1=d&mode=2`;
  
  const res = await fetch(url, {
    headers: { 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Yahoo fetch error: ${res.status}`);
    return [];
  }

  const html = await res.text();
  const listings: Listing[] = [];

  const itemRegex = /<li[^>]*class="[^"]*Product[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  const titleRegex = /<h3[^>]*class="[^"]*Product__title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/;
  const priceRegex = /([0-9,]+)\s*円/;
  const imgRegex = /<img[^>]+src="([^"]+)"/;
  const dateRegex = /(\d{4}年\d{1,2}月\d{1,2}日|\d{1,2}月\d{1,2}日)/;

  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const block = match[1];
    const titleMatch = titleRegex.exec(block);
    if (!titleMatch) continue;

    const link = titleMatch[1];
    const title = titleMatch[2].replace(/<[^>]+>/g, "").trim();

    if (!/サントス/i.test(title)) continue;

    const priceMatch = priceRegex.exec(block);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) :
