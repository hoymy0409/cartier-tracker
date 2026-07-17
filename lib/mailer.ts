import { Resend } from "resend";
import { supabase } from "@/lib/db";
import { Listing } from "@/types/listing";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendNewListingNotifications(listing: Listing): Promise<void> {
  // 確認済みの登録者のみ取得
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("email")
    .eq("confirmed", true);

  if (!subscribers || subscribers.length === 0) return;

  const emails = subscribers.map((s: { email: string }) => s.email);
  const priceText = listing.price
    ? listing.price.toLocaleString("ja-JP") + "円"
    : "価格不明";

  await resend.emails.send({
    from: "カルティエ サントス通知 <onboarding@resend.dev>",
    to: emails,
    subject: `【新着】${listing.platform}に出品されました — ${priceText}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 18px; margin-bottom: 16px;">新しい出品が見つかりました</h2>
        ${
          listing.image_url
            ? `<img src="${listing.image_url}" style="width: 100%; max-width: 300px; border-radius: 8px; margin-bottom: 16px;" />`
            : ""
        }
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #666;">価格</td><td style="padding: 6px 0; font-weight: bold;">${priceText}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">プラットフォーム</td><td style="padding: 6px 0;">${listing.platform}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">素材</td><td style="padding: 6px 0;">${listing.material}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">保証書</td><td style="padding: 6px 0;">${listing.has_warranty}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">コンディション</td><td style="padding: 6px 0;">${listing.condition}</td></tr>
        </table>
        <p style="margin-top: 8px; font-size: 13px; color: #666;">${listing.title}</p>
        <a href="${listing.listing_url}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1a1a1a; color: white; border-radius: 6px; text-decoration: none; font-size: 14px;">
          出品ページを見る →
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          このメールの配信を停止するには、サイト上の「通知解除」ボタンをご利用ください。
        </p>
      </div>
    `,
  });
}
