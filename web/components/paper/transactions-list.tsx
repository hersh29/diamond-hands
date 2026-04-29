import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displaySymbol, formatCurrency } from "@/lib/utils";
import type { PaperTransaction } from "@/lib/paper/types";

const LABEL: Record<PaperTransaction["type"], string> = {
  buy: "Buy",
  sell: "Sell",
  deposit: "Deposit",
  withdraw: "Withdraw",
  dividend: "Dividend",
};

const COLOR: Record<PaperTransaction["type"], string> = {
  buy: "text-foreground",
  sell: "text-foreground",
  deposit: "text-profit",
  withdraw: "text-loss",
  dividend: "text-profit",
};

export function TransactionsList({ transactions }: { transactions: PaperTransaction[] }) {
  return (
    <Card className="terminal-card">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-2 text-left">Date</th>
                    <th className="px-6 py-2 text-left">Type</th>
                    <th className="px-6 py-2 text-left">Asset</th>
                    <th className="px-6 py-2 text-right">Shares</th>
                    <th className="px-6 py-2 text-right">Price</th>
                    <th className="px-6 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const tradeAmount = t.shares != null && t.price != null ? t.shares * t.price : null;
                    return (
                      <tr key={t.id} className="border-b border-border/40 last:border-b-0">
                        <td className="px-6 py-2 text-muted-foreground">{new Date(t.executed_at).toLocaleDateString()}</td>
                        <td className={`px-6 py-2 ${COLOR[t.type]}`}>{LABEL[t.type]}</td>
                        <td className="px-6 py-2 font-mono">{t.symbol ? displaySymbol(t.symbol) : "—"}</td>
                        <td className="px-6 py-2 text-right tabular">{t.shares != null ? t.shares.toFixed(4) : "—"}</td>
                        <td className="px-6 py-2 text-right tabular">{t.price != null ? formatCurrency(t.price) : "—"}</td>
                        <td className="px-6 py-2 text-right tabular">
                          {tradeAmount != null
                            ? formatCurrency(tradeAmount)
                            : t.cash_amount != null
                              ? formatCurrency(t.cash_amount)
                              : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-border/40 md:hidden">
              {transactions.map((t) => {
                const tradeAmount = t.shares != null && t.price != null ? t.shares * t.price : null;
                const amount = tradeAmount != null ? tradeAmount : t.cash_amount;
                return (
                  <li key={t.id} className="px-5 py-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${COLOR[t.type]}`}>
                          {LABEL[t.type]}
                        </span>
                        {t.symbol && (
                          <span className="font-mono text-sm font-semibold">{displaySymbol(t.symbol)}</span>
                        )}
                      </div>
                      <span className="display-num text-sm">
                        {amount != null ? formatCurrency(amount) : "—"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(t.executed_at).toLocaleDateString()}</span>
                      {t.shares != null && t.price != null && (
                        <span className="tabular">
                          {t.shares.toFixed(4)} @ {formatCurrency(t.price)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
