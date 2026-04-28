import { redirect } from "next/navigation";
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
      <Card>
        <CardHeader>
          <CardTitle>New paper portfolio</CardTitle>
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
