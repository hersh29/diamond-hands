/**
 * DiamondHands backtest engine.
 *
 * Pure functions, no I/O. Given portfolio params and a price matrix, produces
 * an equity curve, drawdown series, and aggregate metrics.
 *
 * Algorithm (high level):
 *  1. At t=0, allocate `initialAmount` per weights → compute shares per asset.
 *  2. Walk every trading day:
 *      - Compute portfolio value = Σ shares[a] × price[a, t]
 *      - On contribution dates, add cash and buy per current target weights
 *      - On rebalance dates, liquidate and re-allocate to target weights
 *  3. Compute metrics from the final curve.
 *
 * Cash held inside the portfolio is implicitly zero between contribution events
 * because we always immediately invest. This is a deliberate simplification for
 * the lump-sum + DCA model. Real-world cash drag, fees, and tax effects are
 * out of scope.
 */

import type {
  AssetWeight,
  BacktestMetrics,
  BacktestParams,
  BacktestResult,
  ContributionFrequency,
  DrawdownPoint,
  EquityPoint,
  PriceMatrix,
  RebalanceFrequency,
} from "./types";

const TRADING_DAYS_PER_YEAR = 252;

export function runBacktest(
  params: BacktestParams,
  matrix: PriceMatrix,
): BacktestResult {
  const normalized = normalizeWeights(params.assets);
  const echoParams: BacktestParams = { ...params, assets: normalized };

  const { dates, prices } = matrix;
  if (dates.length === 0) {
    return emptyResult(echoParams);
  }

  // Validate every asset has prices in the matrix
  for (const a of normalized) {
    if (!prices[a.symbol]) {
      throw new Error(`No price series for ${a.symbol}`);
    }
  }

  const targetWeights = new Map(normalized.map((a) => [a.symbol, a.weight]));
  const shares = new Map<string, number>(normalized.map((a) => [a.symbol, 0]));

  // t=0 allocation
  const startPrices = priceVector(prices, normalized, 0);
  for (const a of normalized) {
    const cash = params.initialAmount * a.weight;
    shares.set(a.symbol, cash / startPrices[a.symbol]);
  }

  let totalContributed = params.initialAmount;
  const equityCurve: EquityPoint[] = [];

  // Cache contribution / rebalance flags by index for the date list
  const contribFlags = computeContributionFlags(dates, params.contribution?.frequency);
  const rebalanceFlags = computeRebalanceFlags(dates, params.rebalance ?? "never");

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const pv = priceVector(prices, normalized, i);

    // 1) Apply contribution at start of day (if any), at today's open-equivalent prices
    if (i > 0 && contribFlags[i] && params.contribution) {
      const cash = params.contribution.amount;
      totalContributed += cash;
      for (const a of normalized) {
        const buy = cash * a.weight;
        shares.set(a.symbol, (shares.get(a.symbol) ?? 0) + buy / pv[a.symbol]);
      }
    }

    // 2) Compute portfolio value
    let value = 0;
    for (const a of normalized) {
      value += (shares.get(a.symbol) ?? 0) * pv[a.symbol];
    }

    // 3) Rebalance at end of day if scheduled (and not the very first day)
    if (i > 0 && rebalanceFlags[i]) {
      for (const a of normalized) {
        const target = value * (targetWeights.get(a.symbol) ?? 0);
        shares.set(a.symbol, target / pv[a.symbol]);
      }
    }

    equityCurve.push({ date, value, contributed: totalContributed });
  }

  const drawdown = computeDrawdown(equityCurve);
  const metrics = computeMetrics(
    equityCurve,
    drawdown,
    params.initialAmount,
    params.riskFreeRate ?? 0.04,
  );

  return { equityCurve, drawdown, metrics, echoParams };
}

// ============================================================
// Helpers
// ============================================================

function normalizeWeights(assets: AssetWeight[]): AssetWeight[] {
  const sum = assets.reduce((s, a) => s + (a.weight || 0), 0);
  if (sum <= 0) {
    throw new Error("Asset weights must sum to a positive value.");
  }
  return assets.map((a) => ({ ...a, weight: a.weight / sum }));
}

function priceVector(
  prices: Record<string, number[]>,
  assets: AssetWeight[],
  index: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of assets) {
    const series = prices[a.symbol];
    const p = series[index];
    if (!Number.isFinite(p) || p <= 0) {
      // Forward-fill from earlier non-zero price. Forward-fill is the responsibility
      // of the caller (alignPriceMatrix), but defend against bad data.
      let j = index - 1;
      while (j >= 0 && (!Number.isFinite(series[j]) || series[j] <= 0)) j--;
      out[a.symbol] = j >= 0 ? series[j] : 1;
    } else {
      out[a.symbol] = p;
    }
  }
  return out;
}

function computeContributionFlags(
  dates: string[],
  freq: ContributionFrequency | undefined,
): boolean[] {
  const flags = new Array(dates.length).fill(false);
  if (!freq) return flags;

  let lastTriggerKey = "";
  for (let i = 1; i < dates.length; i++) {
    const key = bucketKey(dates[i], freq);
    if (key !== lastTriggerKey) {
      flags[i] = true;
      lastTriggerKey = key;
    }
  }
  return flags;
}

function computeRebalanceFlags(
  dates: string[],
  freq: RebalanceFrequency,
): boolean[] {
  const flags = new Array(dates.length).fill(false);
  if (freq === "never") return flags;

  let lastTriggerKey = "";
  for (let i = 1; i < dates.length; i++) {
    const key = rebalanceBucketKey(dates[i], freq);
    if (key !== lastTriggerKey) {
      flags[i] = true;
      lastTriggerKey = key;
    }
  }
  return flags;
}

function bucketKey(iso: string, freq: ContributionFrequency): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (freq === "monthly") {
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
  }
  if (freq === "biweekly") {
    // Week of year, two-week bucket
    const start = Date.UTC(d.getUTCFullYear(), 0, 1);
    const dayOfYear = Math.floor((d.getTime() - start) / 86_400_000);
    const week = Math.floor(dayOfYear / 7);
    return `${d.getUTCFullYear()}-${Math.floor(week / 2)}`;
  }
  // weekly
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - start) / 86_400_000);
  return `${d.getUTCFullYear()}-${Math.floor(dayOfYear / 7)}`;
}

function rebalanceBucketKey(iso: string, freq: RebalanceFrequency): string {
  const d = new Date(`${iso}T00:00:00Z`);
  switch (freq) {
    case "monthly":   return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
    case "quarterly": return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
    case "annually":  return `${d.getUTCFullYear()}`;
    default:          return "";
  }
}

function computeDrawdown(curve: EquityPoint[]): DrawdownPoint[] {
  const out: DrawdownPoint[] = [];
  let peak = -Infinity;
  for (const p of curve) {
    if (p.value > peak) peak = p.value;
    const dd = peak > 0 ? (p.value - peak) / peak : 0;
    out.push({ date: p.date, drawdown: dd });
  }
  return out;
}

function computeMetrics(
  curve: EquityPoint[],
  drawdown: DrawdownPoint[],
  initialAmount: number,
  riskFreeRate: number,
): BacktestMetrics {
  if (curve.length === 0) {
    return {
      initialAmount,
      totalContributed: initialAmount,
      finalValue: initialAmount,
      totalReturn: 0,
      cagr: 0,
      volatility: 0,
      sharpe: 0,
      maxDrawdown: 0,
      bestYear: null,
      worstYear: null,
    };
  }

  const first = curve[0];
  const last  = curve[curve.length - 1];
  const totalContributed = last.contributed;
  const finalValue = last.value;
  const totalReturn = totalContributed > 0
    ? (finalValue - totalContributed) / totalContributed
    : 0;

  const years = yearsBetween(first.date, last.date);

  // CAGR is computed on growth-only basis. With contributions, "CAGR" is ambiguous —
  // we use a money-weighted approximation: solve for r where finalValue ≈ Σ contributions × (1+r)^t.
  // For simplicity here we use the time-weighted compounded daily-return growth instead,
  // which ignores the timing of contributions.
  const cagr = computeCagr(curve);
  const volatility = computeVolatility(curve);
  const sharpe = volatility > 0 ? (cagr - riskFreeRate) / volatility : 0;
  const maxDrawdown = drawdown.reduce((m, d) => Math.min(m, d.drawdown), 0);

  const yearly = computeYearlyReturns(curve);
  const bestYear  = yearly.reduce<{ year: number; return: number } | null>(
    (best, cur) => (best === null || cur.return > best.return ? cur : best),
    null,
  );
  const worstYear = yearly.reduce<{ year: number; return: number } | null>(
    (worst, cur) => (worst === null || cur.return < worst.return ? cur : worst),
    null,
  );

  return {
    initialAmount,
    totalContributed,
    finalValue,
    totalReturn,
    cagr,
    volatility,
    sharpe,
    maxDrawdown,
    bestYear,
    worstYear,
  };
}

function computeCagr(curve: EquityPoint[]): number {
  // Time-weighted return derived from daily returns of value/contributed-adjusted balance.
  // We compute (V_t - cashflow_t) / V_{t-1} per day to neutralize contribution effects.
  let logSum = 0;
  let count = 0;
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const cur  = curve[i];
    const cashflow = cur.contributed - prev.contributed;
    const denom = prev.value;
    if (denom <= 0) continue;
    const rawReturn = (cur.value - cashflow - prev.value) / prev.value;
    const factor = 1 + rawReturn;
    if (factor <= 0) continue;
    logSum += Math.log(factor);
    count += 1;
  }
  if (count === 0) return 0;
  const avgDaily = logSum / count;
  return Math.expm1(avgDaily * TRADING_DAYS_PER_YEAR);
}

function computeVolatility(curve: EquityPoint[]): number {
  const rs: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const cur  = curve[i];
    const cashflow = cur.contributed - prev.contributed;
    if (prev.value <= 0) continue;
    rs.push((cur.value - cashflow - prev.value) / prev.value);
  }
  if (rs.length < 2) return 0;
  const mean = rs.reduce((s, r) => s + r, 0) / rs.length;
  const variance = rs.reduce((s, r) => s + (r - mean) ** 2, 0) / (rs.length - 1);
  return Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

function computeYearlyReturns(curve: EquityPoint[]): { year: number; return: number }[] {
  const byYear = new Map<number, EquityPoint[]>();
  for (const p of curve) {
    const y = Number(p.date.slice(0, 4));
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }
  const out: { year: number; return: number }[] = [];
  for (const [year, points] of byYear) {
    if (points.length < 2) continue;
    const first = points[0];
    const last  = points[points.length - 1];
    const cashflow = last.contributed - first.contributed;
    if (first.value <= 0) continue;
    out.push({
      year,
      return: (last.value - cashflow - first.value) / first.value,
    });
  }
  return out.sort((a, b) => a.year - b.year);
}

function yearsBetween(startISO: string, endISO: string): number {
  const ms = new Date(`${endISO}T00:00:00Z`).getTime() - new Date(`${startISO}T00:00:00Z`).getTime();
  return ms / (365.25 * 86_400_000);
}

function emptyResult(echoParams: BacktestParams): BacktestResult {
  return {
    equityCurve: [],
    drawdown: [],
    metrics: {
      initialAmount: echoParams.initialAmount,
      totalContributed: echoParams.initialAmount,
      finalValue: echoParams.initialAmount,
      totalReturn: 0,
      cagr: 0,
      volatility: 0,
      sharpe: 0,
      maxDrawdown: 0,
      bestYear: null,
      worstYear: null,
    },
    echoParams,
  };
}

// ============================================================
// Price matrix alignment helper (used by the data fetch layer)
// ============================================================

/**
 * Build a PriceMatrix from per-asset price arrays. Aligns to the union of all
 * dates in the requested range and forward-fills missing prices. Drops dates
 * before any asset has data.
 */
export function alignPriceMatrix(
  assetSeries: { symbol: string; series: { date: string; price: number }[] }[],
): PriceMatrix {
  if (assetSeries.length === 0) return { dates: [], prices: {} };

  const dateSet = new Set<string>();
  for (const a of assetSeries) {
    for (const p of a.series) dateSet.add(p.date);
  }
  const dates = Array.from(dateSet).sort();

  // Find first date where every asset has at least one price ≤ that date
  const firstAvailable = (series: { date: string; price: number }[]) => series[0]?.date;
  const earliestUsable = assetSeries
    .map((a) => firstAvailable(a.series))
    .filter(Boolean)
    .sort()
    .pop()!;
  const usableDates = dates.filter((d) => d >= earliestUsable);

  const prices: Record<string, number[]> = {};
  for (const a of assetSeries) {
    const map = new Map(a.series.map((p) => [p.date, p.price]));
    const arr: number[] = new Array(usableDates.length);
    let last = NaN;
    for (let i = 0; i < usableDates.length; i++) {
      const v = map.get(usableDates[i]);
      if (v != null && Number.isFinite(v) && v > 0) {
        last = v;
      }
      arr[i] = last;
    }
    prices[a.symbol] = arr;
  }

  return { dates: usableDates, prices };
}
