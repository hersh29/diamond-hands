/**
 * Data fetch helpers for the backtest engine.
 * Pulls aligned price series from Supabase given a list of symbols + date range.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { alignPriceMatrix } from "./engine";
import type { PriceMatrix } from "./types";

interface FetchOptions {
  symbols: string[];
  startDate: string;
  endDate: string;
}

export async function fetchPriceMatrix(
  supabase: SupabaseClient,
  { symbols, startDate, endDate }: FetchOptions,
): Promise<PriceMatrix> {
  if (symbols.length === 0) return { dates: [], prices: {} };

  const { data: assets, error: assetErr } = await supabase
    .from("assets")
    .select("id, symbol")
    .in("symbol", symbols);
  if (assetErr) throw assetErr;
  if (!assets || assets.length === 0) {
    throw new Error(`No assets found for symbols: ${symbols.join(", ")}`);
  }

  const idMap = new Map(assets.map((a) => [a.id, a.symbol]));

  const { data: prices, error: priceErr } = await supabase
    .from("asset_prices")
    .select("asset_id, date, adj_close")
    .in("asset_id", Array.from(idMap.keys()))
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  if (priceErr) throw priceErr;

  const grouped = new Map<string, { date: string; price: number }[]>();
  for (const symbol of idMap.values()) grouped.set(symbol, []);

  for (const row of prices ?? []) {
    const sym = idMap.get(row.asset_id as number);
    if (!sym) continue;
    grouped.get(sym)!.push({ date: row.date as string, price: Number(row.adj_close) });
  }

  return alignPriceMatrix(
    Array.from(grouped.entries()).map(([symbol, series]) => ({ symbol, series })),
  );
}
