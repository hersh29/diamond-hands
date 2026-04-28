/**
 * Paper portfolio compute helpers.
 *
 * These derive the current state of a paper portfolio from the immutable
 * transaction history + latest known prices. We don't store running totals;
 * everything is recomputed from transactions for correctness.
 */

import type { PaperHolding, PaperPortfolioSummary, PaperTransaction } from "./types";

export interface AssetMeta {
  asset_id: number;
  symbol: string;
  name: string;
  latest_price: number | null;
}

interface DerivedPosition {
  asset_id: number;
  shares: number;
  cost_basis_total: number; // total dollars invested into this position (FIFO sum of buy * price)
}

/**
 * Replay transactions to compute current cash balance and per-asset positions.
 * Cash balance = deposits - withdrawals - buys (incl. fees) + sells (less fees) + dividends.
 * Position shares = sum of buys - sum of sells; cost basis tracked using average-cost method.
 */
export function deriveState(
  transactions: PaperTransaction[],
  assetIdByTxn: Record<string, number>,
): { cashBalance: number; positions: Map<number, DerivedPosition>; totalContributed: number } {
  let cash = 0;
  let totalContributed = 0;
  const positions = new Map<number, DerivedPosition>();

  // Process in chronological order
  const ordered = [...transactions].sort(
    (a, b) => new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime(),
  );

  for (const t of ordered) {
    switch (t.type) {
      case "deposit": {
        const amount = Number(t.cash_amount ?? 0);
        cash += amount;
        totalContributed += amount;
        break;
      }
      case "withdraw": {
        const amount = Number(t.cash_amount ?? 0);
        cash -= amount;
        totalContributed -= amount;
        break;
      }
      case "dividend": {
        cash += Number(t.cash_amount ?? 0);
        break;
      }
      case "buy": {
        const assetId = assetIdByTxn[t.id];
        if (!assetId) break;
        const shares = Number(t.shares ?? 0);
        const price = Number(t.price ?? 0);
        const fees = Number(t.fees ?? 0);
        const total = shares * price + fees;
        cash -= total;
        const cur = positions.get(assetId) ?? { asset_id: assetId, shares: 0, cost_basis_total: 0 };
        cur.shares += shares;
        cur.cost_basis_total += total;
        positions.set(assetId, cur);
        break;
      }
      case "sell": {
        const assetId = assetIdByTxn[t.id];
        if (!assetId) break;
        const shares = Number(t.shares ?? 0);
        const price = Number(t.price ?? 0);
        const fees = Number(t.fees ?? 0);
        cash += shares * price - fees;
        const cur = positions.get(assetId);
        if (cur) {
          // Reduce cost basis proportionally
          const sharesBefore = cur.shares;
          const fraction = sharesBefore > 0 ? shares / sharesBefore : 0;
          cur.cost_basis_total *= 1 - fraction;
          cur.shares -= shares;
          if (cur.shares <= 0.000001) {
            positions.delete(assetId);
          } else {
            positions.set(assetId, cur);
          }
        }
        break;
      }
    }
  }

  return { cashBalance: cash, positions, totalContributed };
}

export function buildHoldings(
  positions: Map<number, DerivedPosition>,
  assets: AssetMeta[],
): PaperHolding[] {
  const byId = new Map(assets.map((a) => [a.asset_id, a]));
  const out: PaperHolding[] = [];
  for (const pos of positions.values()) {
    const meta = byId.get(pos.asset_id);
    if (!meta) continue;
    const avgCost = pos.shares > 0 ? pos.cost_basis_total / pos.shares : 0;
    const price = meta.latest_price ?? avgCost;
    const marketValue = pos.shares * price;
    const unrealized = marketValue - pos.cost_basis_total;
    const unrealizedPct = pos.cost_basis_total > 0
      ? (unrealized / pos.cost_basis_total) * 100
      : 0;

    out.push({
      asset_id: pos.asset_id,
      symbol: meta.symbol,
      name: meta.name,
      shares: pos.shares,
      cost_basis: avgCost,
      current_price: price,
      market_value: marketValue,
      unrealized_pnl: unrealized,
      unrealized_pnl_pct: unrealizedPct,
    });
  }
  return out.sort((a, b) => (b.market_value ?? 0) - (a.market_value ?? 0));
}

export function summarize(
  cashBalance: number,
  holdings: PaperHolding[],
  totalContributed: number,
): PaperPortfolioSummary {
  const marketValue = holdings.reduce((s, h) => s + (h.market_value ?? 0), 0);
  const totalValue = cashBalance + marketValue;
  const totalReturn = totalValue - totalContributed;
  const totalReturnPct = totalContributed > 0
    ? (totalReturn / totalContributed) * 100
    : 0;
  return { cashBalance, marketValue, totalValue, totalContributed, totalReturn, totalReturnPct };
}
