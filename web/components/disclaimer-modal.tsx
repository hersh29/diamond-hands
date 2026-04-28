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
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/diamond-mark";
import { createClient } from "@/lib/supabase/client";

interface Props {
  /** Pre-acknowledgement state from the server. If true, modal stays closed. */
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
    <Dialog open={open} onOpenChange={() => { /* user must click Accept */ }}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader className="space-y-3">
          <div><DiamondMark size={28} /></div>
          <DialogTitle className="text-xl">Welcome to DiamondHands</DialogTitle>
          <DialogDescription className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            Before you continue, please understand:
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/90">
          <li>This is a research and education tool, not investment advice.</li>
          <li>We do not recommend any specific investments.</li>
          <li>Hypothetical backtest results do not guarantee future returns.</li>
          <li>
            Always do your own research and consult a licensed financial advisor
            before making investment decisions.
          </li>
        </ul>

        <p className="text-xs text-muted-foreground">
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

        <Button onClick={handleAccept} disabled={pending} className="w-full">
          {pending ? "Saving…" : "I understand"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
