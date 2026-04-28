# Progress Log

Latest entries at the top.

## 2026-04-28 — Phase 0 + Phase 1 scaffolded

### Done
- **Repo**: legacy Django code moved to `legacy/`. New monorepo layout in place.
- **plan/**: this folder, `roadmap.md`, `decisions.md`, `architecture.md`, `pricing.md`, `disclaimers.md`.
- **supabase/**: migrations for `assets`, `asset_prices`, `portfolios`, `holdings`, `transactions`, `scenarios`, `strategies`, `watchlists`. RLS policies for all user-owned tables. Seed file with curated asset universe (~200 tickers).
- **ingest/**: `backfill.py` (one-shot 10y history pull) and `ingest_prices.py` (incremental nightly). Both use yfinance + supabase-py.
- **.github/workflows/**: `ingest-daily.yml` (cron at 22:00 UTC), `web-ci.yml` (typecheck + build).
- **web/**: Next.js 15 + App Router + Tailwind v3 + shadcn-style primitives (button, input, card, label, select). Supabase SSR client. Middleware for session refresh. Auth pages (login, signup, callback). Brand system (`<DiamondMark/>`, color tokens, typography).
- **Backtest engine**: `web/lib/backtest/engine.ts` — pure TS, supports lump sum + DCA + rebalancing + metrics.
- **Backtester UI**: portfolio builder (`/backtest`), asset search server route, equity curve chart (Recharts), metrics grid, save scenario, public share page (`/s/[slug]`), OG image route.
- **Legal**: `/legal/disclaimer`, `/legal/terms`, `/legal/privacy`. Footer disclaimer everywhere.
- **Landing**: hero + sample what-if scenarios + CTA.

### Next steps (you, the human)

Run these once. They are not automated because they touch your accounts.

1. **Create env vars** — copy `web/.env.example` → `web/.env.local` and fill in Supabase keys.
2. **Apply Supabase migrations**:
   ```bash
   cd supabase
   # Option A: psql against the connection string from Supabase dashboard
   psql "$SUPABASE_DB_URL" -f migrations/0001_init.sql
   psql "$SUPABASE_DB_URL" -f migrations/0002_policies.sql
   psql "$SUPABASE_DB_URL" -f seed.sql
   # Option B: use the Supabase CLI if you have it linked
   supabase db push
   ```
3. **Backfill prices** — one-shot, takes ~30 minutes for the seeded universe:
   ```bash
   cd ingest
   pip install -r requirements.txt
   export SUPABASE_URL=...
   export SUPABASE_SERVICE_ROLE_KEY=...
   python backfill.py --start 2014-01-01
   ```
4. **Configure GitHub Actions secrets** — in your repo settings, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Configure Vercel** — point project at `web/`, set env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://diamondhands.space`).
6. **Enable Google OAuth in Supabase** — Auth → Providers → Google. Add `https://diamondhands.space/auth/callback` and the Vercel preview URL pattern as redirect URLs.
7. **Run locally** to verify:
   ```bash
   cd web
   npm install
   npm run dev
   ```

### Open follow-ups (Phase 1.5 polish, before Phase 2)

- [ ] Drawdown chart on results page (data is computed, just not rendered)
- [ ] Monthly returns heatmap
- [ ] Dividend reinvestment toggle (data via yfinance `actions`)
- [ ] "What-if" SEO landing pages (`/what-if/nvda-2015` etc.)
- [ ] Sample scenarios pre-seeded in DB for empty-state demos
- [ ] Add benchmark overlay (compare your portfolio vs SPY)
- [ ] Better empty states + loading skeletons
- [ ] Mobile pass — current design is desktop-first
- [ ] Email confirmation flow polish
- [ ] Add `react-hook-form` + `zod` validation to portfolio builder

### Known gaps / non-blocking issues

- No dependency lockfile in `web/` yet — generated on first `npm install`.
- yfinance is unofficial; if Yahoo breaks the API, switch to Twelve Data free tier (already wired as fallback in `ingest_prices.py`).
- Crypto in yfinance uses `BTC-USD` format; mapped on the way in.
- Supabase free tier pauses after 7 days inactivity. First user request wakes it (~1s cold start). Ignore until it's a UX issue.
