"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetSearch } from "@/components/asset-search";
import { displaySymbol } from "@/lib/utils";

export interface BuilderAsset {
  symbol: string;
  name: string;
  weight: number; // 0..100
}

interface Props {
  assets: BuilderAsset[];
  onChange: (next: BuilderAsset[]) => void;
}

export function PortfolioBuilder({ assets, onChange }: Props) {
  const total = assets.reduce((s, a) => s + a.weight, 0);
  const totalOk = Math.abs(total - 100) < 0.5;

  const updateWeight = (symbol: string, weight: number) => {
    onChange(assets.map((a) => (a.symbol === symbol ? { ...a, weight } : a)));
  };

  const remove = (symbol: string) => {
    onChange(assets.filter((a) => a.symbol !== symbol));
  };

  const equalize = () => {
    if (assets.length === 0) return;
    const w = +(100 / assets.length).toFixed(2);
    onChange(assets.map((a) => ({ ...a, weight: w })));
  };

  return (
    <div className="space-y-3">
      {assets.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Add at least one asset to start building a portfolio.
        </div>
      )}

      {assets.length > 0 && (
        <div className="rounded-md border border-border">
          {assets.map((a, i) => (
            <div
              key={a.symbol}
              className={`flex items-center gap-3 px-3 py-2 ${i > 0 ? "border-t border-border" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-semibold">{displaySymbol(a.symbol)}</div>
                <div className="text-xs text-muted-foreground truncate">{a.name}</div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={a.weight}
                  onChange={(e) => updateWeight(a.symbol, Number(e.target.value))}
                  className="w-20 text-right tabular"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(a.symbol)}
                  aria-label={`Remove ${a.symbol}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssetSearch
        onPick={(picked) => {
          if (assets.find((a) => a.symbol === picked.symbol)) return;
          // distribute new weight: take half of average
          const remaining = Math.max(0, 100 - assets.reduce((s, a) => s + a.weight, 0));
          const w = remaining > 0 ? remaining : 0;
          onChange([...assets, { symbol: picked.symbol, name: picked.name, weight: +w.toFixed(2) }]);
        }}
      />

      {assets.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="ghost" size="sm" onClick={equalize}>
            Distribute evenly
          </Button>
          <div className={`tabular ${totalOk ? "text-muted-foreground" : "text-loss"}`}>
            Total: {total.toFixed(2)}%
            {!totalOk && (
              <Label className="ml-2 text-loss">Should sum to 100%</Label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
