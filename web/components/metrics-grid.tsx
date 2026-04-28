import type { BacktestMetrics } from "@/lib/backtest/types";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function MetricsGrid({ m }: { m: BacktestMetrics }) {
  const profit = m.finalValue - m.totalContributed;
  const profitClass = profit >= 0 ? "text-profit" : "text-loss";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Final value"   value={formatCurrency(m.finalValue)}                                 />
      <Metric label="Total contributed" value={formatCurrency(m.totalContributed)}                       muted />
      <Metric label="Profit / loss" value={`${profit >= 0 ? "+" : ""}${formatCurrency(profit)}`}         className={profitClass} />
      <Metric label="Total return"  value={`${m.totalReturn >= 0 ? "+" : ""}${formatPercent(m.totalReturn * 100)}`} className={profitClass} />

      <Metric label="CAGR"          value={formatPercent(m.cagr * 100)}                                  />
      <Metric label="Volatility"    value={formatPercent(m.volatility * 100)}                            muted />
      <Metric label="Sharpe ratio"  value={m.sharpe.toFixed(2)}                                          muted />
      <Metric label="Max drawdown"  value={formatPercent(m.maxDrawdown * 100)}                           className="text-loss" />

      {m.bestYear && <Metric label={`Best year (${m.bestYear.year})`}   value={formatPercent(m.bestYear.return * 100)}  className="text-profit" />}
      {m.worstYear && <Metric label={`Worst year (${m.worstYear.year})`} value={formatPercent(m.worstYear.return * 100)} className="text-loss"  />}
    </div>
  );
}

function Metric({
  label, value, muted, className,
}: { label: string; value: string; muted?: boolean; className?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular ${muted ? "text-muted-foreground" : ""} ${className ?? ""}`}>
        {value}
      </div>
    </Card>
  );
}
