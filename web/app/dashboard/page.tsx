import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisclaimerModal } from "@/components/disclaimer-modal";
import { LineChart, Wallet, Sparkles, Plus } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("disclaimer_accepted_at")
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

  return (
    <>
      <DisclaimerModal
        initialAccepted={Boolean(profile?.disclaimer_accepted_at)}
        userId={user.id}
      />

      <div className="container py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Your dashboard</h1>
            <p className="text-muted-foreground">Saved scenarios and paper portfolios.</p>
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

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<LineChart className="h-5 w-5" />} title="Saved scenarios" value={scenarioCount} />
          <FeatureCard icon={<Wallet     className="h-5 w-5" />} title="Paper portfolios" value={paperCount} />
          <FeatureCard icon={<Sparkles   className="h-5 w-5" />} title="Plan"             value="Free" muted="No paywall yet" />
        </div>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Paper portfolios</h2>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/paper">View all →</Link>
            </Button>
          </div>

          {paperCount === 0 ? (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Wallet className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">No paper portfolios yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/paper/new"><Plus className="h-4 w-4" /> Create one</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {paperPortfolios!.map((p) => (
                <Link key={p.id} href={`/paper/${p.id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardHeader>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(p.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Recent scenarios</h2>

          {scenarioCount === 0 ? (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <LineChart className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">No scenarios saved yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/backtest">Run your first backtest</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {scenarios!.map((s) => {
                const totalReturn = (s.results as { metrics?: { totalReturn: number } } | null)?.metrics?.totalReturn;
                const finalValue  = (s.results as { metrics?: { finalValue: number  } } | null)?.metrics?.finalValue;
                return (
                  <Link
                    key={s.id}
                    href={`/s/${s.share_slug}`}
                    className="block transition-colors hover:border-primary"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{s.name}</CardTitle>
                        <CardDescription>
                          {new Date(s.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-baseline gap-4 tabular">
                        {finalValue != null && (
                          <span className="text-lg font-semibold">{formatCurrency(finalValue)}</span>
                        )}
                        {totalReturn != null && (
                          <span className={totalReturn >= 0 ? "text-profit" : "text-loss"}>
                            {totalReturn >= 0 ? "+" : ""}{formatPercent(totalReturn * 100)}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  value,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  muted?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
        <div className="rounded-md bg-secondary p-2 text-primary">{icon}</div>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular">{value}</div>
        {muted && <div className="text-xs text-muted-foreground mt-1">{muted}</div>}
      </CardContent>
    </Card>
  );
}

