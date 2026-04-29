"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/auth/actions";
import { DiamondMark } from "@/components/diamond-mark";

interface NavLink {
  href: string;
  label: string;
}

const PRIMARY: NavLink[] = [
  { href: "/backtest", label: "Backtest" },
  { href: "/simulate", label: "Simulate" },
  { href: "/paper",    label: "Paper trade" },
  { href: "/explore",  label: "Explore" },
];

interface Props {
  user: { email: string; displayName?: string | null } | null;
}

export function MobileNav({ user }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-x-0 top-14 bottom-0 z-40 animate-in fade-in slide-in-from-top-2 bg-background/98 backdrop-blur md:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="container py-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center gap-2 text-foreground">
              <DiamondMark size={20} />
              <span className="font-semibold tracking-tight">diamondhands</span>
            </div>

            <p className="eyebrow">Navigate</p>
            <nav className="mt-3 flex flex-col gap-1">
              {PRIMARY.map((l) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-3 text-base font-medium transition-colors",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <span>{l.label}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8">
              <p className="eyebrow">Account</p>
              {user ? (
                <div className="mt-3 flex flex-col gap-1">
                  <Link
                    href="/dashboard"
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-left text-base font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </form>
                  <div className="mt-2 px-3">
                    {user.displayName && (
                      <p className="truncate text-sm font-medium">{user.displayName}</p>
                    )}
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-1">
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-primary px-3 py-3 text-center text-base font-semibold text-primary-foreground"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-border/50 pt-4">
              <p className="eyebrow">Legal</p>
              <nav className="mt-3 flex flex-col gap-0">
                {[
                  { href: "/legal/disclaimer", label: "Disclaimer" },
                  { href: "/legal/terms",      label: "Terms" },
                  { href: "/legal/privacy",    label: "Privacy" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
