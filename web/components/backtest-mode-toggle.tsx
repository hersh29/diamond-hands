"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "basic",    label: "Basic",    hint: "Single asset, single year" },
  { id: "advanced", label: "Advanced", hint: "Multi-asset, DCA, rebalancing" },
] as const;

export type BacktestMode = (typeof MODES)[number]["id"];

interface Props {
  mode: BacktestMode;
}

export function BacktestModeToggle({ mode }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const setMode = (next: BacktestMode) => {
    const params = new URLSearchParams(search.toString());
    if (next === "basic") params.delete("mode");
    else params.set("mode", next);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
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

export function modeFromSearchParams(sp: { mode?: string | string[] | undefined }): BacktestMode {
  const raw = Array.isArray(sp.mode) ? sp.mode[0] : sp.mode;
  return raw === "advanced" ? "advanced" : "basic";
}
