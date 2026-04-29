/**
 * Forward simulation types.
 *
 * The simulation engine bootstraps from historical monthly returns of the
 * user's chosen portfolio to project a distribution of future outcomes.
 * It is a hypothetical forecast, not a prediction. Period.
 */

import type { AssetWeight, ContributionFrequency } from "@/lib/backtest/types";

export interface SimulateParams {
  assets: AssetWeight[];
  initialAmount: number;
  contribution?: { amount: number; frequency: ContributionFrequency };
  /** Forward years to simulate. */
  horizonYears: number;
  /** Number of paths to sample (typical 500–2000). */
  numSimulations: number;
  /** Optional goal value to compute P(reaching goal). */
  goalAmount?: number;
}

export interface PercentileBand {
  /** Months from start (0..N). */
  monthIndex: number;
  /** ISO month label (YYYY-MM) — projected, not real history. */
  date: string;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  /** Cumulative cash contributed by this point. */
  contributed: number;
}

export interface SimulateResult {
  bands: PercentileBand[];
  /** End-of-horizon stats. */
  median:  { endValue: number; cagr: number };
  p5:      { endValue: number; cagr: number };
  p95:     { endValue: number; cagr: number };
  totalContributed: number;
  /** Probability metrics. All are fractions in [0, 1]. */
  probabilities: {
    losing: number;        // P(end < contributed)
    doubling: number;      // P(end >= 2 × contributed)
    goal?: number;         // P(end >= goalAmount), only if goalAmount provided
  };
  /** Diagnostic — how many months of history we sampled from. */
  historicalMonths: number;
}
