/**
 * Backtest engine types.
 *
 * The engine is pure: BacktestParams + PriceMatrix → BacktestResult.
 * No I/O lives in `lib/backtest/`. The caller is responsible for fetching
 * prices and passing them in.
 */

export type ContributionFrequency = "weekly" | "biweekly" | "monthly";
export type RebalanceFrequency = "never" | "monthly" | "quarterly" | "annually";

export interface AssetWeight {
  /** Asset symbol as stored in the DB (e.g. "AAPL", "BTC-USD"). */
  symbol: string;
  /** Display name shown in UI. */
  name?: string;
  /** Allocation 0..1; all weights in a portfolio must sum to 1.0 (within 0.001 tolerance). */
  weight: number;
}

export interface BacktestParams {
  assets: AssetWeight[];
  /** Inclusive ISO date YYYY-MM-DD. */
  startDate: string;
  /** Inclusive ISO date YYYY-MM-DD. */
  endDate: string;
  initialAmount: number;
  contribution?: {
    amount: number;
    frequency: ContributionFrequency;
  };
  rebalance?: RebalanceFrequency;
  /** Risk-free rate (annual) used for Sharpe ratio. Default 4%. */
  riskFreeRate?: number;
  /** Optional benchmark symbol (e.g. "SPY") to compare against. */
  benchmark?: string;
}

/**
 * Aligned price matrix — rows = trading days, columns = assets.
 * `prices[symbol]` has the same length as `dates`. Forward-filled where needed.
 */
export interface PriceMatrix {
  dates: string[]; // YYYY-MM-DD ascending
  prices: Record<string, number[]>;
}

export interface EquityPoint {
  date: string;
  /** Total portfolio value (cash + holdings * price). */
  value: number;
  /** Cumulative cash contributed so far (initial + all DCA). */
  contributed: number;
  /** Hypothetical value if same cash flow had bought benchmark instead. Only present if benchmark requested. */
  benchmark?: number;
}

export interface DrawdownPoint {
  date: string;
  /** Drawdown from prior peak, expressed as a fraction (e.g. -0.18 = -18%). */
  drawdown: number;
}

export interface BacktestMetrics {
  /** Initial cash deposited. */
  initialAmount: number;
  /** Total cash deposited (initial + contributions). */
  totalContributed: number;
  /** Final portfolio value. */
  finalValue: number;
  /** Total return = (finalValue - totalContributed) / totalContributed. */
  totalReturn: number;
  /** Compound Annual Growth Rate, fraction (0.10 = 10%). */
  cagr: number;
  /** Annualized standard deviation of daily returns, fraction. */
  volatility: number;
  /** (CAGR − rf) / volatility. */
  sharpe: number;
  /** Maximum peak-to-trough drawdown, fraction (e.g. -0.42). */
  maxDrawdown: number;
  /** Calendar year with the best return. */
  bestYear: { year: number; return: number } | null;
  /** Calendar year with the worst return. */
  worstYear: { year: number; return: number } | null;
  /** Benchmark final value (using same cash flow). Only present if benchmark requested. */
  benchmarkFinalValue?: number;
  /** Benchmark CAGR. */
  benchmarkCagr?: number;
}

export interface BacktestResult {
  equityCurve: EquityPoint[];
  drawdown: DrawdownPoint[];
  metrics: BacktestMetrics;
  /** What the engine actually used (after weight normalization, etc.) */
  echoParams: BacktestParams;
}
