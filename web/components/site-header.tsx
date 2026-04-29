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

  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    displayName = (profile?.display_name as string | null) ?? null;
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
