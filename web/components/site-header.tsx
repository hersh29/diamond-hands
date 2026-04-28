import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/diamond-mark";
import { UserMenu } from "@/components/user-menu";

const navLinks = [
  { href: "/backtest", label: "Backtest" },
  { href: "/paper",    label: "Paper trade" },
  { href: "/explore",  label: "Explore" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="container flex h-14 items-center justify-between">
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
          {user ? (
            <UserMenu email={user.email ?? ""} />
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
      </div>
    </header>
  );
}
