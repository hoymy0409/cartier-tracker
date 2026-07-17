import { Listing, Material, Condition, HasItem } from "@/types/listing";
import { v4 as uuidv4 } from "uuid";

"https://auctions.yahoo.co.jp/rss/search?p=カルティエ+サントス&va=カルティエ+サントス&exflg=1&b=1&n=50&s1=new&o1=d";

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
