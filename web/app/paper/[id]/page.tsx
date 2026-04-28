import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoldingsTable } from "@/components/paper/holdings-table";
import { TransactionsList } from "@/components/paper/transactions-list";
import { NavChart } from "@/components/paper/nav-chart";
import { ImportButton } from "@/components/paper/import-button";
import { DeletePortfolioButton } from "@/components/paper/delete-portfolio-button";
import { fetchPriceMatrix } from "@/lib/backtest/fetch-prices";
import { computeNavSeries } from "@/lib/paper/nav";
import { buildHoldings, deriveState, summarize, type AssetMeta } from "@/lib/paper/compute";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { PaperTransaction } from "@/lib/paper/types";

const BENCHMARK = "SPY";

export const metadata = { title: "Paper portfolio" };

export default async function PaperDetailPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/paper/${id}`);

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, name, created_at, user_id, type")
    .eq("id", id)
    .single();
  if (!portfolio || portfolio.user_id !== user.id || portfolio.type !== "paper") {
    notFound();
  }

  // Pull all transactions
  const { data: txnsRaw } = await supabase
    .from("transactions")
    .select("id, type, asset_id, shares, price, cash_amount, fees, executed_at, notes")
    .eq("portfolio_id", id)
    .order("executed_at", { ascending: true });

  const txnRows = txnsRaw ?? [];
  const assetIds = Array.from(new Set(txnRows.map((t) => t.asset_id).filter((x): x is number => x != null)));

  // Pull asset metadata + latest prices in parallel
  const [{ data: assets }, latestPrices] = await Promise.all([
    assetIds.length > 0
      ? supabase
          .from("assets")
          .select("id, symbol, name, last_price_date")
          .in("id", assetIds)
      : Promise.resolve({ data: [] as { id: number; symbol: string; name: string; last_price_date: string | null }[] }),
    fetchLatestPrices(supabase, assetIds),
  ]);

  const assetMetaList: AssetMeta[] = (assets ?? []).map((a) => ({
    asset_id: a.id,
    symbol: a.symbol,
    name: a.name,
    latest_price: latestPrices.get(a.id) ?? null,
  }));
  const symbolByAssetId: Record<number, string> = Object.fromEntries(
    assetMetaList.map((a) => [a.asset_id, a.symbol]),
  );
  const assetIdByTxn: Record<string, number> = Object.fromEntries(
    txnRows.filter((t) => t.asset_id != null).map((t) => [t.id, t.asset_id as number]),
  );

  // Derive holdings + cash
  const transactions: PaperTransaction[] = txnRows.map((t) => ({
    id: t.id,
    type: t.type,
    symbol: t.asset_id != null ? symbolByAssetId[t.asset_id] ?? null : null,
    shares: t.shares != null ? Number(t.shares) : null,
    price:  t.price  != null ? Number(t.price)  : null,
    cash_amount: t.cash_amount != null ? Number(t.cash_amount) : null,
    executed_at: t.executed_at,
    fees: Number(t.fees ?? 0),
    notes: t.notes,
  }));

  const { cashBalance, positions, totalContributed } = deriveState(transactions, assetIdByTxn);
  const holdings = buildHoldings(positions, assetMetaList);
  const summary  = summarize(cashBalance, holdings, totalContributed);

  // Build NAV series for the chart
  const earliestDate = transactions.length > 0
    ? transactions[0].executed_at.slice(0, 10)
    : portfolio.created_at.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const symbolsForMatrix = [
    ...new Set(assetMetaList.map((a) => a.symbol).concat([BENCHMARK])),
  ];
  const matrix = symbolsForMatrix.length > 0
    ? await fetchPriceMatrix(supabase, {
        symbols: symbolsForMatrix,
        startDate: earliestDate,
        endDate: today,
      })
    : { dates: [], prices: {} };

  const navSeries = computeNavSeries({
    transactions,
    assetIdByTxn,
    symbolByAssetId,
    matrix,
    benchmarkSymbol: matrix.prices[BENCHMARK] ? BENCHMARK : undefined,
  });

  const positive = summary.totalReturn >= 0;

  return (
    <div className="container py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/paper" className="text-xs text-muted-foreground hover:text-foreground">
            ← Paper portfolios
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{portfolio.name}</h1>
          <p className="text-sm text-muted-foreground">
            Hypothetical only · Created {new Date(portfolio.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <ImportButton portfolioId={id} />
          <DeletePortfolioButton portfolioId={id} portfolioName={portfolio.name} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <SummaryCard label="Total value"  value={formatCurrency(summary.totalValue)} />
        <SummaryCard label="Market value" value={formatCurrency(summary.marketValue)} muted />
        <SummaryCard label="Cash"         value={formatCurrency(summary.cashBalance)}   muted />
        <SummaryCard
          label="Total return"
          value={`${positive ? "+" : ""}${formatCurrency(summary.totalReturn)} (${positive ? "+" : ""}${formatPercent(summary.totalReturnPct)})`}
          className={positive ? "text-profit" : "text-loss"}
        />
      </div>

      {navSeries.length > 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <p className="text-xs text-muted-foreground">
              Daily NAV vs SPY (assuming the same cash flow had been deposited into SPY).
            </p>
          </CardHeader>
          <CardContent>
            <NavChart data={navSeries} benchmarkLabel={BENCHMARK} />
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-6">
        <HoldingsTable
          portfolioId={id}
          cashBalance={summary.cashBalance}
          holdings={holdings}
        />
        <TransactionsList
          transactions={[...transactions].reverse()}
        />
      </div>

      <div className="mt-10 rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        Hypothetical results. Past performance does not predict future returns. Not investment advice.
      </div>
    </div>
  );
}

async function fetchLatestPrices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assetIds: number[],
): Promise<Map<number, number>> {
  if (assetIds.length === 0) return new Map();
  // For each asset, pull its most recent adj_close.
  // Single-query approach: fetch a window and pick max-date per asset client-side.
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const sinceISO = since.toISOString().slice(0, 10);

  const { data } = await supabase
    .from("asset_prices")
    .select("asset_id, date, adj_close")
    .in("asset_id", assetIds)
    .gte("date", sinceISO)
    .order("date", { ascending: false });

  const latest = new Map<number, number>();
  for (const row of data ?? []) {
    if (!latest.has(row.asset_id as number)) {
      latest.set(row.asset_id as number, Number(row.adj_close));
    }
  }
  return latest;
}

function SummaryCard({
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

