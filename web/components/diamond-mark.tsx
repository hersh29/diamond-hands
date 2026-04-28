import { cn } from "@/lib/utils";

interface DiamondMarkProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}

/**
 * The DiamondHands logo mark. Two triangular facets forming a faceted diamond.
 * Inherits color via `currentColor` so it picks up the surrounding text color.
 */
export function DiamondMark({ size = 24, className, ...props }: DiamondMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden="true"
      {...props}
    >
      {/* Upper facet */}
      <path
        d="M16 3 L29 15.5 L3 15.5 Z"
        fill="currentColor"
      />
      {/* Lower facet (slightly translucent for depth) */}
      <path
        d="M3 16.5 L29 16.5 L16 29 Z"
        fill="currentColor"
        fillOpacity="0.65"
      />
    </svg>
  );
}

/**
 * Wordmark = mark + name. Use in headers and large brand contexts.
 */
export function DiamondHandsWordmark({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <DiamondMark size={size} />
      <span>diamondhands</span>
    </span>
  );
}
