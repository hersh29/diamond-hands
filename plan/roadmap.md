# DiamondHands Roadmap

## North star

A modern, beautiful, fast portfolio backtester + paper-trading sandbox. The "Portfolio Visualizer killer" with a viral what-if scenario engine on top, plus a paper trading mode where users import real holdings and run strategies against them. **US-only at launch.** Free at launch; paywall flips on once we hit ~500 active users.

Constraint: solo dev, $5/mo recurring spend cap until paying users arrive. Stack is Vercel + Supabase + GitHub Actions. No Hetzner, no third-party brokerage connect at launch.

## Phases

### Phase 0 — Foundation ✅ shipped
- Monorepo restructured (`web/`, `ingest/`, `supabase/`, `legacy/`, `plan/`)
- Supabase schema, RLS, seed asset universe
- Python ingest worker (yfinance → Supabase)
- GitHub Actions: nightly cron + web CI
- Next.js 15 scaffold on Vercel, deployed at `diamondhands.space`
- Auth: email + Google (Supabase)
- Brand system: logo, colors, type, dark theme
- Legal pages (disclaimer / terms / privacy)

### Phase 1 — Backtester ✅ shipped
- Asset search (top US stocks + ETFs + crypto)
- **Basic mode** ("What if I'd invested X in Y in YYYY?") — single-asset, year-preset, hero outcome
- **Advanced mode** — multi-asset portfolio builder, lump sum + DCA, rebalancing
- Mode toggle with URL state for shareability
- Charts: equity curve, drawdown
- Metrics: CAGR, volatility, Sharpe, max drawdown, total return, best/worst year, year-by-year breakdown
- SPY benchmark overlay with contribution-aware comparison
- Save scenario → public share URL → OG image
- First-run disclaimer modal
- Landing page with hero + sample scenarios

### Phase 2 — Paper trading ✅ shipped
- CSV import with auto-detect (Robinhood, Fidelity, Schwab, Vanguard, generic)
- Manual buy / sell / cash flow entry via the trade dialog
- Daily NAV tracking computed from transactions + price matrix
- Performance vs SPY benchmark (same-cash-flow comparison)
- Holdings table with avg-cost cost basis + per-row Buy/Sell quick actions
- Transaction history

### Phase 3 — Strategies & polish (in progress)
- ✅ **Monte Carlo simulation (`/simulate`)** — bootstrapped historical returns, percentile bands, probability metrics
- Rule-based strategy builder (rebalance triggers, DCA schedules)
- Asset correlation matrix, efficient frontier
- Email digests (Resend) — weekly performance summaries
- Monthly returns heatmap
- Dividend auto-tracking
- Mobile-first UX pass

### Phase 4 — Monetization
- Stripe integration
- Feature gates flip on (per `pricing.md`)
- Founding-member lifetime deal at $48 to early signups
- Public scenario directory for SEO

### Phase 5+ — Expansion
- Geo: UCITS ETFs, GBP/EUR/INR backtesting
- Brokerage connection via SnapTrade (gated to paid tier — $0.50/account/mo cost)
- Strategy marketplace / shared portfolios
- Mobile-first UX pass

## Success metrics

| Phase | Target |
|---|---|
| 1 | Backtester functional end-to-end. ~10 friends test. |
| 2 | First non-friend signups. 50+ scenarios saved. |
| 3 | 500+ MAU. Email open rate > 30%. |
| 4 | First $1 of revenue. Confirm willingness-to-pay. |
| 5+ | $1k MRR. Decide on dedicated time investment. |

## Out of scope (forever, or until we explicitly revisit)

- Active-trading / TA strategy backtesting (RSI, MACD, etc.) — different audience
- Real-time / intraday data — EOD is enough
- Direct brokerage execution — we are not a broker
- Tax filing / cost-basis CPA-grade reports — different product
- Personalized investment advice — never. Liability black hole.
