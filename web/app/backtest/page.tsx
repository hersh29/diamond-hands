import { BacktestRunner } from "@/components/backtest-runner";
import { BacktestRunnerBasic } from "@/components/backtest-runner-basic";
import { BacktestModeToggle } from "@/components/backtest-mode-toggle";
import { modeFromSearchParams } from "@/lib/backtest/mode";

export const metadata = {
  title: "Backtest a portfolio",
  description: "Build a portfolio and see how it would have performed historically.",
};

export default async function BacktestPage(
  { searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> },
) {
  const sp = await searchParams;
  const mode = modeFromSearchParams(sp);

  return (
    <div className="container py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">Console · Backtest</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {mode === "basic" ? "What if I'd invested?" : "Backtest a portfolio"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {mode === "basic"
              ? "Pick an amount, an asset, a starting year. See what your investment would be worth today."
              : "Mix any combination of stocks, ETFs, and crypto. DCA, rebalance, compare against SPY."}
          </p>
        </div>
        <BacktestModeToggle mode={mode} />
      </div>

      <div className="mt-8">
        {mode === "basic" ? <BacktestRunnerBasic /> : <BacktestRunner />}
      </div>
    </div>
  );
}
