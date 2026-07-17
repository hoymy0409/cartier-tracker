import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "メールアドレスが正しくありません" }, { status: 400 });
  }

  // 既存チェック
  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, confirmed")
    .eq("email", email)
    .maybeSingle();

  if (existing?.confirmed) {
    return NextResponse.json({ message: "すでに登録済みです" });
  }

  const token = uuidv4();

  if (existing) {
    // 未確認なら再送
    await supabase
      .from("subscribers")
      .update({ confirm_token: token })
      .eq("email", email);
  } else {
    await supabase.from("subscribers").insert({
      email,
      confirmed: false,
      confirm_token: token,
    });
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm?token=${token}`;

  await resend.emails.send({
    from: "カルティエ サントス通知 <notify@yourdomain.com>",
    to: [email],
    subject: "【登録確認】メールアドレスを確認してください",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2>メールアドレスの確認</h2>
        <p>以下のボタンをクリックして登録を完了してください。</p>
        <a href="${confirmUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1a1a1a; color: white; border-radius: 6px; text-decoration: none;">
          登録を確認する
        </a>
        <p style="margin-top: 16px; font-size: 12px; color: #999;">
          このメールに心当たりがない場合は無視してください。
        </p>
      </div>
    `,
  });

  return NextResponse.json({ message: "確認メールを送信しました。メールをご確認ください。" });
}
