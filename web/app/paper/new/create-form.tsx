"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreatePaperForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [initialCash, setInitialCash] = useState("10000");
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await fetch("/api/paper/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "My paper portfolio",
          initialCash: Number(initialCash) || 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? "Failed to create portfolio");
        return;
      }
      const { id } = await res.json();
      router.push(`/paper/${id}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Long-term core"
          maxLength={120}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cash">Starting virtual cash</Label>
        <Input
          id="cash"
          type="number"
          inputMode="decimal"
          min={0}
          step={1000}
          value={initialCash}
          onChange={(e) => setInitialCash(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Hypothetical only. No real money is involved.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create portfolio"}
      </Button>
    </form>
  );
}
