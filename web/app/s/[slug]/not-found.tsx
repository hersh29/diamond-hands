import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Scenario not found</h1>
        <p className="mt-2 text-muted-foreground">
          This share link may have been removed or never existed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/backtest">Run a new backtest</Link>
        </Button>
      </div>
    </div>
  );
}
