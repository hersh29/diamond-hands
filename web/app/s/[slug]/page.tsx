import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquityCurveChart } from "@/components/equity-curve-chart";
import { DrawdownChart } from "@/components/drawdown-chart";
import { MetricsGrid } from "@/components/metrics-grid";
import { displaySymbol, formatPercent } from "@/lib/utils";
import type { BacktestParams, BacktestResult } from "@/lib/backtest/types";

interface ScenarioRow {
  name: string;
  params: BacktestParams;
  results: BacktestResult | null;
  view_count: number;
  created_at: string;
}

async function loadScenario(slug: string): Promise<ScenarioRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scenarios")
    .select("name, params, results, view_count, created_at")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();
  return (data as ScenarioRow) ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const sc = await loadScenario(slug);
  if (!sc) return { title: "Scenario not found" };

  const m = sc.results?.metrics;
  const description = m
    ? `${formatPercent(m.cagr * 100)} CAGR · ${formatPercent(m.totalReturn * 100)} total return · ${formatPercent(m.maxDrawdown * 100)} max drawdown`
    : "DiamondHands backtest scenario";

  return {
    title: sc.name,
    description,
    openGraph: { title: sc.name, description },
  };
}

export default async function SharedScenarioPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const sc = await loadScenario(slug);
  if (!sc) notFound();

  const supabase = await createClient();
  await supabase.rpc("increment_scenario_view", { slug }).then(() => {}, () => {});

  const result = sc.results;
  const p = sc.params;

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-6">
        <p className="eyebrow">Shared scenario</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{sc.name}</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/80">
          Saved {new Date(sc.created_at).toLocaleDateString()} · Hypothetical results
        </p>
      </div>

      <Card className="terminal-card mb-4">
        <CardHeader className="space-y-2">
          <span className="eyebrow">Allocation</span>
          <CardTitle className="text-base">
            <div className="flex flex-wrap gap-2">
              {p.assets.map((a) => (
                <span key={a.symbol} className="rounded-md bg-secondary px-2.5 py-1 font-normal">
                  <span className="font-mono font-semibold">{displaySymbol(a.symbol)}</span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">{Math.round(a.weight * 100)}%</span>
                </span>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {p.startDate} → {p.endDate} · ${p.initialAmount.toLocaleString()} initial
            {p.contribution && ` · +$${p.contribution.amount.toLocaleString()}/${p.contribution.frequency}`}
            {p.rebalance && p.rebalance !== "never" && ` · rebalance ${p.rebalance}`}
            {p.benchmark && ` · vs ${p.benchmark}`}
          </p>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-4">
          <MetricsGrid m={result.metrics} />

          <Card className="terminal-card">
            <CardHeader>
              <CardTitle>Equity curve</CardTitle>
              <p className="text-xs text-muted-foreground">
                Hypothetical · Past performance does not predict future returns.
              </p>
            </CardHeader>
            <CardContent>
              <EquityCurveChart data={result.equityCurve} benchmarkLabel={p.benchmark} />
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
        </div>
      ) : (
        <Card className="terminal-card p-12 text-center text-muted-foreground">
          This scenario has no cached results.
        </Card>
      )}
    </div>
  );
}
