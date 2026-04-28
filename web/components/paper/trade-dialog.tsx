"use client";

import { useState, useEffect, useTransition } from "react";
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
import { displaySymbol, formatCurrency } from "@/lib/utils";

interface Props {
  portfolioId: string;
  cashBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-select an asset (e.g. when "Sell" is clicked from a holdings row). */
  initialAsset?: { symbol: string; name: string };
  /** Pre-select tab. */
  initialTab?: "buy" | "sell" | "cash";
  /** Max sellable shares for sell mode (the row's current shares). */
  maxShares?: number;
}

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
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("0");
  const [executedAt, setExecutedAt] = useState(new Date().toISOString().slice(0, 10));
  const [cashAmount, setCashAmount] = useState("");
  const [cashType, setCashType] = useState<"deposit" | "withdraw" | "dividend">("deposit");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setAsset(initialAsset ?? null);
      setShares("");
      setPrice("");
      setFees("0");
      setExecutedAt(new Date().toISOString().slice(0, 10));
      setCashAmount("");
      setCashType("deposit");
    }
  }, [open, initialAsset, initialTab]);

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

  const tradeTotal =
    Number(shares) > 0 && Number(price) > 0
      ? Number(shares) * Number(price) + (Number(fees) || 0)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
          <DialogDescription>
            Hypothetical only. Cash balance: <span className="tabular font-semibold">{formatCurrency(cashBalance)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
            <TabsTrigger value="cash">Cash</TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <form onSubmit={handleTrade} className="space-y-4">
              <AssetField asset={asset} onChange={setAsset} />
              <TradeFields
                shares={shares} setShares={setShares}
                price={price}  setPrice={setPrice}
                fees={fees}    setFees={setFees}
                executedAt={executedAt} setExecutedAt={setExecutedAt}
              />
              {tradeTotal > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total: <span className="tabular font-semibold text-foreground">{formatCurrency(tradeTotal)}</span>
                </p>
              )}
              <Button type="submit" className="w-full" disabled={pending || !asset}>
                {pending ? "Recording…" : "Buy"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sell">
            <form onSubmit={handleTrade} className="space-y-4">
              <AssetField asset={asset} onChange={setAsset} />
              {maxShares != null && (
                <p className="text-xs text-muted-foreground">
                  You hold <span className="tabular">{maxShares}</span> shares.
                </p>
              )}
              <TradeFields
                shares={shares} setShares={setShares}
                price={price}  setPrice={setPrice}
                fees={fees}    setFees={setFees}
                executedAt={executedAt} setExecutedAt={setExecutedAt}
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
                <Input
                  id="cash-amt"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={100}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cash-date">Date</Label>
                <Input
                  id="cash-date"
                  type="date"
                  value={executedAt}
                  onChange={(e) => setExecutedAt(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
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
}: {
  asset: { symbol: string; name: string } | null;
  onChange: (a: { symbol: string; name: string } | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>Asset</Label>
      {asset ? (
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <div>
            <div className="font-mono text-sm font-semibold">{displaySymbol(asset.symbol)}</div>
            <div className="text-xs text-muted-foreground">{asset.name}</div>
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
  shares, setShares,
  price, setPrice,
  fees, setFees,
  executedAt, setExecutedAt,
}: {
  shares: string;     setShares: (v: string) => void;
  price: string;      setPrice: (v: string) => void;
  fees: string;       setFees: (v: string) => void;
  executedAt: string; setExecutedAt: (v: string) => void;
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
            onChange={(e) => setShares(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price/share</Label>
          <Input
            id="price"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fees">Fees</Label>
          <Input
            id="fees"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="executed">Date</Label>
          <Input
            id="executed"
            type="date"
            value={executedAt}
            onChange={(e) => setExecutedAt(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>
    </>
  );
}
