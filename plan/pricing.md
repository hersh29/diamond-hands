# Pricing & Feature Gates

## Status

**At launch:** all features are free, all gates are disabled. We collect users first.

**Flip the gates when:** ~500 active users OR Supabase costs cross $20/mo, whichever comes first.

## Tiers (when paywall flips)

### Free forever

- Asset universe: full US universe (~500 stocks + 50 ETFs + 20 crypto)
- Backtest: unlimited runs, lump sum + DCA
- Charts: equity curve, drawdown
- Up to **3 saved scenarios**
- Up to **1 paper portfolio** with **10 positions**
- **1 CSV import per month**
- Monte Carlo: **500 simulations**
- Public share URLs (with DiamondHands branding — they're our billboards)

### Diamond+ — $5/mo or $48/yr

- Unlimited saved scenarios
- Unlimited paper portfolios
- **Strategy backtester** (rule-based: rebalancing, threshold triggers, DCA schedules)
- Monte Carlo: 10,000 simulations with bootstrapped historical returns
- Unlimited CSV imports + scheduled refresh
- Email alerts (price/strategy triggers, rebalance reminders)
- Private scenarios + custom-branded share cards
- Data export (CSV/JSON)
- Priority feature requests / Discord access

### Founding Member — $48 lifetime

- Available only to first 100 paying signups
- Locks in `Diamond+` features forever, no annual renewal
- "Founder" badge on public scenarios
- Listed in `/founders` credits page
- Marketing instrument: gives early users skin in the game and us a one-time cash bump

## Why these prices

- **$5/mo** is below the "I'd cancel during cleanup" threshold for most retail investors
- Beats Sharesight ($10-30), ProjectionLab ($9), Composer ($24+) on price
- $48/yr matches "annual paid is 20% off monthly" expectation
- $48 lifetime is high enough to feel like commitment, low enough to feel like a steal

## Math

| Users | Free | Paid (10%) | MRR | Costs | Net |
|---|---|---|---|---|---|
| 500 | 450 | 50 × $5 | $250 | ~$0 | +$250 |
| 1,000 | 900 | 100 × $5 | $500 | ~$25 (Supabase Pro) | +$475 |
| 5,000 | 4,500 | 500 × $5 | $2,500 | ~$80 (Supabase + Resend + EODHD) | +$2,420 |

**Goal:** $1,000 MRR within 12 months of paywall flip. Achievable with 200 paying users.

## What we will not charge for

- Reading public scenarios shared by paid users
- Reading legal/disclosure pages
- Newsletter signup
- The first three saved scenarios (we want sticky free users)

## What we will never sell

- User data
- Aggregated portfolio data
- Ad inventory in the product
- Lead gen to brokers (this is the dirty model — we won't)

Revenue model is subscriptions only.
