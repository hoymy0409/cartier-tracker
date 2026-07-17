import { scrapeYahooAuctions } from "./yahooauctions";
import { supabase } from "@/lib/db";
import { Listing } from "@/types/listing";
import { sendNewListingNotifications } from "@/lib/mailer";

export async function runAllScrapers(): Promise<{ added: number; errors: string[] }> {
  const results: Listing[] = [];
  const errors: string[] = [];

  // ヤフオク
  try {
    const yahoo = await scrapeYahooAuctions();
    console.log(`Yahoo: ${yahoo.length}件取得`);
    results.push(...yahoo);
  } catch (e) {
    const msg = `Yahoo scraper error: ${e}`;
    console.error(msg);
    errors.push(msg);
  }

  let added = 0;

  for (const listing of results) {
    // 重複チェック（listing_urlが同じものは追加しない）
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("listing_url", listing.listing_url)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from("listings").insert({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        image_url: listing.image_url,
        listing_url: listing.listing_url,
        platform: listing.platform,
        material: listing.material,
        condition: listing.condition,
        has_warranty: listing.has_warranty,
        has_box: listing.has_box,
        listed_at: listing.listed_at,
      });

      if (error) {
        console.error("DB insert error:", error);
        errors.push(`DB insert error: ${error.message}`);
      } else {
        added++;
        // 新規出品のみメール通知
        try {
          await sendNewListingNotifications(listing);
        } catch (e) {
          console.error("Mail error:", e);
        }
      }
    }
  }

  console.log(`完了: ${added}件追加`);
  return { added, errors };
}
