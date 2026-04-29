"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Kpi, KpiBar, KpiCell } from "@/components/kpi";
import { PortfolioBuilder, type BuilderAsset } from "@/components/portfolio-builder";
import { SimulationFanChart } from "@/components/simulation-fan-chart";
import { runSimulation } from "@/lib/simulate/engine";
import { fetchPriceMatrix } from "@/lib/backtest/fetch-prices";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { SimulateResult } from "@/lib/simulate/types";
import type { ContributionFrequency } from "@/lib/backtest/types";

const today = new Date().toISOString().slice(0, 10);
const tenYearsAgo = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 10);
  return d.toISOString().slice(0, 10);
})();

const DEFAULT_PORTFOLIO: BuilderAsset[] = [
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", weight: 60 },
  { symbol: "BND", name: "Vanguard Total Bond Market", weight: 40 },
];

type Horizon = 5 | 10 | 20 | 30;
const HORIZONS: Horizon[] = [5, 10, 20, 30];

export function SimulateRunner() {
  const [assets, setAssets] = useState<BuilderAsset[]>(DEFAULT_PORTFOLIO);
  const [initialAmount, setInitialAmount] = useState("10000");
  const [contribution, setContribution] = useState("500");
  const [contributionFreq, setContributionFreq] = useState<ContributionFrequency>("monthly");
  const [horizon, setHorizon] = useState<Horizon>(10);
  const [goalAmount, setGoalAmount] = useState("");
  const [numSims, setNumSims] = useState<number>(1000);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulateResult | null>(null);

  const totalWeight = assets.reduce((s, a) => s + a.weight, 0);
  const canRun =
    assets.length > 0 &&
    Math.abs(totalWeight - 100) < 0.5 &&
    Number(initialAmount) > 0;

  const handleRun = async () => {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    try {
      const supabase = createClient();
      const matrix = await fetchPriceMatrix(supabase, {
        symbols: assets.map((a) => a.symbol),
        startDate: tenYearsAgo,
        endDate: today,
      });
      if (matrix.dates.length === 0) {
        toast.error(
          "No price data found for these assets. Run the daily ingest first.",
          { duration: 8000 },
        );
        return;
      }

      // Yield to the browser so the spinner renders before heavy compute
      await new Promise((r) => setTimeout(r, 16));

      const r = runSimulation(
        {
          assets: assets.map((a) => ({
            symbol: a.symbol,
            name: a.name,
            weight: a.weight / 100,
          })),
          initialAmount: Number(initialAmount),
          contribution: Number(contribution) > 0
            ? { amount: Number(contribution), frequency: contributionFreq }
            : undefined,
          horizonYears: horizon,
          numSimulations: numSims,
          goalAmount: Number(goalAmount) > 0 ? Number(goalAmount) : undefined,
        },
        matrix,
      );
      setResult(r);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to run simulation");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4">
        <Card className="terminal-card">
          <CardHeader className="space-y-1">
            <span className="eyebrow">Step 1</span>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioBuilder assets={assets} onChange={setAssets} />
          </CardContent>
        </Card>

        <Card className="terminal-card">
          <CardHeader className="space-y-1">
            <span className="eyebrow">Step 2</span>
            <CardTitle>Forecast parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="initial">Starting amount</Label>
              <Input
                id="initial"
                type="number"
                inputMode="decimal"
                min={0}
                step={1000}
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contrib">Contribution</Label>
                <Input
                  id="contrib"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={50}
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select
                  value={contributionFreq}
                  onValueChange={(v: string) => setContributionFreq(v as ContributionFrequency)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="eyebrow">Time horizon</Label>
              <div className="flex flex-wrap gap-2">
                {HORIZONS.map((h) => (
                  <Button
                    key={h}
                    type="button"
                    size="sm"
                    variant={horizon === h ? "default" : "outline"}
                    onClick={() => setHorizon(h)}
                  >
                    {h}y
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal">
                Goal <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="goal"
                type="number"
                inputMode="decimal"
                min={0}
                step={1000}
                placeholder="e.g. 1,000,000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll compute the probability of reaching this value.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="eyebrow">Simulations</Label>
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={numSims === n ? "default" : "outline"}
                    onClick={() => setNumSims(n)}
                  >
                    {n.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <Button size="lg" disabled={!canRun || running} onClick={handleRun} className="w-full">
              {running ? "Running…" : "Run simulation"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-4">
        {!result ? (
          <Card className="terminal-card flex h-full min-h-[420px] items-center justify-center bg-grid">
            <div className="text-center">
              <p className="eyebrow">Awaiting input</p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                Build a portfolio, set a horizon, click Run.
              </p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                We sample from {`{horizon × 12}`} months of historical returns to project a
                distribution of forward outcomes. Hypothetical, not a prediction.
              </p>
            </div>
          </Card>
        ) : (
          <SimulateResults
            result={result}
            horizon={horizon}
            goalAmount={Number(goalAmount) > 0 ? Number(goalAmount) : undefined}
          />
        )}
      </div>
    </div>
  );
}

function SimulateResults({
  result, horizon, goalAmount,
}: {
  result: SimulateResult; horizon: number; goalAmount?: number;
}) {
  const profit = result.median.endValue - result.totalContributed;
  const positive = profit >= 0;

  return (
    <>
      <KpiBar>
        <KpiCell>
          <Kpi
            label={`Median outcome · ${horizon}y`}
            value={formatCurrency(result.median.endValue)}
            delta={`${positive ? "+" : ""}${formatPercent(result.median.cagr * 100)} CAGR`}
            deltaTone={positive ? "profit" : "loss"}
            size="lg"
          />
        </KpiCell>
        <KpiCell>
          <Kpi
            label="Worst 5%"
            value={formatCurrency(result.p5.endValue)}
            delta={`${formatPercent(result.p5.cagr * 100)} CAGR`}
            size="md"
            className="text-loss"
          />
        </KpiCell>
        <KpiCell>
          <Kpi
            label="Best 5%"
            value={formatCurrency(result.p95.endValue)}
            delta={`${formatPercent(result.p95.cagr * 100)} CAGR`}
            size="md"
            className="text-profit"
          />
        </KpiCell>
        <KpiCell>
          <Kpi
            label="Total contributed"
            value={formatCurrency(result.totalContributed)}
            size="md"
          />
        </KpiCell>
      </KpiBar>

      <Card className="terminal-card">
        <CardHeader className="space-y-1">
          <CardTitle>Distribution of outcomes</CardTitle>
          <p className="text-xs text-muted-foreground">
            Shaded bands: 5–25%, 25–75% (interquartile), 75–95%. Median is the
            solid line; dashed line is cumulative contributions.
          </p>
        </CardHeader>
        <CardContent>
          <SimulationFanChart bands={result.bands} />
        </CardContent>
      </Card>

      <div className="terminal-card grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <ProbabilityCell
          label="P(losing money)"
          value={result.probabilities.losing}
          tone="loss"
          hint={`Final value < ${formatCurrency(result.totalContributed)}`}
        />
        <ProbabilityCell
          label="P(doubling money)"
          value={result.probabilities.doubling}
          tone="profit"
          hint={`Final value ≥ ${formatCurrency(result.totalContributed * 2)}`}
        />
        {goalAmount != null && result.probabilities.goal != null ? (
          <ProbabilityCell
            label={`P(reaching ${formatCurrency(goalAmount)})`}
            value={result.probabilities.goal}
            tone={result.probabilities.goal >= 0.5 ? "profit" : "neutral"}
            hint="Final value at end of horizon"
          />
        ) : (
          <div className="p-5">
            <span className="eyebrow">Set a goal</span>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter a target amount in the form to see the probability of reaching it.
            </p>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Sampled from {result.historicalMonths} months of historical returns ·{" "}
        Hypothetical · Not investment advice
      </p>
    </>
  );
}

function ProbabilityCell({
  label, value, tone, hint,
}: {
  label: string; value: number; tone: "profit" | "loss" | "neutral"; hint: string;
}) {
  const toneClass =
    tone === "profit" ? "text-profit" :
    tone === "loss"   ? "text-loss"   : "text-foreground";
  return (
    <div className="p-5">
      <span className="eyebrow">{label}</span>
      <p className={cn("display-num mt-1.5 text-3xl leading-none", toneClass)}>
        {formatPercent(value * 100, 1)}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
