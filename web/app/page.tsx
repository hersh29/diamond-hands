import Link from "next/link";
import { ArrowRight, LineChart, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiamondMark } from "@/components/diamond-mark";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid">
          <div className="container py-20 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Backtester + paper trading live · Free
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                Backtest any portfolio.{" "}
                <span className="text-gradient">Beautifully.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Build a portfolio, pick a date range, and see exactly how it would
                have performed. Side-by-side with what it cost in drawdowns to
                get there.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/backtest">Run a backtest <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/explore">Browse scenarios</Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Free. No card. Hypothetical results based on historical data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            icon={<LineChart className="h-5 w-5" />}
            title="Historical backtest"
            body="Mix any combination of US stocks, ETFs, and crypto. Lump sum or DCA. Rebalance on any schedule."
          />
          <Feature
            icon={<Wallet className="h-5 w-5" />}
            title="Paper trading"
            body="Import positions from your broker via CSV, simulate buys and sells with virtual cash, and track performance vs SPY — all without risking real money."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="Shareable scenarios"
            body="Save a backtest, get a public link with a custom preview card. No sign-up required."
          />
        </div>
      </section>

      <section className="container pb-24">
        <Card className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center gap-2 text-primary">
                <DiamondMark size={20} />
                <span className="text-xs uppercase tracking-wider">Educational tool</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                Not investment advice.
              </h2>
              <p className="mt-3 text-muted-foreground">
                DiamondHands is a research and education tool. We don&apos;t recommend
                investments — we just give you the historical evidence so you can
                explore portfolios for yourself.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                All results are hypothetical and based on adjusted-close prices.
                Past performance does not guarantee future results.
              </p>
              <Button asChild variant="link" className="mt-4 px-0">
                <Link href="/legal/disclaimer">Read the full disclaimer →</Link>
              </Button>
            </div>
            <div className="relative bg-grid border-l border-border p-8 md:p-12">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                What you can do
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Backtest any mix of US stocks, ETFs, and crypto",
                  "DCA simulation with weekly / biweekly / monthly contributions",
                  "Quarterly or annual rebalancing",
                  "CAGR, volatility, Sharpe, max drawdown",
                  "Saved scenarios with public share URLs",
                  "Browse what others are testing in /explore",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card className="p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </Card>
  );
}
