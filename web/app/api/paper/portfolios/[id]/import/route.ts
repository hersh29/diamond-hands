import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ImportSchema = z.object({
  rows: z.array(
    z.object({
      symbol: z.string().min(1).max(20),
      shares: z.number().positive(),
      costBasis: z.number().positive(),
      openedAt: z.string().optional(),
    }),
  ).min(1).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: portfolioId } = await params;
  const body = await request.json();
  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, user_id, type")
    .eq("id", portfolioId)
    .single();
  if (!portfolio || portfolio.user_id !== user.id || portfolio.type !== "paper") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve symbols → asset ids in one query
  const symbols = Array.from(new Set(parsed.data.rows.map((r) => r.symbol.toUpperCase())));
  const { data: assets } = await supabase
    .from("assets")
    .select("id, symbol")
    .in("symbol", symbols);

  const idBySymbol = new Map((assets ?? []).map((a) => [a.symbol, a.id]));
  const skipped: string[] = [];
  const inserts: Record<string, unknown>[] = [];
  let totalCost = 0;

  for (const r of parsed.data.rows) {
    const aid = idBySymbol.get(r.symbol.toUpperCase());
    if (!aid) {
      skipped.push(r.symbol);
      continue;
    }
    const cost = r.shares * r.costBasis;
    totalCost += cost;
    inserts.push({
      portfolio_id: portfolioId,
      asset_id: aid,
      type: "buy",
      shares: r.shares,
      price: r.costBasis,
      executed_at: r.openedAt
        ? new Date(`${r.openedAt}T12:00:00Z`).toISOString()
        : new Date().toISOString(),
      notes: "Imported from CSV",
    });
  }

  if (inserts.length === 0) {
    return NextResponse.json({
      imported: 0,
      skipped,
      error: "No rows could be imported. Check that ticker symbols are in our supported universe.",
    }, { status: 400 });
  }

  // Auto-deposit virtual cash to fund the import
  const cashTxn = {
    portfolio_id: portfolioId,
    type: "deposit",
    cash_amount: totalCost,
    executed_at: inserts[0].executed_at as string,
    notes: "Auto-deposit to fund CSV import",
  };

  const { error: cashErr } = await supabase.from("transactions").insert(cashTxn);
  if (cashErr) {
    return NextResponse.json({ error: cashErr.message }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("transactions").insert(inserts);
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({
    imported: inserts.length,
    skipped,
  });
}
