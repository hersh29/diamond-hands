import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth + email confirmation callback.
 *
 * Supabase redirects users here either with a `code` (success) or with
 * `error` / `error_description` query params (failure). We pass any error
 * straight through to /login so the user gets a useful message.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  if (error) {
    const params = new URLSearchParams({
      error,
      ...(errorDesc ? { description: errorDesc } : {}),
    });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeErr) {
    return NextResponse.redirect(
      `${origin}/login?error=exchange_failed&description=${encodeURIComponent(exchangeErr.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
