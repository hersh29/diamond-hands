"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { BacktestMode } from "@/lib/backtest/mode";

const MODES = [
  { id: "basic",    label: "Basic" },
  { id: "advanced", label: "Advanced" },
] as const;

interface Props {
  mode: BacktestMode;
}

export function BacktestModeToggle({ mode }: Props) {
  const router = useRouter();

  const setMode = (next: BacktestMode) => {
    if (next === mode) return;
    if (next === "basic") router.replace("/backtest");
    else router.replace(`/backtest?mode=${next}`);
  };

  return (
    <div
      role="tablist"
      aria-label="Backtest mode"
      className="terminal-card inline-flex p-1"
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            role="tab"
            aria-selected={active}
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-sm px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
