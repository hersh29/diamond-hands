import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const TxSchema = z.object({
  type: z.enum(["buy", "sell", "deposit", "withdraw", "dividend"]),
  symbol: z.string().optional(),
  shares: z.number().positive().optional(),
  price: z.number().positive().optional(),
  cashAmount: z.number().nonnegative().optional(),
  fees: z.number().nonnegative().default(0),
  executedAt: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: portfolioId } = await params;
  const body = await request.json();
  const parsed = TxSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, user_id, type")
    .eq("id", portfolioId)
    .single();
  if (!portfolio || portfolio.user_id !== user.id || portfolio.type !== "paper") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let assetId: number | null = null;
  if (parsed.data.symbol) {
    const { data: asset } = await supabase
      .from("assets")
      .select("id")
      .eq("symbol", parsed.data.symbol)
      .single();
    if (!asset) {
      return NextResponse.json({ error: `Unknown symbol ${parsed.data.symbol}` }, { status: 400 });
    }
    assetId = asset.id;
  }

  // For buy/sell, asset is required
  if ((parsed.data.type === "buy" || parsed.data.type === "sell") && !assetId) {
    return NextResponse.json({ error: "Symbol required for buy/sell" }, { status: 400 });
  }
  if ((parsed.data.type === "buy" || parsed.data.type === "sell")
      && (!parsed.data.shares || !parsed.data.price)) {
    return NextResponse.json({ error: "Shares and price required for buy/sell" }, { status: 400 });
  }

  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({
      portfolio_id: portfolioId,
      asset_id: assetId,
      type: parsed.data.type,
      shares: parsed.data.shares ?? null,
      price: parsed.data.price ?? null,
      cash_amount: parsed.data.cashAmount ?? null,
      fees: parsed.data.fees,
      executed_at: parsed.data.executedAt ?? new Date().toISOString(),
      notes: parsed.data.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !tx) {
    return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });
  }

  return NextResponse.json({ id: tx.id });
}
