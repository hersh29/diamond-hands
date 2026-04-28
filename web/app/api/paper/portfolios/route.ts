import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  initialCash: z.number().nonnegative().default(10000),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      type: "paper",
      is_public: false,
    })
    .select("id")
    .single();

  if (error || !portfolio) {
    return NextResponse.json({ error: error?.message ?? "Failed to create" }, { status: 500 });
  }

  // Seed virtual cash with a deposit transaction
  if (parsed.data.initialCash > 0) {
    await supabase.from("transactions").insert({
      portfolio_id: portfolio.id,
      type: "deposit",
      cash_amount: parsed.data.initialCash,
      executed_at: new Date().toISOString(),
      notes: "Initial virtual deposit",
    });
  }

  return NextResponse.json({ id: portfolio.id });
}
