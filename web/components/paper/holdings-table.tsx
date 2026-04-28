"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TradeDialog } from "@/components/paper/trade-dialog";
import { displaySymbol, formatCurrency, formatPercent } from "@/lib/utils";
import type { PaperHolding } from "@/lib/paper/types";

interface Props {
  portfolioId: string;
  cashBalance: number;
  holdings: PaperHolding[];
}

export function HoldingsTable({ portfolioId, cashBalance, holdings }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialAsset, setInitialAsset] = useState<{ symbol: string; name: string } | undefined>();
  const [initialTab, setInitialTab] = useState<"buy" | "sell">("buy");
  const [maxShares, setMaxShares] = useState<number | undefined>();

  const openSell = (h: PaperHolding) => {
    setInitialAsset({ symbol: h.symbol, name: h.name });
    setInitialTab("sell");
    setMaxShares(h.shares);
    setDialogOpen(true);
  };
  const openBuyMore = (h: PaperHolding) => {
    setInitialAsset({ symbol: h.symbol, name: h.name });
    setInitialTab("buy");
    setMaxShares(undefined);
    setDialogOpen(true);
  };
  const openTrade = () => {
    setInitialAsset(undefined);
    setInitialTab("buy");
    setMaxShares(undefined);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Holdings</CardTitle>
          <Button size="sm" onClick={openTrade}>New transaction</Button>
        </CardHeader>
        <CardContent className="p-0">
          {holdings.length === 0 ? (
            <div className="px-6 pb-6 text-sm text-muted-foreground">
              No holdings yet. Click <span className="font-semibold">New transaction</span> to record a buy, or import a CSV from your broker.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-2 text-left">Asset</th>
                    <th className="px-6 py-2 text-right">Shares</th>
                    <th className="px-6 py-2 text-right">Avg cost</th>
                    <th className="px-6 py-2 text-right">Last price</th>
                    <th className="px-6 py-2 text-right">Market value</th>
                    <th className="px-6 py-2 text-right">Unrealized</th>
                    <th className="px-6 py-2 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const positive = (h.unrealized_pnl ?? 0) >= 0;
                    return (
                      <tr key={h.asset_id} className="border-b border-border/60 last:border-b-0 hover:bg-secondary/30">
                        <td className="px-6 py-3">
                          <div className="font-mono font-semibold">{displaySymbol(h.symbol)}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">{h.name}</div>
                        </td>
                        <td className="px-6 py-3 text-right tabular">{h.shares.toFixed(4)}</td>
                        <td className="px-6 py-3 text-right tabular">{formatCurrency(h.cost_basis)}</td>
                        <td className="px-6 py-3 text-right tabular">{h.current_price != null ? formatCurrency(h.current_price) : "—"}</td>
                        <td className="px-6 py-3 text-right tabular">{h.market_value != null ? formatCurrency(h.market_value) : "—"}</td>
                        <td className={`px-6 py-3 text-right tabular ${positive ? "text-profit" : "text-loss"}`}>
                          {h.unrealized_pnl != null && (
                            <>
                              {positive ? "+" : ""}{formatCurrency(h.unrealized_pnl)}
                              <div className="text-xs">
                                {positive ? "+" : ""}{formatPercent(h.unrealized_pnl_pct ?? 0)}
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openBuyMore(h)}>Buy</Button>
                            <Button size="sm" variant="outline" onClick={() => openSell(h)}>Sell</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TradeDialog
        portfolioId={portfolioId}
        cashBalance={cashBalance}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialAsset={initialAsset}
        initialTab={initialTab}
        maxShares={maxShares}
      />
    </>
  );
}
