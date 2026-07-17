import { NextRequest, NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel Cronからのリクエストのみ受け付ける
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAllScrapers();
  return NextResponse.json({ ok: true, ...result });
}
