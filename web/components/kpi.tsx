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

const SIZE_CLASS = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl md:text-5xl",
};

/**
 * Robinhood-style KPI block: small uppercase label, big tabular number,
 * optional delta. Compose horizontally for KPI bars.
 */
export function Kpi({ label, value, delta, deltaTone = "neutral", size = "md", className, hint }: KpiProps) {
  const tone =
    deltaTone === "profit" ? "text-profit" :
    deltaTone === "loss"   ? "text-loss"   : "text-muted-foreground";

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="eyebrow">{label}</span>
      <span className={cn("display-num mt-1.5 leading-none", SIZE_CLASS[size])}>{value}</span>
      {delta && (
        <span className={cn("mt-1 text-xs tabular", tone)}>{delta}</span>
      )}
      {hint && (
        <span className="mt-1 text-xs text-muted-foreground/70">{hint}</span>
      )}
    </div>
  );
}

/**
 * KPI bar — divided cells, terminal aesthetic.
 */
export function KpiBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="terminal-card grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
      {children}
    </div>
  );
}

export function KpiCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
