import { cn } from "@/lib/utils";

interface KpiProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "profit" | "loss" | "neutral";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  hint?: string;
}

const SIZE_CLASS: Record<NonNullable<KpiProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
  xl: "text-3xl md:text-4xl",
};

/**
 * Robinhood-style KPI block: small uppercase label, big tabular number,
 * optional delta. Compose horizontally for KPI bars.
 *
 * Numbers can be long (currency at $1M+ etc.) so the value is allowed to
 * shrink and `min-w-0` is set on the container to prevent grid overflow.
 */
export function Kpi({ label, value, delta, deltaTone = "neutral", size = "md", className, hint }: KpiProps) {
  const tone =
    deltaTone === "profit" ? "text-profit" :
    deltaTone === "loss"   ? "text-loss"   : "text-muted-foreground";

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <span className="eyebrow truncate">{label}</span>
      <span
        className={cn(
          "display-num mt-1.5 truncate leading-tight",
          SIZE_CLASS[size],
        )}
      >
        {value}
      </span>
      {delta && (
        <span className={cn("mt-1 text-xs tabular truncate", tone)}>{delta}</span>
      )}
      {hint && (
        <span className="mt-1 truncate text-xs text-muted-foreground/70">{hint}</span>
      )}
    </div>
  );
}

/**
 * KPI bar — divided cells, terminal aesthetic.
 * 2 columns × 2 rows on mobile (with both vertical + horizontal dividers),
 * 4 columns × 1 row on sm+ (vertical dividers only).
 */
export function KpiBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
      {children}
    </div>
  );
}

export function KpiCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-w-0 p-5", className)}>{children}</div>;
}
