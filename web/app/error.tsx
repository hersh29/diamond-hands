"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/diamond-mark";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console — Vercel captures these
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-10">
      <div className="max-w-md text-center">
        <div className="inline-flex"><DiamondMark size={36} /></div>
        <p className="eyebrow mt-6">Error</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Something broke.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            ref · {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
