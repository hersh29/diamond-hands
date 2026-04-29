export const metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <article className="container max-w-3xl py-12 prose prose-invert prose-headings:tracking-tight prose-p:text-foreground/85 prose-li:text-foreground/85">
      <p className="eyebrow !mt-0 not-prose">Legal</p>
      <h1 className="!mb-2">Investment Disclaimer</h1>
      <p className="not-prose font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Last updated 2026-04-28</p>

      <h2>Educational tool, not investment advice</h2>
      <p>
        DiamondHands provides historical research and hypothetical simulation
        tools for educational purposes only. We are not registered investment
        advisors, broker-dealers, or financial planners. <strong>Nothing on this
        site constitutes investment, financial, tax, legal, or any other kind of
        advice.</strong> No fiduciary or advisory relationship is created by your
        use of this site.
      </p>

      <h2>Hypothetical results</h2>
      <p>
        All backtest, simulation, and portfolio results shown on DiamondHands
        are <strong>hypothetical</strong>. They are derived from historical
        adjusted-close price data and do not reflect:
      </p>
      <ul>
        <li>Trading commissions, slippage, or bid/ask spreads</li>
        <li>Taxes (capital gains, dividend, withholding)</li>
        <li>Fund expense ratios beyond what is already in the price series</li>
        <li>Liquidity constraints or partial-share trading restrictions</li>
        <li>Survivorship bias and look-ahead bias inherent to historical data</li>
      </ul>
      <p>
        <strong>Past performance does not guarantee or predict future results.</strong>
        Any forward projection (Monte Carlo, future testing) is a simulation
        based on historical volatility — not a forecast.
      </p>

      <h2>Data accuracy</h2>
      <p>
        Price data is sourced from third-party providers including Yahoo Finance.
        We do not guarantee its completeness, accuracy, or timeliness. Errors,
        gaps, and adjustments occur. You should independently verify any data
        before making decisions.
      </p>

      <h2>No recommendations</h2>
      <p>
        DiamondHands does not recommend any specific security, portfolio,
        strategy, or course of action. Any allocation displayed is for
        illustrative purposes only.
      </p>

      <h2>Risk acknowledgment</h2>
      <p>
        All investing involves risk, including the loss of principal.
        Diversification does not guarantee against loss. Cryptoassets are
        especially volatile and may lose all value.
      </p>

      <h2>Consult a professional</h2>
      <p>
        Before making any investment decision, you should consult a licensed
        financial advisor, accountant, and/or attorney qualified to evaluate
        your individual situation.
      </p>

      <h2>No warranty</h2>
      <p>
        DiamondHands is provided <strong>&quot;as is&quot;</strong> without warranties of any
        kind, express or implied. We are not liable for any losses arising from
        your use of the site.
      </p>
    </article>
  );
}
