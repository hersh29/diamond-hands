import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/diamond-mark";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";

const navLinks = [
  { href: "/backtest", label: "Backtest" },
  { href: "/simulate", label: "Simulate" },
  { href: "/paper",    label: "Paper trade" },
  { href: "/explore",  label: "Explore" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Profile fetch is best-effort — never let it crash the layout.
  // Falls back to email-based display name if anything goes wrong.
  let displayName: string | null = null;
  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      displayName = (profile?.display_name as string | null) ?? null;
    } catch (err) {
      // RLS, network, missing-table — silently fall back.
      console.error("[site-header] profile lookup failed", err);
    }
  }

  // Fallback: pull the OAuth full_name from auth metadata if profile is empty.
  if (user && !displayName) {
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const candidate =
      (typeof meta?.full_name === "string" && meta.full_name) ||
      (typeof meta?.name      === "string" && meta.name)      ||
      null;
    displayName = candidate;
  }

  const userInfo = user ? { email: user.email ?? "", displayName } : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="container flex h-14 items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <DiamondMark size={20} />
          <span className="font-semibold tracking-tight">diamondhands</span>
        </Link>

        <nav className="hidden items-center md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            {userInfo ? (
              <UserMenu email={userInfo.email} displayName={userInfo.displayName} />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
          <MobileNav user={userInfo} />
        </div>
      </div>
    </header>
  );
}
