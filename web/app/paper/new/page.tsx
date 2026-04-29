import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePaperForm } from "./create-form";

export const metadata = { title: "New paper portfolio" };

export default async function NewPaperPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/paper/new");

  return (
    <div className="container max-w-xl py-10">
      <Link
        href="/paper"
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Paper portfolios
      </Link>

      <Card className="terminal-card mt-3">
        <CardHeader className="space-y-1">
          <span className="eyebrow">New portfolio</span>
          <CardTitle>Set up a paper portfolio</CardTitle>
          <CardDescription>
            Pick a name and starting virtual cash. You can add positions
            afterward — manually or by importing a CSV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePaperForm />
        </CardContent>
      </Card>
    </div>
  );
}
