"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PortfolioBuilder, type BuilderAsset } from "@/components/portfolio-builder";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { DrawdownChart } from "@/components/drawdown-chart";
import { MetricsGrid } from "@/components/metrics-grid";
import { runBacktest } from "@/lib/backtest/engine";
import { fetchPriceMatrix } from "@/lib/backtest/fetch-prices";
import { createClient } from "@/lib/supabase/client";
import type {
  BacktestParams,
  BacktestResult,
  ContributionFrequency,
  RebalanceFrequency,
} from "@/lib/backtest/types";

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

const BENCHMARK_SYMBOL = "SPY";

export function BacktestRunner() {
  const router = useRouter();
  const [assets, setAssets] = useState<BuilderAsset[]>(DEFAULT_PORTFOLIO);
  const [startDate, setStartDate] = useState(tenYearsAgo);
  const [endDate, setEndDate] = useState(today);
  const [initialAmount, setInitialAmount] = useState("10000");
  const [contributionAmount, setContributionAmount] = useState("0");
  const [contributionFreq, setContributionFreq] = useState<ContributionFrequency>("monthly");
  const [rebalance, setRebalance] = useState<RebalanceFrequency>("annually");
  const [compareBenchmark, setCompareBenchmark] = useState(true);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [params, setParams] = useState<BacktestParams | null>(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savePending, startSaveTransition] = useTransition();

  const totalWeight = assets.reduce((s, a) => s + a.weight, 0);
  const canRun = assets.length > 0
    && Math.abs(totalWeight - 100) < 0.5
    && Number(initialAmount) > 0
    && startDate < endDate;

  const handleRun = async () => {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    try {
      const supabase = createClient();
      const wantBenchmark = compareBenchmark
        && !assets.some((a) => a.symbol === BENCHMARK_SYMBOL);
      const symbols = [...new Set([
        ...assets.map((a) => a.symbol),
        ...(wantBenchmark ? [BENCHMARK_SYMBOL] : []),
      ])];

      const matrix = await fetchPriceMatrix(supabase, {
        symbols,
        startDate,
        endDate,
      });
      if (matrix.dates.length === 0) {
        // Empty matrix usually means the daily price ingest hasn't run yet.
        // Give the user something useful to do about it.
        toast.error(
          "No price data found. The daily ingest may not have populated prices yet — check the GitHub Actions tab.",
          { duration: 8000 },
        );
        return;
      }

      const contrib = Number(contributionAmount) > 0
        ? { amount: Number(contributionAmount), frequency: contributionFreq }
        : undefined;

      const p: BacktestParams = {
        assets: assets.map((a) => ({
          symbol: a.symbol,
          name: a.name,
          weight: a.weight / 100,
        })),
        startDate,
        endDate,
        initialAmount: Number(initialAmount),
        contribution: contrib,
        rebalance,
        ...(wantBenchmark ? { benchmark: BENCHMARK_SYMBOL } : {}),
      };

      const r = runBacktest(p, matrix);
      setResult(r);
      setParams(p);
      setSaveName(buildDefaultName(assets, startDate, endDate));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to run backtest";
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!params || !result) return;
    startSaveTransition(async () => {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveName.trim() || "Untitled scenario",
          params,
          results: result,
          isPublic: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Failed to save");
        return;
      }
      const json = await res.json();
      setSaveOpen(false);
      toast.success("Saved!");
      router.push(`/s/${json.slug}`);
    });
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
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} max={today} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End date</Label>
                <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} max={today} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Initial amount</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
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
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select value={contributionFreq} onValueChange={(v: string) => setContributionFreq(v as ContributionFrequency)}>
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
              <Label>Rebalance</Label>
              <Select value={rebalance} onValueChange={(v: string) => setRebalance(v as RebalanceFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background accent-primary"
                checked={compareBenchmark}
                onChange={(e) => setCompareBenchmark(e.target.checked)}
              />
              <span>Compare against SPY (S&amp;P 500)</span>
            </label>

            <Button className="w-full" size="lg" disabled={!canRun || running} onClick={handleRun}>
              {running ? "Running…" : "Run backtest"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-4">
        {!result ? (
          <Card className="terminal-card flex h-full min-h-[420px] items-center justify-center bg-grid">
            <div className="text-center">
              <p className="eyebrow">Awaiting input</p>
              <p className="mt-3 text-lg font-semibold tracking-tight">Build a portfolio, click Run.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Results render here. Hypothetical, based on adjusted-close prices.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <MetricsGrid m={result.metrics} />

            <Card className="terminal-card">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Equity curve</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hypothetical · Past performance does not predict future returns.
                  </p>
                </div>
                <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Save & share</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save scenario</DialogTitle>
                      <DialogDescription>
                        Get a public link you can share. Anyone with the link can view it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Label htmlFor="scenario-name">Name</Label>
                      <Input
                        id="scenario-name"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        autoFocus
                        maxLength={120}
                      />
                      <Button className="w-full" disabled={savePending} onClick={handleSave}>
                        {savePending ? "Saving…" : "Save & open"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <EquityCurveChart
                  data={result.equityCurve}
                  benchmarkLabel={params?.benchmark ? "SPY" : undefined}
                />
              </CardContent>
            </Card>

            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-base">Drawdown</CardTitle>
                <p className="text-xs text-muted-foreground">Peak-to-trough decline over time.</p>
              </CardHeader>
              <CardContent>
                <DrawdownChart data={result.drawdown} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function buildDefaultName(assets: BuilderAsset[], start: string, end: string): string {
  const top = [...assets].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const label = top.map((a) => `${Math.round(a.weight)}% ${a.symbol.replace("-USD", "")}`).join(" / ");
  return `${label} · ${start.slice(0, 4)}–${end.slice(0, 4)}`;
}
