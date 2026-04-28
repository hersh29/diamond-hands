import type { BacktestMetrics } from "@/lib/backtest/types";
import { Kpi, KpiBar, KpiCell } from "@/components/kpi";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function MetricsGrid({ m }: { m: BacktestMetrics }) {
  const profit = m.finalValue - m.totalContributed;
  const profitPositive = profit >= 0;
  const benchmarkDelta =
    m.benchmarkFinalValue != null ? m.finalValue - m.benchmarkFinalValue : null;
  const beatsBenchmark = benchmarkDelta != null && benchmarkDelta > 0;

  return (
    <div className="space-y-3">
      {/* Hero KPI bar — the four most important numbers */}
      <KpiBar>
        <KpiCell>
          <Kpi label="Final value" value={formatCurrency(m.finalValue)} size="lg" />
        </KpiCell>
        <KpiCell>
          <Kpi
            label="Total return"
            value={`${profitPositive ? "+" : ""}${formatPercent(m.totalReturn * 100)}`}
            delta={`${profitPositive ? "+" : ""}${formatCurrency(profit)}`}
            deltaTone={profitPositive ? "profit" : "loss"}
            size="lg"
            className={profitPositive ? "text-profit" : "text-loss"}
          />
        </KpiCell>
        <KpiCell>
          <Kpi label="CAGR" value={formatPercent(m.cagr * 100)} size="lg" />
        </KpiCell>
        <KpiCell>
          <Kpi
            label="Max drawdown"
            value={formatPercent(m.maxDrawdown * 100)}
            size="lg"
            className="text-loss"
          />
        </KpiCell>
      </KpiBar>

      {/* Secondary stats — denser, smaller */}
      <div className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
        <SmallStat label="Contributed"   value={formatCurrency(m.totalContributed)} />
        <SmallStat label="Volatility"    value={formatPercent(m.volatility * 100)} />
        <SmallStat label="Sharpe"        value={m.sharpe.toFixed(2)} />
        <SmallStat
          label="Best year"
          value={m.bestYear ? `${formatPercent(m.bestYear.return * 100)}` : "—"}
          hint={m.bestYear ? String(m.bestYear.year) : undefined}
          tone="profit"
        />
      </div>

      <div className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
        <SmallStat
          label="Worst year"
          value={m.worstYear ? `${formatPercent(m.worstYear.return * 100)}` : "—"}
          hint={m.worstYear ? String(m.worstYear.year) : undefined}
          tone="loss"
        />
        {m.benchmarkFinalValue != null ? (
          <>
            <SmallStat
              label="vs SPY"
              value={`${beatsBenchmark ? "+" : ""}${formatCurrency(benchmarkDelta!)}`}
              tone={beatsBenchmark ? "profit" : "loss"}
            />
            <SmallStat
              label="SPY CAGR"
              value={m.benchmarkCagr != null ? formatPercent(m.benchmarkCagr * 100) : "—"}
            />
            <SmallStat
              label="Alpha (CAGR)"
              value={m.benchmarkCagr != null
                ? `${m.cagr - m.benchmarkCagr >= 0 ? "+" : ""}${formatPercent((m.cagr - m.benchmarkCagr) * 100)}`
                : "—"}
              tone={m.benchmarkCagr != null && m.cagr > m.benchmarkCagr ? "profit" : "loss"}
            />
          </>
        ) : (
          <>
            <SmallStat label="vs benchmark" value="—" />
            <SmallStat label="Alpha"        value="—" />
            <SmallStat label="Beta"         value="—" />
          </>
        )}
      </div>
    </div>
  );
}

function SmallStat({
  label, value, hint, tone,
}: {
  label: string; value: string; hint?: string; tone?: "profit" | "loss";
}) {
  const toneClass =
    tone === "profit" ? "text-profit" :
    tone === "loss"   ? "text-loss"   : "";
  return (
    <div className="p-4">
      <div className="eyebrow">{label}</div>
      <div className={`mt-1 text-base font-semibold tabular ${toneClass}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">{hint}</div>}
    </div>
  );
}

