import Link from "next/link";
import { DiamondMark } from "@/components/diamond-mark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              <DiamondMark size={20} />
              <span className="font-semibold tracking-tight">diamondhands</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Backtest any portfolio. Explore historical scenarios. For research and
              education — not investment advice.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/backtest" className="hover:text-primary">Backtest</Link></li>
              <li><Link href="/paper"    className="hover:text-primary">Paper trade</Link></li>
              <li><Link href="/explore"  className="hover:text-primary">Explore</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/legal/disclaimer" className="hover:text-primary">Disclaimer</Link></li>
              <li><Link href="/legal/terms"      className="hover:text-primary">Terms</Link></li>
              <li><Link href="/legal/privacy"    className="hover:text-primary">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p className="leading-relaxed max-w-3xl">
            DiamondHands provides educational tools, not investment advice. All results
            are hypothetical and based on historical data which may contain errors. Past
            performance does not guarantee future results.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} DiamondHands</p>
        </div>
      </div>
    </footer>
  );
}
