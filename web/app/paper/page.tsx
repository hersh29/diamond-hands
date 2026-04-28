import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet, ArrowUpRight } from "lucide-react";

export const metadata = { title: "Paper portfolios" };

export default async function PaperListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/paper");

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, name, created_at")
    .eq("user_id", user.id)
    .eq("type", "paper")
    .order("created_at", { ascending: false });

  return (
    <div className="container py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Paper trade · simulation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Paper portfolios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulate trades with virtual cash. No real money involved.
          </p>
        </div>
        <Button asChild>
          <Link href="/paper/new"><Plus className="h-4 w-4" /> New portfolio</Link>
        </Button>
      </div>

      {!portfolios || portfolios.length === 0 ? (
        <Card className="terminal-card mt-8 bg-grid">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 max-w-sm text-muted-foreground">
              Create a paper portfolio to start tracking hypothetical positions
              and test strategies risk-free.
            </p>
            <Button asChild className="mt-6">
              <Link href="/paper/new">Create your first portfolio</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((p) => (
            <Link key={p.id} href={`/paper/${p.id}`}>
              <Card className="terminal-card h-full transition-colors hover:border-primary/50">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-start justify-between text-base">
                    <span>{p.name}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(p.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
