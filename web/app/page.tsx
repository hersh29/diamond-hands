import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LineChart, Sparkles, Wallet, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiamondMark } from "@/components/diamond-mark";

export default async function HomePage(
  { searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> },
) {
  // If Supabase redirects here with OAuth error params (when redirectTo isn't
  // allowed it falls back to Site URL), forward to /login so the user sees
  // a real error message instead of a confused landing page.
  const sp = await searchParams;
  if (sp.error || sp.error_code) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string") params.set(k, v);
    }
    redirect(`/login?${params.toString()}`);
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="bg-grid">
          <div className="container py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                <Activity className="h-3 w-3 text-primary" />
                <span>System online · v0.1</span>
                <span className="mx-1 h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span>Free tier</span>
              </div>
              <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
                Backtest. Paper trade.
                <br />
                <span className="text-gradient">Make it make sense.</span>
              </h1>
              <p className="mx-auto mt-7 max-w-xl text-base text-muted-foreground md:text-lg">
                A research terminal for long-term investors. Run any portfolio
                across 50 years of price data, simulate trades with virtual cash,
                and see exactly what every decision cost you.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="font-medium">
                  <Link href="/backtest">Run a backtest <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/explore">Browse scenarios</Link>
                </Button>
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                Free · No card · Hypothetical results
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <SectionLabel>What you can do</SectionLabel>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Feature
            icon={<LineChart className="h-5 w-5" />}
            title="Historical backtest"
            body="Mix US stocks, ETFs, and crypto. Lump sum or DCA. Rebalance on any schedule. Compare against SPY out of the box."
          />
          <Feature
            icon={<Wallet className="h-5 w-5" />}
            title="Paper trading"
            body="Import positions from your broker via CSV. Simulate buys and sells with virtual cash. Track performance vs SPY."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="Shareable scenarios"
            body="Save a backtest, get a public link with a custom preview card. Anonymous saves allowed — sign up only when you want history."
          />
        </div>
      </section>

      <section className="container pb-24">
        <Card className="terminal-card overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="border-b border-border/60 p-8 md:border-b-0 md:border-r md:p-12">
              <div className="inline-flex items-center gap-2 text-primary">
                <DiamondMark size={18} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Educational tool</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                Not investment advice.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                DiamondHands is a research and education tool. We don&apos;t recommend
                investments — we just give you the historical evidence so you can
                explore portfolios for yourself.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                All results are hypothetical and based on adjusted-close prices.
                Past performance does not guarantee future results.
              </p>
              <Button asChild variant="link" className="mt-4 px-0">
                <Link href="/legal/disclaimer">Read the full disclaimer →</Link>
              </Button>
            </div>
            <div className="bg-grid p-8 md:p-12">
              <SectionLabel>Capabilities</SectionLabel>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "Backtest any mix of US stocks, ETFs, and crypto",
                  "DCA simulation: weekly / biweekly / monthly contributions",
                  "Quarterly or annual rebalancing",
                  "CAGR, volatility, Sharpe, max drawdown, best/worst year",
                  "SPY benchmark overlay with contribution-aware comparison",
                  "Paper trading: CSV import, manual buy/sell, NAV tracking",
                  "Public share URLs with auto-generated preview cards",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{line}</span>
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card className="terminal-card p-6 transition-colors hover:border-primary/40">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </Card>
  );
}
