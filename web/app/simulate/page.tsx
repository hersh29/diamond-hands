import { SimulateRunner } from "@/components/simulate-runner";

export const metadata = {
  title: "Simulate the future",
  description:
    "Project portfolio outcomes by sampling historical returns. Hypothetical Monte Carlo simulation, not a prediction.",
};

export default function SimulatePage() {
  return (
    <div className="container py-8 md:py-10">
      <div className="max-w-2xl">
        <p className="eyebrow">Console · Simulate</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          What might my portfolio do?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          We sample with replacement from a portfolio&apos;s historical monthly
          returns to project a distribution of forward outcomes. The shaded
          bands show the 5th – 95th percentile range. The median line is the
          50th. None of this predicts the future; it just shows what
          history-flavored randomness looks like.
        </p>
      </div>

      <div className="mt-8">
        <SimulateRunner />
      </div>
    </div>
  );
}
