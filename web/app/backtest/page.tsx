import { BacktestRunner } from "@/components/backtest-runner";

export const metadata = {
  title: "Backtest a portfolio",
  description: "Build a portfolio and see how it would have performed historically.",
};

export default function BacktestPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Backtest a portfolio
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick assets, set weights, choose a date range. We&apos;ll show you how it
          would have performed using historical EOD data — and what it cost in
          drawdowns to get there.
        </p>
      </div>

      <div className="mt-8">
        <BacktestRunner />
      </div>
    </div>
  );
}
