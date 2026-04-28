/**
 * Paper trading types — UI/lib-only. The DB schema is defined in
 * supabase/migrations/0001_init.sql.
 */

export type PaperTransactionType = "buy" | "sell" | "deposit" | "withdraw" | "dividend";

export interface PaperPortfolio {
  id: string;
  name: string;
  created_at: string;
}

export interface PaperHolding {
  asset_id: number;
  symbol: string;
  name: string;
  shares: number;
  cost_basis: number;
  current_price?: number;
  market_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
}

export interface PaperTransaction {
  id: string;
  type: PaperTransactionType;
  symbol: string | null;
  shares: number | null;
  price: number | null;
  cash_amount: number | null;
  executed_at: string;
  fees: number;
  notes: string | null;
}

export interface PaperPortfolioSummary {
  cashBalance: number;
  marketValue: number;
  totalValue: number;
  totalContributed: number;
  totalReturn: number;
  totalReturnPct: number;
}
