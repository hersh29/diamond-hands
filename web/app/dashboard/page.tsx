import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Wallet, Sparkles } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, name, share_slug, created_at, results")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your dashboard</h1>
          <p className="text-muted-foreground">Saved scenarios and paper portfolios.</p>
        </div>
        <Button asChild>
          <Link href="/backtest">New backtest</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <FeatureCard icon={<LineChart className="h-5 w-5" />} title="Saved scenarios" value={scenarios?.length ?? 0} />
        <FeatureCard icon={<Wallet     className="h-5 w-5" />} title="Paper portfolios" value={0}                   muted="Coming in Phase 2" />
        <FeatureCard icon={<Sparkles   className="h-5 w-5" />} title="Plan"             value="Free"                 muted="No paywall yet" />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">Recent scenarios</h2>

      {!scenarios || scenarios.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">You haven&apos;t saved any scenarios yet.</p>
            <Button asChild className="mt-4">
              <Link href="/backtest">Run your first backtest</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {scenarios.map((s) => {
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
    </div>
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
