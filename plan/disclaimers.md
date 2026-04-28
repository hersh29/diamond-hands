# Disclaimers & Liability Strategy

## The frame

DiamondHands is an **educational and research tool**, not an investment service. We do not give advice. We are not a broker. We are not a fiduciary. Users come here to *explore historical data and hypothetical scenarios.* That framing must be preserved end-to-end.

This is the same legal posture as Portfolio Visualizer, Backtest by Curvo, TradingView paper accounts, etc.

## Surface-level disclaimers

These appear in the UI, in this exact wording, repeatedly. Don't paraphrase.

### Footer (every page)

> DiamondHands provides educational tools, not investment advice. All results
> are hypothetical and based on historical data which may contain errors.
> Past performance does not guarantee future results.

### Chart caption (every chart)

> Hypothetical results. Past performance does not predict future returns.

### "Future Testing" / Monte Carlo section

> Forecasts are simulations based on historical volatility, not predictions.
> Actual future returns may differ significantly.

### First-run modal (signup)

> Welcome to DiamondHands.
>
> Before you continue, please understand:
> - This is a research and education tool, not investment advice.
> - We do not recommend any specific investments.
> - Hypothetical backtest results do not guarantee future returns.
> - Always do your own research and consult a licensed financial advisor before
>   making investment decisions.
>
> [I understand]

User must click through. Acknowledgement is logged in `users.disclaimer_accepted_at`.

## Page-level disclosures

### `/legal/disclaimer`

The full Investment Disclaimer page. Covers:
1. **Not investment advice** — no fiduciary relationship, no advisory relationship, no recommendations
2. **Not a broker-dealer** — we cannot execute trades; paper trading is simulated only
3. **Hypothetical results** — survivorship bias, look-ahead bias, transaction costs not modeled, taxes not modeled
4. **Data accuracy** — sourced from third parties (Yahoo Finance), may contain errors, may be delayed, may be incomplete
5. **No warranty** — service provided "as is," no liability for losses
6. **Risk acknowledgment** — investing involves risk including loss of principal
7. **Consult a professional** — licensed advisor for personalized advice

### `/legal/terms`

Standard ToS:
- Account responsibilities
- Acceptable use (no scraping, no resale of data)
- Indemnification
- Limitation of liability (cap at fees paid in last 12 months — typically $0 for free users, $60 max)
- Governing law (Delaware or wherever the entity is)
- Termination
- Changes to terms

### `/legal/privacy`

Standard privacy:
- What we collect (email, name from Google, scenarios you save, IP for rate limiting)
- What we don't collect (no tracking pixels beyond Vercel Analytics, no fingerprinting)
- Third parties (Supabase, Vercel, Google OAuth, Resend for email)
- Your rights (export, delete, GDPR/CCPA if applicable)
- Cookies (essential auth cookies only, no third-party trackers)

## Language to NEVER use

These phrases create implied advice and legal exposure:

- ❌ "We recommend..."
- ❌ "You should buy..."
- ❌ "Best stocks for..."
- ❌ "This is a good investment"
- ❌ "Beat the market"
- ❌ "Guaranteed returns"
- ❌ "Risk-free"
- ❌ Phrases personalizing advice ("for someone like you...")

## Language we DO use

- ✅ "Backtest a portfolio of..."
- ✅ "If you had invested..."
- ✅ "Historically, this allocation returned..."
- ✅ "Compare hypothetical performance"
- ✅ "Explore scenarios"
- ✅ "Simulation results"

## Operational rules

1. **No personalized advice ever.** Even support emails should never recommend specific positions.
2. **No "expert" framing.** We are not analysts, not advisors, not professionals.
3. **Show our work.** Every metric should be explainable. CAGR formula visible, etc.
4. **Time-stamp data.** Every chart shows "data through {date}".
5. **Acknowledge limitations.** Backtests don't model: taxes, slippage, dividend timing, fund fees, real-world execution.

## If a user emails asking "should I buy X?"

Canned response:

> Thanks for reaching out. DiamondHands is a research tool, not an advisory
> service — we can't tell you whether any specific investment is right for you.
> For personalized advice, please consult a licensed financial advisor.
>
> If you're trying to do something specific in the product (run a backtest,
> import a portfolio, etc.), I'd love to help with that.

## Insurance / entity

When MRR > $500/mo:
- Form an LLC (Delaware or home state, ~$200/yr)
- Get tech E&O insurance (~$50-100/mo, optional)
- Consult a fintech-savvy lawyer for one-time ToS/disclaimer review (~$500)

Until then: ToS and disclaimer are based on industry templates and the patterns used by Portfolio Visualizer, Curvo, etc. Not a substitute for legal review but adequate for free educational tools.
