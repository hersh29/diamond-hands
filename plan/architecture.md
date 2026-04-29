# Architecture

## High-level

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   GitHub        │    │   Vercel        │    │    Supabase      │
│   Actions       │    │   (Next.js)     │    │   (Postgres +    │
│   (cron)        │    │                 │    │    Auth + RLS)   │
│                 │    │                 │    │                  │
│  yfinance ────▶ │    │  Server Comps   │    │  ┌──────────┐    │
│  daily 22:00 UTC│ ─▶ │  + Server       │ ─▶ │  │  assets  │    │
│  upsert prices  │    │    Actions      │    │  │  prices  │    │
└─────────────────┘    │  + API routes   │    │  │portfolios│    │
                       │  + OG images    │    │  │scenarios │    │
                       │                 │    │  └──────────┘    │
                       │  Browser:       │    │                  │
                       │  - backtest     │    │  Auth: email     │
                       │    engine       │    │  + Google OAuth  │
                       │    (pure TS)    │    │                  │
                       │  - charts       │    │                  │
                       └─────────────────┘    └──────────────────┘
```

**Data flow per request:**
1. User opens `/backtest`, picks tickers + dates + amount.
2. Browser fetches needed price series from Supabase (RLS-allowed read on `asset_prices`).
3. Backtest engine runs **in the browser** — produces equity curve + metrics.
4. User clicks "Save" → POST to `/api/scenarios` → server inserts into Supabase.
5. Public share URL `/s/[slug]` re-runs the backtest server-side for SEO + OG image.

**Why client-side compute:** zero infrastructure cost, works offline once data is loaded, browser CPU is free to us.

## Repo layout

```
diamond-hands/
├── web/                      # Next.js 15 app (Vercel)
│   ├── app/                  # App Router routes
│   ├── components/           # UI components + ui/ primitives
│   ├── lib/
│   │   ├── supabase/         # SSR client / server / middleware
│   │   └── backtest/         # Engine + metrics + types
│   ├── public/
│   └── package.json
├── ingest/                   # Python ingestion worker
│   ├── backfill.py           # one-shot historical pull
│   ├── ingest_prices.py      # nightly incremental
│   └── requirements.txt
├── supabase/
│   ├── migrations/           # versioned SQL
│   └── seed.sql              # asset universe
├── .github/workflows/
│   ├── ingest-daily.yml      # cron 22:00 UTC
│   └── web-ci.yml
├── legacy/                   # archived Django code
├── plan/                     # this folder
└── README.md
```

## Database schema (Supabase Postgres)

### Reference data
- **`assets`** — `(id, symbol, name, type, exchange, currency, active, first_price_date, last_price_date)` — the universe we support. Type is `stock | etf | crypto`.
- **`asset_prices`** — `(asset_id, date, open, high, low, close, adj_close, volume)` — primary key `(asset_id, date)`. ~110MB for 200 tickers × 12 years.

### User data (RLS-protected)
- **`portfolios`** — `(id, user_id, name, type, is_public, share_slug, created_at)` — type is `backtest | paper`. Only paper portfolios track real cash + holdings. Backtest portfolios are templates.
- **`holdings`** — `(portfolio_id, asset_id, weight, shares, cost_basis, opened_at)`. For backtest portfolios `weight` is set, `shares` null. For paper portfolios both are populated.
- **`transactions`** — `(id, portfolio_id, asset_id, type, shares, price, executed_at, fees)` — paper trading buys/sells/dividends/cash flows.
- **`scenarios`** — `(id, user_id, portfolio_id, params_jsonb, results_jsonb, share_slug, is_public, created_at)` — saved backtest runs. `params` = inputs (dates, amount, contributions). `results` cached for fast loading on share pages.
- **`strategies`** — `(id, user_id, portfolio_id, rules_jsonb, last_run_at)` — Phase 3.
- **`watchlists`** + **`watchlist_assets`** — Phase 2/3.

### RLS rules
- All user-owned tables: `auth.uid() = user_id` for select/insert/update/delete.
- `is_public = true` rows: anyone can SELECT (for share pages).
- `assets`, `asset_prices`: read for `anon` and `authenticated`. Service role writes.

## Auth

- Supabase Auth with **email/password** and **Google OAuth**.
- `@supabase/ssr` for Next.js cookie-based sessions.
- `web/middleware.ts` refreshes the session on every request.
- Protected routes (e.g. `/dashboard`, `/paper`) gate server-side via `getUser()` in the route's server component.
- The backtester (`/backtest`) works for anonymous users — saving a scenario triggers a sign-in nudge.

## Backtest engine (TypeScript)

Lives in `web/lib/backtest/engine.ts`. Pure functions, no I/O.

**Inputs:**
```ts
type BacktestParams = {
  assets: { symbol: string; weight: number }[];   // weights sum to 1
  startDate: string;     // YYYY-MM-DD
  endDate: string;
  initialAmount: number;
  contribution?: { amount: number; frequency: 'monthly' | 'biweekly' | 'weekly' };
  rebalance?: 'never' | 'monthly' | 'quarterly' | 'annually';
}
```

**Algorithm:**
1. Fetch aligned price matrix from Supabase (one query, all assets, date range).
2. Forward-fill missing prices (weekends/holidays).
3. At t=0, allocate `initialAmount` per weights → compute `shares[asset]`.
4. For each subsequent trading day:
   - Compute portfolio value = `Σ shares[a] × price[a, t]`.
   - On contribution date: add cash, buy per current weights.
   - On rebalance date: liquidate to cash, re-allocate to target weights.
5. Track cumulative contributions for "money in" vs "value" plot.
6. Compute metrics from the equity curve.

**Metrics:**
- **CAGR** — `(end / start) ^ (1/years) - 1`
- **Volatility** — annualized stdev of daily returns × √252
- **Sharpe** — `(CAGR - rf) / volatility`, rf = 4% (configurable)
- **Max drawdown** — largest peak-to-trough decline
- **Best/worst year** — max/min calendar-year return
- **Total return** — `(end - total_contributed) / total_contributed`

## Ingestion

- **Backfill** (`ingest/backfill.py`): one-shot. Walks the `assets` table, downloads 10y of yfinance EOD per ticker, bulk-upserts to `asset_prices`. ~30 min total for ~200 tickers.
- **Daily** (`ingest/ingest_prices.py`): GitHub Actions cron at 22:00 UTC. For each active asset, fetches from `last_price_date + 1` to today. Upserts. Updates `assets.last_price_date`.
- **Crypto symbols**: yfinance uses `BTC-USD` format; we store as `BTC-USD` in `symbol`. UI displays as `BTC`.

## Forward simulation

Lives at `/simulate`. Pure TypeScript Monte Carlo in `lib/simulate/engine.ts`.

**Algorithm:**
1. Compute the portfolio's daily weighted returns from the historical price matrix.
2. Aggregate into monthly compound returns.
3. For each of N simulations (500 / 1000 / 2000), build a forward path of M months by **sampling monthly returns with replacement**, applying contributions on schedule.
4. At each projected month, compute percentile bands (p5 / p25 / p50 / p75 / p95) across all paths.
5. End-of-horizon stats: median, p5, p95 with approximate CAGR.
6. Probability metrics: P(losing money), P(doubling), optional P(reaching goal).

**Why bootstrap, not GBM?** Bootstrap preserves the empirical distribution of returns including fat tails. Geometric Brownian Motion would assume normality, which is wrong for asset returns. We do however model returns as i.i.d. — autocorrelation and regime changes are deliberately not modeled, and that's in the disclaimer.

**Compute budget:** 2000 sims × 360 months × 4 ops ≈ 3M ops. Runs in <1 sec in the browser. Capped at 5000 sims as a safety floor.

## Paper trading

Lives under `/paper`. Designed around an immutable transaction log — we never mutate balances directly; everything derives from the `transactions` table and the latest known prices.

**State derivation** (`lib/paper/compute.ts`):
- Replay all transactions chronologically.
- `deposit` / `withdraw` / `dividend` adjust cash balance and net contributions.
- `buy` / `sell` adjust per-asset positions; cost basis tracked using **average-cost method**.
- Sells reduce cost basis proportionally to shares sold.

**NAV chart** (`lib/paper/nav.ts`):
- Walks the price matrix day by day, applying transactions on their execution dates.
- Produces `{date, value, contributed, benchmark?}` series.
- Benchmark line ("if same cash flow had bought SPY") makes the comparison contribution-aware — fair against DCA strategies.

**CSV import** (`lib/paper/csv.ts`):
- Auto-detects format from header columns (Robinhood / Fidelity / Schwab / Vanguard / generic).
- Normalizes to `{symbol, shares, costBasis, openedAt?}`.
- API route auto-creates a `deposit` transaction equal to total cost so cash stays consistent.
- Skips unsupported tickers (not in our `assets` table) and reports them in the response.

**Trade dialog**: three tabs — Buy (search asset, shares, price, fees, date), Sell (with max-shares hint), Cash (deposit / withdraw / dividend).

## Sharing & SEO

- Saved scenarios get a **6-char slug** (nanoid), stored at `scenarios.share_slug`.
- Public share URL: `https://diamondhands.space/s/{slug}`.
- That route is server-rendered, runs the backtest engine on the server (Node.js, same TS code), generates HTML + OG image.
- OG image: `app/s/[slug]/opengraph-image.tsx` using `@vercel/og` (free on Hobby tier).

## Cost ceiling triggers

| Trigger | Action |
|---|---|
| Supabase DB > 400MB | Audit `asset_prices`. Drop pre-2014 if needed. |
| Supabase egress > 1.5GB/mo | Investigate; cache aggressively at the edge. |
| Vercel function invocations approaching limit | Move heavy ops to client. |
| Resend > 2.5k/mo emails | Gate non-essential emails to paid tier. |
| Yahoo Finance breaks | Switch ingest to Twelve Data (env var). |

## Security

- `.env.local` never committed.
- Supabase **service role key** used only by ingest script (in GitHub secrets) and server-only routes (in Vercel env). Never sent to client.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose; RLS enforces auth.
- CSRF: Next.js Server Actions are token-protected by default.
- All forms validate via Zod before hitting the DB.
