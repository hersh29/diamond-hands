"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetSearch } from "@/components/asset-search";
import { Kpi, KpiBar, KpiCell } from "@/components/kpi";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { YearlyReturnsTable } from "@/components/yearly-returns-table";
import { runBacktest, computeYearlyReturns } from "@/lib/backtest/engine";
import { fetchPriceMatrix } from "@/lib/backtest/fetch-prices";
import { createClient } from "@/lib/supabase/client";
import { displaySymbol, formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { BacktestResult } from "@/lib/backtest/types";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2014;
const QUICK_PRESETS = [5, 10, 15, 20] as const;

interface Asset {
  symbol: string;
  name: string;
}

const DEFAULT_ASSET: Asset = { symbol: "VOO", name: "Vanguard S&P 500 ETF" };

export function BacktestRunnerBasic() {
  const [amount, setAmount] = useState("10000");
  const [asset, setAsset] = useState<Asset>(DEFAULT_ASSET);
  const [year, setYear] = useState(CURRENT_YEAR - 10);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const yearOk = year >= MIN_YEAR && year <= CURRENT_YEAR - 1;
  const amountOk = Number(amount) > 0;
  const canRun = yearOk && amountOk && !!asset.symbol;

  const handleRun = async () => {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    try {
      const supabase = createClient();
      const startDate = `${year}-01-02`;
      const endDate = new Date().toISOString().slice(0, 10);

      const matrix = await fetchPriceMatrix(supabase, {
        symbols: [asset.symbol],
        startDate,
        endDate,
      });
      if (matrix.dates.length === 0) {
        toast.error(`No price data for ${displaySymbol(asset.symbol)} starting in ${year}.`);
        return;
      }

      const r = runBacktest(
        {
          assets: [{ symbol: asset.symbol, name: asset.name, weight: 1 }],
          startDate,
          endDate,
          initialAmount: Number(amount),
          rebalance: "never",
        },
        matrix,
      );
      setResult(r);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to run backtest");
    } finally {
      setRunning(false);
    }
  };

  const yearly = result ? computeYearlyReturns(result.equityCurve) : [];
  const positive = (result?.metrics.totalReturn ?? 0) >= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card className="terminal-card h-fit">
        <CardHeader className="space-y-1">
          <span className="eyebrow">Basic</span>
          <CardTitle>What if I&apos;d invested…</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount" className="eyebrow">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 text-lg tabular"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="eyebrow">In</Label>
            <div className="rounded-md border border-input bg-background p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold">{displaySymbol(asset.symbol)}</div>
                  <div className="truncate text-xs text-muted-foreground">{asset.name}</div>
                </div>
                <div className="ml-3">
                  <AssetSearch
                    onPick={(picked) => setAsset({ symbol: picked.symbol, name: picked.name })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="eyebrow">Starting</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((y) => {
                const presetYear = CURRENT_YEAR - y;
                const isPickable = presetYear >= MIN_YEAR;
                if (!isPickable) return null;
                return (
                  <Button
                    key={y}
                    type="button"
                    size="sm"
                    variant={year === presetYear ? "default" : "outline"}
                    onClick={() => setYear(presetYear)}
                  >
                    {y}y ago
                  </Button>
                );
              })}
              <Input
                type="number"
                value={year}
                min={MIN_YEAR}
                max={CURRENT_YEAR - 1}
                onChange={(e) => setYear(Number(e.target.value))}
                className={cn("w-24 tabular", !yearOk && "border-destructive")}
              />
            </div>
            {!yearOk && (
              <p className="text-xs text-loss">
                Pick a year between {MIN_YEAR} and {CURRENT_YEAR - 1}.
              </p>
            )}
          </div>

          <Button size="lg" disabled={!canRun || running} onClick={handleRun} className="w-full">
            {running ? "Running…" : "Calculate"}
          </Button>
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-4">
        {!result ? (
          <Card className="terminal-card flex h-full min-h-[420px] items-center justify-center bg-grid">
            <div className="text-center">
              <p className="eyebrow">Awaiting input</p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                Pick an amount, asset, and starting year.
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We&apos;ll show you what your investment would be worth today.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <Card className="terminal-card">
              <CardContent className="p-6 md:p-8">
                <p className="eyebrow">You&apos;d have today</p>
                <p
                  className={cn(
                    "display-num mt-2 text-4xl leading-none md:text-6xl",
                    positive ? "text-foreground" : "text-loss",
                  )}
                >
                  {formatCurrency(result.metrics.finalValue)}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  From{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(result.metrics.initialAmount)}
                  </span>{" "}
                  invested in{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {displaySymbol(asset.symbol)}
                  </span>{" "}
                  in <span className="font-mono font-semibold text-foreground">{year}</span>.
                </p>
              </CardContent>
            </Card>

            <KpiBar>
              <KpiCell>
                <Kpi
                  label="Total return"
                  value={`${positive ? "+" : ""}${formatPercent(result.metrics.totalReturn * 100)}`}
                  size="lg"
                  className={positive ? "text-profit" : "text-loss"}
                />
              </KpiCell>
              <KpiCell>
                <Kpi label="CAGR (year-over-year)" value={formatPercent(result.metrics.cagr * 100)} size="lg" />
              </KpiCell>
              <KpiCell>
                <Kpi
                  label="Best year"
                  value={result.metrics.bestYear ? formatPercent(result.metrics.bestYear.return * 100) : "—"}
                  hint={result.metrics.bestYear ? String(result.metrics.bestYear.year) : undefined}
                  size="lg"
                  className="text-profit"
                />
              </KpiCell>
              <KpiCell>
                <Kpi
                  label="Worst year"
                  value={result.metrics.worstYear ? formatPercent(result.metrics.worstYear.return * 100) : "—"}
                  hint={result.metrics.worstYear ? String(result.metrics.worstYear.year) : undefined}
                  size="lg"
                  className="text-loss"
                />
              </KpiCell>
            </KpiBar>

            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-base">Equity curve</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Hypothetical · Past performance does not predict future returns.
                </p>
              </CardHeader>
              <CardContent>
                <EquityCurveChart data={result.equityCurve} />
              </CardContent>
            </Card>

            <YearlyReturnsTable yearly={yearly} />
          </>
        )}
      </div>
    </div>
  );
}
