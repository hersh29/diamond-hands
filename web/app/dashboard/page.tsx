import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisclaimerModal } from "@/components/disclaimer-modal";
import { Kpi, KpiBar, KpiCell } from "@/components/kpi";
import { LineChart, Wallet, Plus, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, disclaimer_accepted_at, plan")
    .eq("id", user.id)
    .single();

  const [{ data: scenarios }, { data: paperPortfolios }] = await Promise.all([
    supabase
      .from("scenarios")
      .select("id, name, share_slug, created_at, results")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("portfolios")
      .select("id, name, created_at")
      .eq("user_id", user.id)
      .eq("type", "paper")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const paperCount = paperPortfolios?.length ?? 0;
  const scenarioCount = scenarios?.length ?? 0;
  const greeting = profile?.display_name?.split(" ")[0] ?? "investor";

  return (
    <>
      <DisclaimerModal
        initialAccepted={Boolean(profile?.disclaimer_accepted_at)}
        userId={user.id}
      />

      <div className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Console · {profile?.plan?.toUpperCase() ?? "FREE"}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Hello, <span className="text-gradient">{greeting}</span>.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved scenarios and paper portfolios.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/paper/new">New paper portfolio</Link>
            </Button>
            <Button asChild>
              <Link href="/backtest">New backtest</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <KpiBar>
            <KpiCell><Kpi label="Scenarios"        value={String(scenarioCount)} size="lg" /></KpiCell>
            <KpiCell><Kpi label="Paper portfolios" value={String(paperCount)}    size="lg" /></KpiCell>
            <KpiCell><Kpi label="Plan"             value="Free"                  size="lg" hint="No paywall yet" /></KpiCell>
            <KpiCell><Kpi label="Universe"         value="500+"                  size="lg" hint="Tickers + ETFs + crypto" /></KpiCell>
          </KpiBar>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <Section
            title="Paper portfolios"
            href="/paper"
            empty={
              <EmptyState
                icon={<Wallet className="h-6 w-6" />}
                line="No paper portfolios yet."
                cta={{ label: "Create one", href: "/paper/new" }}
              />
            }
            isEmpty={paperCount === 0}
          >
            {paperPortfolios?.map((p) => (
              <Link key={p.id} href={`/paper/${p.id}`}>
                <Card className="terminal-card transition-colors hover:border-primary/50">
                  <CardHeader className="space-y-1">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{p.name}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>
                      Created {new Date(p.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </Section>

          <Section
            title="Recent scenarios"
            href={null}
            empty={
              <EmptyState
                icon={<LineChart className="h-6 w-6" />}
                line="No scenarios saved yet."
                cta={{ label: "Run your first backtest", href: "/backtest" }}
              />
            }
            isEmpty={scenarioCount === 0}
          >
            {scenarios?.map((s) => {
              const totalReturn = (s.results as { metrics?: { totalReturn: number } } | null)?.metrics?.totalReturn;
              const finalValue  = (s.results as { metrics?: { finalValue: number  } } | null)?.metrics?.finalValue;
              const positive = (totalReturn ?? 0) >= 0;
              return (
                <Link
                  key={s.id}
                  href={`/s/${s.share_slug}`}
                  className="block transition-colors"
                >
                  <Card className="terminal-card transition-colors hover:border-primary/50">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <CardDescription>
                        {new Date(s.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-baseline justify-between">
                      {finalValue != null && (
                        <span className="display-num text-lg">{formatCurrency(finalValue)}</span>
                      )}
                      {totalReturn != null && (
                        <span className={`text-sm tabular font-medium ${positive ? "text-profit" : "text-loss"}`}>
                          {positive ? "+" : ""}{formatPercent(totalReturn * 100)}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  href,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  href: string | null;
  empty: React.ReactNode;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="eyebrow">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-muted-foreground hover:text-primary">
            View all →
          </Link>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {isEmpty ? empty : children}
      </div>
    </section>
  );
}

function EmptyState({
  icon,
  line,
  cta,
}: {
  icon: React.ReactNode;
  line: string;
  cta: { label: string; href: string };
}) {
  return (
    <Card className="terminal-card">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-muted-foreground">{icon}</div>
        <p className="mt-3 text-sm text-muted-foreground">{line}</p>
        <Button asChild size="sm" className="mt-4">
          <Link href={cta.href}><Plus className="h-4 w-4" /> {cta.label}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
