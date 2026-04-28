/**
 * Hand-typed subset of the database schema. Replace with Supabase-generated
 * types (`supabase gen types typescript`) once the project is linked.
 */

export type AssetType = "stock" | "etf" | "crypto";

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: AssetType;
  exchange: string | null;
  currency: string;
  active: boolean;
  first_price_date: string | null;
  last_price_date: string | null;
}

export interface AssetPrice {
  asset_id: number;
  date: string; // YYYY-MM-DD
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  adj_close: number;
  volume: number | null;
}

export type PortfolioType = "backtest" | "paper";

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  type: PortfolioType;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  user_id: string | null;
  name: string;
  params: import("@/lib/backtest/types").BacktestParams;
  results: import("@/lib/backtest/types").BacktestResult | null;
  share_slug: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "plus" | "founder";
  disclaimer_accepted_at: string | null;
}
