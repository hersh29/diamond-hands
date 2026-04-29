# Progress Log

Latest entries at the top.

## 2026-04-28 (late) — Production readiness: fonts, mobile, cleanup, error handling

### Fonts
- Swapped Geist → **Space Grotesk** (sans) + **JetBrains Mono** (numerics) via `next/font/google`. Better fit for the diamond + .space brand. Removed `geist` dependency.

### Mobile responsiveness
- New `<MobileNav>` with hamburger button, full-screen overlay, scroll lock, route-change auto-close.
- Holdings table: separate mobile card layout (no horizontal scroll).
- Transactions list: separate mobile card layout.
- Asset search popover: now `w-[calc(100vw-2rem)]` capped at 420px so it never overflows on phone.
- Skip-to-content link in `layout.tsx` for keyboard users.
- `viewport` meta with `themeColor` `#0A0E1A` and `maximumScale=5`.
- `manifest.webmanifest` for PWA-grade install support.

### Production polish
- `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` — global states with the brand mark.
- `app/robots.ts` — disallow private routes (`/api/`, `/dashboard`, `/paper/*`, `/auth/`).
- `app/sitemap.ts` — surfaces public marketing pages for search engines.
- Login / signup pages restyled to terminal aesthetic.
- Disclaimer modal restyled to match.
- Legal pages: eyebrow label, mono date, prose tightening.

### Personal references removed
- `harsh2995@gmail.com` removed from `/legal/terms` and `/legal/privacy` — replaced with `hello@diamondhands.space`.
- No personal references anywhere else in `web/`, `supabase/`, `ingest/`, `plan/`.

### Supabase troubleshooting
- `supabase/README.md` now covers the `PGRST205` error explicitly: SQL to verify tables exist, `notify pgrst, 'reload schema'` to refresh PostgREST cache, fallback to "Restart server" in dashboard.

---

## 2026-04-28 (evening) — Polish pass: security, cleanup, modernized UI

### Security
- Added HTTP security headers in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, X-DNS-Prefetch-Control. `poweredByHeader: false` strips the `X-Powered-By: Next.js` fingerprint.
- Audited API routes (`/api/scenarios`, `/api/paper/portfolios/*`, `/api/paper/portfolios/[id]/*`): every mutation requires `auth.uid()` and verifies portfolio ownership. RLS is the second line of defense.
- Removed unused `createServiceClient` helper from `lib/supabase/server.ts` — no service-role code is reachable from the web app yet, so it shouldn't be there as a footgun.

### OAuth resilience
- `/auth/callback`: now forwards Supabase error params (`bad_oauth_state` etc.) to `/login` with a friendly message instead of erroring out silently.
- `/` (home): if Supabase falls back to the Site URL with error params (happens when the user-supplied `redirectTo` isn't allow-listed), we forward to `/login` so the user sees a real error instead of a confused landing page.
- `/login`: shows a friendly red banner with translated messages for known error codes.

### UI/UX modernization (Robinhood + SpaceX)
- **Design tokens**: tighter radius (0.625rem → 0.375rem), stronger card-vs-bg contrast, mono-numerics utility (`tabular`), eyebrow utility (`eyebrow`), display-num utility, `terminal-card` style.
- **`<Kpi>` + `<KpiBar>` + `<KpiCell>`** primitives in `components/kpi.tsx` — Robinhood-style big-number stat blocks. Used on dashboard, paper detail, backtest results.
- **Header / footer**: cleaner layout, mono-uppercase status pills, "System online · v0.1" indicator.
- **Landing page**: bigger hero with gradient headline, status pill, terminal-style typography for accents.
- **Dashboard**: greeting, KPI bar (scenarios / paper portfolios / plan / universe), terminal-card list items.
- **Paper portfolio detail**: mission-control header, hero KPI bar (Total value / Return / Cash / Positions), tighter benchmark chart panel.
- **Backtest results**: KPI bar moved above the equity curve (most important numbers visible first); secondary stats in two dense terminal panels showing CAGR / vol / Sharpe / drawdown / vs SPY / alpha.
- **Share page (`/s/[slug]`)**: matches the runner — KPI bar at top, allocation pills, equity + drawdown.
- **Explore + paper list**: terminal-card aesthetic with mono-tagged tickers.

### Code cleanup
- Removed dead `createServiceClient` export.
- Trimmed unused imports across modified files.
- Consolidated metric rendering into `MetricsGrid` + `Kpi` primitives — one source of truth for numerics styling.

---

## 2026-04-28 (afternoon) — Phase 1.5 polish + Phase 2 paper trading

### Done

**Phase 1.5 polish on the backtester:**
- **Drawdown chart** rendered on backtest results and shared scenario pages (`web/components/drawdown-chart.tsx`).
- **SPY benchmark overlay** — engine now optionally simulates an identical-cash-flow allocation into a benchmark symbol; equity curve chart and metrics grid show the comparison; "Compare against SPY" toggle on the runner.
- **First-run disclaimer modal** — shows once on dashboard for new users; acknowledgement stored in `profiles.disclaimer_accepted_at`.

**Phase 2 paper trading — full feature:**
- Schema-only changes: none (Phase 0 schema already supported it).
- **Routes**:
  - `/paper` — list of paper portfolios
  - `/paper/new` — create form (name + initial virtual cash)
  - `/paper/[id]` — portfolio detail (summary cards, NAV chart vs SPY, holdings, transactions)
  - API: `POST /api/paper/portfolios`, `DELETE /api/paper/portfolios/[id]`, `POST /api/paper/portfolios/[id]/transactions`, `POST /api/paper/portfolios/[id]/import`
- **Pure logic**:
  - `lib/paper/compute.ts` — replays transactions to derive cash balance + holdings + cost basis (avg-cost method)
  - `lib/paper/nav.ts` — daily NAV series across the price matrix, with optional benchmark
  - `lib/paper/csv.ts` — CSV parser with auto-detection for Robinhood / Fidelity / Schwab / Vanguard + generic fallback
- **UI components**:
  - `holdings-table` (with per-row Buy / Sell quick actions)
  - `transactions-list`
  - `nav-chart` (portfolio value vs SPY benchmark, dashed line for cumulative deposits)
  - `trade-dialog` (3 tabs: Buy / Sell / Cash; Cash supports deposit / withdraw / dividend)
  - `import-button` (paste CSV → preview parsed positions → confirm import)
  - `delete-portfolio-button` (confirmation dialog, hard delete)
- **Dashboard** now lists paper portfolios alongside saved scenarios; both "New backtest" and "New paper portfolio" CTAs.
- **Site header** + **footer** link to `/paper`.
- **Landing page** copy updated — paper trading is live, no longer "coming next."

### Architecture notes for paper trading

- We don't store running balances. **Everything derives from the immutable `transactions` table** + the latest known prices. Edit a single transaction and all downstream numbers recompute correctly. This is the right call for a paper-trading app where users will fix their own mistakes.
- Cost basis uses **average-cost method** (industry-standard default for retail brokerages). FIFO/LIFO can be added later if requested.
- CSV import auto-creates a corresponding `deposit` transaction equal to the total cost of imported positions, so the cash balance stays self-consistent regardless of when positions were imported.
- The NAV chart's benchmark line answers "what if you'd put the same money into SPY on the same dates" — a fair, contribution-aware comparison.

### Next steps (you, the human)

If you've already done the env-var + migration + ingest dance from the prior log, the only thing you need now is **push & redeploy**. No new env vars or migrations.

- [ ] `git push` from `main`
- [ ] Vercel will auto-deploy
- [ ] Visit `/paper` — confirm portfolio creation works
- [ ] Try a CSV paste like:
      ```
      Symbol,Quantity,Average Cost
      AAPL,5,150.25
      VOO,3,420.00
      BND,10,72.10
      ```

### Open follow-ups (Phase 3 ideas, not blocking)

- [ ] Strategy rule builder (e.g. "rebalance quarterly", "DCA $500/month")
- [ ] Monte Carlo retirement projection (bootstrapped historical returns)
- [ ] Asset correlation matrix, efficient frontier
- [ ] Email digests via Resend (weekly portfolio summary)
- [ ] Monthly returns heatmap (data is computable, chart is unbuilt)
- [ ] "What-if" SEO landing pages (`/what-if/nvda-2015` etc.)
- [ ] Sample scenarios pre-seeded for empty-state demos
- [ ] Mobile polish pass (current design is desktop-first)
- [ ] Strategy backtester (`strategies` table is already in schema, unused)
- [ ] Dividend auto-tracking (yfinance has `actions` data we don't yet ingest)
- [ ] Better empty states across paper / dashboard / explore

### Known gaps

- yfinance is unofficial; if Yahoo breaks the API, fallback to Twelve Data (helpers in `_yfinance.py` are isolated for easy swap).
- Supabase free tier pauses after 7 days of zero activity; first request takes ~1s to wake.
- No middleware → session refresh is lazy. See `decisions.md` 2026-04-28 entry.
- CSV import currently inserts everything as "today's date" if no date column is detected. Acceptable for MVP; ideal would be per-position open dates.

---

## 2026-04-28 (morning) — Phase 0 + Phase 1 scaffolded

### Done
- **Repo**: legacy Django code moved to `legacy/`. New monorepo layout in place.
- **plan/**: this folder, `roadmap.md`, `decisions.md`, `architecture.md`, `pricing.md`, `disclaimers.md`.
- **supabase/**: migrations for `assets`, `asset_prices`, `portfolios`, `holdings`, `transactions`, `scenarios`, `strategies`, `watchlists`. RLS policies for all user-owned tables. Seed file with curated asset universe (~165 tickers).
- **ingest/**: `backfill.py` (one-shot 10y history pull) and `ingest_prices.py` (incremental nightly). Both use yfinance + supabase-py.
- **.github/workflows/**: `ingest-daily.yml` (cron at 22:00 UTC), `web-ci.yml` (typecheck + build).
- **web/**: Next.js 15 + App Router + Tailwind v3 + shadcn-style primitives. Supabase SSR client. Auth pages (login, signup, callback). Brand system (`<DiamondMark/>`, color tokens, typography).
- **Backtest engine**: `web/lib/backtest/engine.ts` — pure TS, supports lump sum + DCA + rebalancing + metrics.
- **Backtester UI**: portfolio builder (`/backtest`), asset search server route, equity curve chart (Recharts), metrics grid, save scenario, public share page (`/s/[slug]`), OG image route.
- **Legal**: `/legal/disclaimer`, `/legal/terms`, `/legal/privacy`. Footer disclaimer everywhere.
- **Landing**: hero + sample what-if scenarios + CTA.

### Deploy stabilization (same day)
- Bumped React to stable `^19.0.0`, Next to `^15.1.0`, recharts `^2.15.0` to fix peer dep conflict.
- Replaced `require()` with ESM import in `lib/supabase/server.ts` to satisfy production lint.
- Promoted `typedRoutes` from `experimental` to top-level in `next.config.ts`.
- Typed `cookiesToSet` parameter explicitly in middleware + server clients.
- Removed Next.js middleware entirely — `@supabase/realtime-js` references `__dirname` at runtime, which fails in Vercel's Edge Runtime. Rationale logged in `decisions.md`.
