import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Paper portfolios</h1>
          <p className="text-muted-foreground">
            Simulate trades with virtual cash. No real money involved.
          </p>
        </div>
        <Button asChild>
          <Link href="/paper/new"><Plus className="h-4 w-4" /> New portfolio</Link>
        </Button>
      </div>

      {!portfolios || portfolios.length === 0 ? (
        <Card className="mt-8">
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
              <Card className="h-full transition-colors hover:border-primary">
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
    </div>
  );
}
