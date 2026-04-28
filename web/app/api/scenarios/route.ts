import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { BacktestParams, BacktestResult } from "@/lib/backtest/types";

const SaveSchema = z.object({
  name: z.string().min(1).max(120),
  params: z.unknown(),
  results: z.unknown().optional(),
  isPublic: z.boolean().default(true),
});

/**
 * POST /api/scenarios — save a scenario.
 * Authenticated users save under their user_id; anonymous saves are allowed
 * (user_id = null) and visible only via the share slug.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = nanoid(8);

  const insert = {
    user_id: user?.id ?? null,
    name: parsed.data.name,
    params: parsed.data.params as BacktestParams,
    results: (parsed.data.results ?? null) as BacktestResult | null,
    share_slug: slug,
    is_public: parsed.data.isPublic,
  };

  const { data, error } = await supabase
    .from("scenarios")
    .insert(insert)
    .select("id, share_slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, slug: data.share_slug });
}
