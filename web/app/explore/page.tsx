import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { displaySymbol, formatPercent } from "@/lib/utils";
import type { BacktestParams, BacktestResult } from "@/lib/backtest/types";

export const metadata = {
  title: "Explore scenarios",
  description: "Browse public backtest scenarios shared by the community.",
};

interface ScenarioRow {
  id: string;
  name: string;
  share_slug: string;
  view_count: number;
  created_at: string;
  params: BacktestParams;
  results: BacktestResult | null;
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("scenarios")
    .select("id, name, share_slug, view_count, created_at, params, results")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(48);

  const scenarios = (data ?? []) as ScenarioRow[];

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Explore</h1>
          <p className="mt-2 text-muted-foreground">Public scenarios shared by other users.</p>
        </div>
        <Button asChild><Link href="/backtest">New backtest</Link></Button>
      </div>

      {scenarios.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">No public scenarios yet. Be the first.</p>
            <Button asChild className="mt-4"><Link href="/backtest">Run a backtest</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => {
            const m = s.results?.metrics;
            const positive = (m?.totalReturn ?? 0) >= 0;
            return (
              <Link key={s.id} href={`/s/${s.share_slug}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-2">{s.name}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-1">
                      {s.params.assets.slice(0, 4).map((a) => (
                        <span key={a.symbol} className="font-mono text-xs">
                          {Math.round(a.weight * 100)}% {displaySymbol(a.symbol)}
                        </span>
                      ))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-baseline justify-between">
                    {m ? (
                      <>
                        <span className={`text-xl font-semibold tabular ${positive ? "text-profit" : "text-loss"}`}>
                          {positive ? "+" : ""}{formatPercent(m.totalReturn * 100)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatPercent(m.cagr * 100)} CAGR
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No cached results</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
