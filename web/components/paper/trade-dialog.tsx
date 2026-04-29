"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { AssetSearch } from "@/components/asset-search";
import { displaySymbol, formatCurrency, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { fetchLatestPrice } from "@/lib/paper/latest-price";

interface Props {
  portfolioId: string;
  cashBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAsset?: { symbol: string; name: string };
  initialTab?: "buy" | "sell" | "cash";
  /** Max sellable shares (set when opened from a row's Sell button). */
  maxShares?: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export function TradeDialog({
  portfolioId,
  cashBalance,
  open,
  onOpenChange,
  initialAsset,
  initialTab = "buy",
  maxShares,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"buy" | "sell" | "cash">(initialTab);

  const [asset, setAsset] = useState<{ symbol: string; name: string } | null>(initialAsset ?? null);
  const [latestPrice, setLatestPrice] = useState<{ price: number; date: string } | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [fees, setFees] = useState("0");
  const [executedAt, setExecutedAt] = useState(today());

  const [cashAmount, setCashAmount] = useState("");
  const [cashType, setCashType] = useState<"deposit" | "withdraw" | "dividend">("deposit");

  const [pending, start] = useTransition();

  // Reset on open
  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setAsset(initialAsset ?? null);
      setLatestPrice(null);
      setShares("");
      setPrice("");
      setAmount("");
      setFees("0");
      setExecutedAt(today());
      setCashAmount("");
      setCashType("deposit");
    }
  }, [open, initialAsset, initialTab]);

  // Fetch the latest price whenever the selected asset changes
  useEffect(() => {
    if (!asset || !open) {
      setLatestPrice(null);
      return;
    }
    let cancelled = false;
    setPricingLoading(true);
    const supabase = createClient();
    fetchLatestPrice(supabase, asset.symbol)
      .then((p) => {
        if (cancelled) return;
        setLatestPrice(p);
        // Pre-fill price field if it's still empty so the user can confirm
        if (p) {
          setPrice((prev) => (prev === "" ? p.price.toFixed(2) : prev));
        }
      })
      .finally(() => {
        if (!cancelled) setPricingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [asset, open]);

  // Bidirectional binding: shares ↔ amount, both via price
  const onSharesChange = (next: string) => {
    setShares(next);
    const s = Number(next);
    const p = Number(price);
    if (Number.isFinite(s) && Number.isFinite(p) && p > 0) {
      setAmount((s * p).toFixed(2));
    }
  };

  const onAmountChange = (next: string) => {
    setAmount(next);
    const a = Number(next);
    const p = Number(price);
    if (Number.isFinite(a) && Number.isFinite(p) && p > 0) {
      setShares((a / p).toFixed(6));
    }
  };

  const onPriceChange = (next: string) => {
    setPrice(next);
    const p = Number(next);
    const s = Number(shares);
    if (Number.isFinite(p) && Number.isFinite(s) && s > 0) {
      setAmount((s * p).toFixed(2));
    } else {
      const a = Number(amount);
      if (Number.isFinite(p) && Number.isFinite(a) && p > 0 && a > 0) {
        setShares((a / p).toFixed(6));
      }
    }
  };

  const useCurrentPrice = () => {
    if (!latestPrice) return;
    onPriceChange(latestPrice.price.toFixed(2));
  };

  const submit = async (payload: Record<string, unknown>) => {
    start(async () => {
      const res = await fetch(`/api/paper/portfolios/${portfolioId}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Failed");
        return;
      }
      toast.success("Transaction recorded");
      onOpenChange(false);
      router.refresh();
    });
  };

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    const sharesNum = Number(shares);
    const priceNum = Number(price);
    const feesNum = Number(fees);
    if (!Number.isFinite(sharesNum) || sharesNum <= 0) {
      toast.error("Enter a valid number of shares");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (tab === "buy") {
      const total = sharesNum * priceNum + feesNum;
      if (total > cashBalance + 0.01) {
        toast.error(`Not enough cash. You have ${formatCurrency(cashBalance)}.`);
        return;
      }
    }
    if (tab === "sell" && maxShares != null && sharesNum > maxShares + 0.000001) {
      toast.error(`You only hold ${maxShares} shares.`);
      return;
    }
    submit({
      type: tab,
      symbol: asset.symbol,
      shares: sharesNum,
      price: priceNum,
      fees: feesNum,
      executedAt: new Date(`${executedAt}T12:00:00Z`).toISOString(),
    });
  };

  const handleCash = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(cashAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (cashType === "withdraw" && amt > cashBalance + 0.01) {
      toast.error("Not enough cash to withdraw");
      return;
    }
    submit({
      type: cashType,
      cashAmount: amt,
      executedAt: new Date(`${executedAt}T12:00:00Z`).toISOString(),
    });
  };

  const totalFromInputs =
    Number(shares) > 0 && Number(price) > 0
      ? Number(shares) * Number(price) + (Number(fees) || 0)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
          <DialogDescription>
            Hypothetical only. Cash balance:{" "}
            <span className="tabular font-semibold text-foreground">{formatCurrency(cashBalance)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
            <TabsTrigger value="cash">Cash</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <form onSubmit={handleTrade} className="space-y-4">
              <AssetField asset={asset} onChange={setAsset} latestPrice={latestPrice} loading={pricingLoading} />
              <TradeFields
                shares={shares} onSharesChange={onSharesChange}
                price={price}   onPriceChange={onPriceChange}
                amount={amount} onAmountChange={onAmountChange}
                fees={fees}     setFees={setFees}
                executedAt={executedAt} setExecutedAt={setExecutedAt}
                latestPrice={latestPrice}
                useCurrentPrice={useCurrentPrice}
              />
              {totalFromInputs > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total cost (incl. fees):{" "}
                  <span className="tabular font-semibold text-foreground">{formatCurrency(totalFromInputs)}</span>
                </p>
              )}
              <Button type="submit" className="w-full" disabled={pending || !asset}>
                {pending ? "Recording…" : "Buy"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sell">
            <form onSubmit={handleTrade} className="space-y-4">
              <AssetField asset={asset} onChange={setAsset} latestPrice={latestPrice} loading={pricingLoading} />
              {maxShares != null && (
                <p className="text-xs text-muted-foreground">
                  You hold <span className="tabular font-medium text-foreground">{maxShares}</span> shares.
                </p>
              )}
              <TradeFields
                shares={shares} onSharesChange={onSharesChange}
                price={price}   onPriceChange={onPriceChange}
                amount={amount} onAmountChange={onAmountChange}
                fees={fees}     setFees={setFees}
                executedAt={executedAt} setExecutedAt={setExecutedAt}
                latestPrice={latestPrice}
                useCurrentPrice={useCurrentPrice}
              />
              <Button type="submit" className="w-full" disabled={pending || !asset}>
                {pending ? "Recording…" : "Sell"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="cash">
            <form onSubmit={handleCash} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(["deposit", "withdraw", "dividend"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={cashType === t ? "default" : "outline"}
                    onClick={() => setCashType(t)}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cash-amt">Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="cash-amt"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={100}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cash-date">Date</Label>
                <Input
                  id="cash-date"
                  type="date"
                  value={executedAt}
                  onChange={(e) => setExecutedAt(e.target.value)}
                  max={today()}
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Recording…" : "Record"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AssetField({
  asset,
  onChange,
  latestPrice,
  loading,
}: {
  asset: { symbol: string; name: string } | null;
  onChange: (a: { symbol: string; name: string } | null) => void;
  latestPrice: { price: number; date: string } | null;
  loading: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Asset</Label>
      {asset ? (
        <div className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2">
          <div className="min-w-0">
            <div className="font-mono text-sm font-semibold">{displaySymbol(asset.symbol)}</div>
            <div className="truncate text-xs text-muted-foreground">{asset.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>Last price:</span>
              {loading ? (
                <span className="text-foreground/60">loading…</span>
              ) : latestPrice ? (
                <>
                  <span className="tabular text-foreground">{formatCurrency(latestPrice.price)}</span>
                  <span className="opacity-60">· {latestPrice.date}</span>
                </>
              ) : (
                <span className="text-loss">unavailable</span>
              )}
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Change
          </Button>
        </div>
      ) : (
        <AssetSearch onPick={(a) => onChange({ symbol: a.symbol, name: a.name })} />
      )}
    </div>
  );
}

function TradeFields({
  shares, onSharesChange,
  price, onPriceChange,
  amount, onAmountChange,
  fees, setFees,
  executedAt, setExecutedAt,
  latestPrice,
  useCurrentPrice,
}: {
  shares: string;     onSharesChange: (v: string) => void;
  price: string;      onPriceChange: (v: string) => void;
  amount: string;     onAmountChange: (v: string) => void;
  fees: string;       setFees: (v: string) => void;
  executedAt: string; setExecutedAt: (v: string) => void;
  latestPrice: { price: number; date: string } | null;
  useCurrentPrice: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="shares">Shares</Label>
          <Input
            id="shares"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={shares}
            onChange={(e) => onSharesChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Total amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="price">Price/share</Label>
            {latestPrice && (
              <button
                type="button"
                onClick={useCurrentPrice}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider transition-colors hover:text-primary/80",
                  Number(price).toFixed(2) === latestPrice.price.toFixed(2)
                    ? "text-muted-foreground/50"
                    : "text-primary",
                )}
              >
                Use current
              </button>
            )}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fees">Fees</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="fees"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="executed">Date</Label>
        <Input
          id="executed"
          type="date"
          value={executedAt}
          onChange={(e) => setExecutedAt(e.target.value)}
          max={today()}
        />
      </div>
    </>
  );
}
