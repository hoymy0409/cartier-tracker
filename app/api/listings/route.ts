import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { runAllScrapers } from "@/lib/scrapers";

export const dynamic = "force-dynamic";

export async function GET() {
  await runAllScrapers();
  
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("listed_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
