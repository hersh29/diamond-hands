"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/diamond-mark";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initialAccepted: boolean;
  userId: string;
}

export function DisclaimerModal({ initialAccepted, userId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(!initialAccepted);
  const [pending, start] = useTransition();

  const handleAccept = () => {
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ disclaimer_accepted_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) {
        toast.error("Couldn't save acknowledgement. Please try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* require acknowledgement */ }}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="terminal-card sm:max-w-lg"
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <DiamondMark size={22} />
            <span className="eyebrow">First-run check</span>
          </div>
          <DialogTitle className="text-2xl tracking-tight">Welcome to DiamondHands</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Before you continue, please acknowledge:
        </p>

        <ul className="space-y-2 text-sm text-foreground/90">
          {[
            "This is a research and education tool, not investment advice.",
            "We do not recommend any specific investments.",
            "Hypothetical backtest results do not guarantee future returns.",
            "Always do your own research and consult a licensed financial advisor before making investment decisions.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-3">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>

        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Read the full{" "}
          <Link href="/legal/disclaimer" target="_blank" className="underline">
            disclaimer
          </Link>
          {" · "}
          <Link href="/legal/terms" target="_blank" className="underline">
            terms
          </Link>
          {" · "}
          <Link href="/legal/privacy" target="_blank" className="underline">
            privacy
          </Link>
        </p>

        <Button onClick={handleAccept} disabled={pending} size="lg" className="w-full">
          {pending ? "Saving…" : "I understand"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
