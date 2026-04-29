import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

interface Props {
  yearly: { year: number; return: number }[];
  title?: string;
}

/**
 * Year-by-year return breakdown with a small visual bar so positive/negative
 * years pop. Used in Basic mode and optionally in Advanced.
 */
export function YearlyReturnsTable({ yearly, title = "Yearly returns" }: Props) {
  if (yearly.length === 0) return null;

  const maxAbs = Math.max(...yearly.map((y) => Math.abs(y.return))) || 1;

  return (
    <Card className="terminal-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/40">
          {yearly.map((y) => {
            const positive = y.return >= 0;
            const widthPct = (Math.abs(y.return) / maxAbs) * 50; // 0-50% from center
            return (
              <li key={y.year} className="flex items-center gap-4 px-6 py-2.5">
                <span className="font-mono text-sm w-12 shrink-0 text-muted-foreground">{y.year}</span>
                <div className="relative flex-1 h-1.5">
                  <div className="absolute left-1/2 top-0 h-full w-px bg-border/60" />
                  {positive ? (
                    <div
                      className="absolute left-1/2 top-0 h-full bg-profit/40 rounded-r-sm"
                      style={{ width: `${widthPct}%` }}
                    />
                  ) : (
                    <div
                      className="absolute right-1/2 top-0 h-full bg-loss/40 rounded-l-sm"
                      style={{ width: `${widthPct}%` }}
                    />
                  )}
                </div>
                <span
                  className={`tabular text-sm font-medium w-20 text-right shrink-0 ${
                    positive ? "text-profit" : "text-loss"
                  }`}
                >
                  {positive ? "+" : ""}{formatPercent(y.return * 100)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
