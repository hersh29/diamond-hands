/**
 * Monte Carlo forward simulation.
 *
 * Algorithm:
 *  1. From the price matrix, compute the portfolio's daily weighted returns.
 *  2. Aggregate into monthly compound returns.
 *  3. For each of N simulations, build a path by sampling monthly returns
 *     with replacement (block bootstrap, block size 1) and applying
 *     contributions on schedule.
 *  4. At each month, compute percentile bands across all paths.
 *
 * Pure function. No I/O. The caller passes a PriceMatrix exactly like
 * the backtest engine.
 */

import type { PriceMatrix, AssetWeight } from "@/lib/backtest/types";
import type { PercentileBand, SimulateParams, SimulateResult } from "./types";

export function runSimulation(
  params: SimulateParams,
  matrix: PriceMatrix,
): SimulateResult {
  const monthlyReturns = computePortfolioMonthlyReturns(params.assets, matrix);
  if (monthlyReturns.length < 12) {
    throw new Error(
      "Not enough historical data to simulate. Need at least one year of prices.",
    );
  }

  const horizonMonths = Math.max(1, Math.round(params.horizonYears * 12));
  const numSims = Math.max(50, Math.min(params.numSimulations, 5000));
  const contributionPerMonth = computeMonthlyContribution(params);

  // Pre-allocate path arrays once per sim
  const paths: number[][] = new Array(numSims);
  let totalContributedRef = params.initialAmount;

  for (let s = 0; s < numSims; s++) {
    const path = new Array(horizonMonths + 1);
    let value = params.initialAmount;
    let contributed = params.initialAmount;
    path[0] = value;

    for (let m = 1; m <= horizonMonths; m++) {
      // Apply this month's return
      const r = monthlyReturns[Math.floor(Math.random() * monthlyReturns.length)];
      value *= 1 + r;
      // Add monthly contribution at end of month (post-return)
      if (contributionPerMonth > 0) {
        value += contributionPerMonth;
        contributed += contributionPerMonth;
      }
      path[m] = value;
    }
    paths[s] = path;

    if (s === 0) totalContributedRef = contributed; // identical across sims
  }

  // Compute bands at every month
  const bands: PercentileBand[] = new Array(horizonMonths + 1);
  const startMonth = monthLabel(new Date());
  for (let m = 0; m <= horizonMonths; m++) {
    const valuesAtT = new Array(numSims);
    for (let s = 0; s < numSims; s++) valuesAtT[s] = paths[s][m];
    valuesAtT.sort((a, b) => a - b);

    bands[m] = {
      monthIndex: m,
      date: addMonths(startMonth, m),
      p5:  pctValue(valuesAtT, 0.05),
      p25: pctValue(valuesAtT, 0.25),
      p50: pctValue(valuesAtT, 0.50),
      p75: pctValue(valuesAtT, 0.75),
      p95: pctValue(valuesAtT, 0.95),
      contributed: params.initialAmount + contributionPerMonth * m,
    };
  }

  // End-of-horizon stats
  const endValues = paths.map((p) => p[horizonMonths]);
  endValues.sort((a, b) => a - b);
  const totalContributed = totalContributedRef;
  const years = params.horizonYears;

  const median = endValues[Math.floor(numSims * 0.5)];
  const p5End  = endValues[Math.floor(numSims * 0.05)];
  const p95End = endValues[Math.floor(numSims * 0.95)];

  const probabilities = {
    losing:   countWhere(endValues, (v) => v < totalContributed) / numSims,
    doubling: countWhere(endValues, (v) => v >= 2 * totalContributed) / numSims,
    goal: params.goalAmount != null && params.goalAmount > 0
      ? countWhere(endValues, (v) => v >= params.goalAmount!) / numSims
      : undefined,
  };

  return {
    bands,
    median: { endValue: median, cagr: cagr(median, totalContributed, years) },
    p5:     { endValue: p5End,  cagr: cagr(p5End,  totalContributed, years) },
    p95:    { endValue: p95End, cagr: cagr(p95End, totalContributed, years) },
    totalContributed,
    probabilities,
    historicalMonths: monthlyReturns.length,
  };
}

// ============================================================
// Helpers
// ============================================================

function computePortfolioMonthlyReturns(
  assets: AssetWeight[],
  matrix: PriceMatrix,
): number[] {
  const sumWeight = assets.reduce((s, a) => s + a.weight, 0);
  if (sumWeight <= 0) return [];
  const normalized = assets.map((a) => ({ ...a, weight: a.weight / sumWeight }));

  const dates = matrix.dates;
  if (dates.length < 30) return [];

  // Compute the portfolio value relative-of-each-trading-day, then sample first
  // close of each month to get monthly returns.
  const valueByDay = new Array<number>(dates.length).fill(0);
  for (let i = 0; i < dates.length; i++) {
    let v = 0;
    let validWeight = 0;
    for (const a of normalized) {
      const series = matrix.prices[a.symbol];
      if (!series) continue;
      const p = series[i];
      if (Number.isFinite(p) && p > 0) {
        // Normalize: we're tracking a fictitious unit amount allocated by weight.
        // Use price ratios so paths are internally consistent.
        const seed = firstPositive(series);
        if (seed > 0) {
          v += a.weight * (p / seed);
          validWeight += a.weight;
        }
      }
    }
    valueByDay[i] = validWeight > 0 ? v / validWeight : 0;
  }

  // Pick first trading day of each new (year, month)
  const monthEndIdx: number[] = [];
  let lastKey = "";
  for (let i = 0; i < dates.length; i++) {
    const key = dates[i].slice(0, 7);
    if (key !== lastKey) {
      monthEndIdx.push(i);
      lastKey = key;
    }
  }
  // monthEndIdx[i] is the FIRST day of each month — use month-over-month return
  const returns: number[] = [];
  for (let i = 1; i < monthEndIdx.length; i++) {
    const prev = valueByDay[monthEndIdx[i - 1]];
    const cur  = valueByDay[monthEndIdx[i]];
    if (prev > 0 && Number.isFinite(prev) && Number.isFinite(cur)) {
      returns.push((cur - prev) / prev);
    }
  }
  return returns;
}

function firstPositive(series: number[]): number {
  for (const p of series) {
    if (Number.isFinite(p) && p > 0) return p;
  }
  return 0;
}

function computeMonthlyContribution(params: SimulateParams): number {
  if (!params.contribution) return 0;
  const { amount, frequency } = params.contribution;
  if (frequency === "monthly")  return amount;
  if (frequency === "biweekly") return amount * (26 / 12);
  return amount * (52 / 12); // weekly
}

function pctValue(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[idx];
}

function countWhere(arr: number[], pred: (v: number) => boolean): number {
  let n = 0;
  for (const v of arr) if (pred(v)) n++;
  return n;
}

function cagr(endValue: number, contributed: number, years: number): number {
  if (contributed <= 0 || years <= 0 || endValue <= 0) return 0;
  // Money-weighted CAGR is hard with contributions; we approximate with simple
  // (V_end / V_contributed)^(1/years) − 1, which underestimates true return when
  // contributions stack late but works directionally for distribution quantiles.
  return (endValue / contributed) ** (1 / years) - 1;
}

function monthLabel(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addMonths(start: string, months: number): string {
  const [y, m] = start.split("-").map(Number);
  const total = (y * 12 + (m - 1)) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}
