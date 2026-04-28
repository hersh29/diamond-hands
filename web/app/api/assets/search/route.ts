import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/assets/search?q=<query>&limit=20
 *
 * Returns matching assets by symbol or name. Public (RLS allows anon select on
 * `assets`).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  const supabase = await createClient();

  let query = supabase
    .from("assets")
    .select("id, symbol, name, type, last_price_date")
    .eq("active", true)
    .limit(limit);

  if (q.length > 0) {
    const term = q.replace(/[%_]/g, "");
    query = query.or(`symbol.ilike.%${term}%,name.ilike.%${term}%`);
  } else {
    query = query.order("symbol");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ assets: data ?? [] });
}
