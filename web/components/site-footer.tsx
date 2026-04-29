import Link from "next/link";
import { DiamondMark } from "@/components/diamond-mark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/50 bg-background">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              <DiamondMark size={18} />
              <span className="font-semibold tracking-tight">diamondhands</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A research terminal for long-term investors.
              For research and education — not investment advice.
            </p>
            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <span>System online</span>
              <span className="opacity-50">·</span>
              <span>v0.1</span>
            </div>
          </div>

          <FooterCol heading="Product">
            <FooterLink href="/backtest">Backtest</FooterLink>
            <FooterLink href="/simulate">Simulate</FooterLink>
            <FooterLink href="/paper">Paper trade</FooterLink>
            <FooterLink href="/explore">Explore</FooterLink>
          </FooterCol>

          <FooterCol heading="Account">
            <FooterLink href="/dashboard">Dashboard</FooterLink>
            <FooterLink href="/login">Log in</FooterLink>
            <FooterLink href="/signup">Sign up</FooterLink>
          </FooterCol>

          <FooterCol heading="Legal">
            <FooterLink href="/legal/disclaimer">Disclaimer</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground/80">
            DiamondHands provides educational tools, not investment advice. All
            results are hypothetical and based on historical data which may
            contain errors. Past performance does not guarantee future results.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            © {new Date().getFullYear()} diamondhands.space
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {heading}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-foreground/80 transition-colors hover:text-primary">
        {children}
      </Link>
    </li>
  );
}
