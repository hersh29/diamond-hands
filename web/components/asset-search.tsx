"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { displaySymbol } from "@/lib/utils";

interface AssetResult {
  id: number;
  symbol: string;
  name: string;
  type: "stock" | "etf" | "crypto";
}

export function AssetSearch({ onPick }: { onPick: (asset: AssetResult) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AssetResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/assets/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!cancelled) setResults(json.assets ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" /> Add asset…
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden p-0"
        style={{
          maxHeight:
            "min(60vh, var(--radix-popover-content-available-height, 60vh))",
        }}
        align="start"
        collisionPadding={16}
      >
        <Command shouldFilter={false} className="flex min-h-0 flex-1 flex-col">
          <CommandInput
            value={q}
            onValueChange={setQ}
            placeholder="Search by ticker or name…"
          />
          <CommandList className="min-h-0 flex-1">
            {loading && q.length > 0 && <div className="p-3 text-xs text-muted-foreground">Searching…</div>}
            <CommandEmpty>No assets matched.</CommandEmpty>
            <CommandGroup heading="Assets">
              {results.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.symbol} ${a.name}`}
                  onSelect={() => {
                    onPick(a);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold w-16">{displaySymbol(a.symbol)}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[220px]">{a.name}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {a.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
