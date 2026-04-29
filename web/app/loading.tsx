import { DiamondMark } from "@/components/diamond-mark";

export default function Loading() {
  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-pulse">
          <DiamondMark size={36} />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Loading…
        </p>
      </div>
    </div>
  );
}
