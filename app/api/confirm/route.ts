import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=invalid", req.url));
  }

  const { data, error } = await supabase
    .from("subscribers")
    .update({ confirmed: true })
    .eq("confirm_token", token)
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL("/?error=invalid", req.url));
  }

  return NextResponse.redirect(new URL("/?subscribed=true", req.url));
}
