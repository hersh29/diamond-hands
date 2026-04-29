import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch the most recent adj_close for a given asset symbol.
 * Returns null if the asset or its prices aren't found.
 */
export async function fetchLatestPrice(
  supabase: SupabaseClient,
  symbol: string,
): Promise<{ price: number; date: string } | null> {
  const { data: asset } = await supabase
    .from("assets")
    .select("id")
    .eq("symbol", symbol)
    .single();
  if (!asset) return null;

  const { data: row } = await supabase
    .from("asset_prices")
    .select("adj_close, date")
    .eq("asset_id", asset.id)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) return null;
  const price = Number(row.adj_close);
  if (!Number.isFinite(price) || price <= 0) return null;
  return { price, date: row.date as string };
}
