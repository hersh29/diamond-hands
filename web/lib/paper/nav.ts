/**
 * Daily NAV (net asset value) calculation for paper portfolios.
 *
 * Replays transactions across the price matrix to produce a daily
 * value series. Used for the performance chart vs benchmark.
 */

import type { PriceMatrix } from "@/lib/backtest/types";
import type { PaperTransaction } from "./types";

export interface NavPoint {
  date: string;
  value: number;        // cash + market value of holdings
  contributed: number;  // running net deposits (deposits - withdrawals)
  benchmark?: number;   // hypothetical "if same cash flow had bought benchmark"
}

interface Inputs {
  transactions: PaperTransaction[];
  /** Map from transaction id → asset_id (for buy/sell rows that reference an asset). */
  assetIdByTxn: Record<string, number>;
  /** Map from asset_id → symbol used in PriceMatrix.prices. */
  symbolByAssetId: Record<number, string>;
  matrix: PriceMatrix;
  benchmarkSymbol?: string;
}

export function computeNavSeries({
  transactions,
  assetIdByTxn,
  symbolByAssetId,
  matrix,
  benchmarkSymbol,
}: Inputs): NavPoint[] {
  const { dates, prices } = matrix;
  if (dates.length === 0) return [];

  // Index transactions by execution date
  const txnsByDate = new Map<string, PaperTransaction[]>();
  for (const t of transactions) {
    const d = t.executed_at.slice(0, 10);
    if (!txnsByDate.has(d)) txnsByDate.set(d, []);
    txnsByDate.get(d)!.push(t);
  }

  let cash = 0;
  let netDeposits = 0;
  let benchmarkShares = 0;
  const shares = new Map<number, number>();

  const out: NavPoint[] = [];
  const hasBenchmark = benchmarkSymbol != null && prices[benchmarkSymbol] != null;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];

    // Apply all transactions on this date
    const todays = txnsByDate.get(date) ?? [];
    for (const t of todays) {
      switch (t.type) {
        case "deposit": {
          const amt = Number(t.cash_amount ?? 0);
          cash += amt;
          netDeposits += amt;
          if (hasBenchmark) {
            const bp = priceAt(prices[benchmarkSymbol!], i);
            if (bp > 0) benchmarkShares += amt / bp;
          }
          break;
        }
        case "withdraw": {
          const amt = Number(t.cash_amount ?? 0);
          cash -= amt;
          netDeposits -= amt;
          if (hasBenchmark) {
            const bp = priceAt(prices[benchmarkSymbol!], i);
            if (bp > 0) benchmarkShares -= amt / bp;
          }
          break;
        }
        case "dividend": {
          cash += Number(t.cash_amount ?? 0);
          break;
        }
        case "buy": {
          const aid = assetIdByTxn[t.id];
          if (!aid) break;
          const s = Number(t.shares ?? 0);
          const p = Number(t.price ?? 0);
          const f = Number(t.fees ?? 0);
          cash -= s * p + f;
          shares.set(aid, (shares.get(aid) ?? 0) + s);
          break;
        }
        case "sell": {
          const aid = assetIdByTxn[t.id];
          if (!aid) break;
          const s = Number(t.shares ?? 0);
          const p = Number(t.price ?? 0);
          const f = Number(t.fees ?? 0);
          cash += s * p - f;
          shares.set(aid, (shares.get(aid) ?? 0) - s);
          break;
        }
      }
    }

    // Compute portfolio value at this date's close prices
    let marketValue = 0;
    for (const [aid, n] of shares) {
      if (n <= 0) continue;
      const sym = symbolByAssetId[aid];
      if (!sym || !prices[sym]) continue;
      marketValue += n * priceAt(prices[sym], i);
    }
    const point: NavPoint = {
      date,
      value: cash + marketValue,
      contributed: netDeposits,
    };
    if (hasBenchmark) {
      point.benchmark = benchmarkShares * priceAt(prices[benchmarkSymbol!], i);
    }
    out.push(point);
  }

  return out;
}

function priceAt(series: number[], index: number): number {
  const p = series[index];
  if (Number.isFinite(p) && p > 0) return p;
  let j = index - 1;
  while (j >= 0 && (!Number.isFinite(series[j]) || series[j] <= 0)) j--;
  return j >= 0 ? series[j] : 0;
}
