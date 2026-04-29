import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiamondMark } from "@/components/diamond-mark";

export default function NotFound() {
  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-10">
      <div className="text-center">
        <div className="inline-flex"><DiamondMark size={36} /></div>
        <p className="eyebrow mt-6">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/backtest">Run a backtest</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
