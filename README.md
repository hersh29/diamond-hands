# DiamondHands

A modern, fast, beautifully-designed portfolio backtester and paper-trading
sandbox. Live at [diamondhands.space](https://diamondhands.space).

> Educational tool, not investment advice. All results are hypothetical and
> based on historical data which may contain errors. Past performance does not
> guarantee future results.

## Repo layout

```
.
├── web/                  # Next.js 15 + Tailwind + Supabase frontend  (Vercel)
├── ingest/               # Python yfinance → Supabase price ingestion (GitHub Actions)
├── supabase/             # SQL migrations, RLS policies, seed
├── .github/workflows/    # daily ingest cron + web CI
├── plan/                 # roadmap, decisions, architecture, pricing, disclaimers
└── legacy/               # archived Django v1
```

For the source of truth on direction and status, see **[`plan/`](./plan)**.

## Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind v3 + shadcn-style primitives + Recharts
- **Backend**: Supabase Postgres + Auth (email + Google OAuth) + RLS
- **Hosting**: Vercel (web) + GitHub Actions (cron) + Supabase (DB)
- **Data**: yfinance (EOD prices) — pulled nightly into Supabase
- **Charts**: Recharts
- **OG images**: `@vercel/og`

Total recurring cost at zero users: **$0/mo**. See `plan/architecture.md`.

## Quick start (local)

Pre-flight assumed:
- Supabase project created
- Vercel project created and pointed at `web/`
- GitHub repo with secrets configured

```bash
# 1) Apply DB schema
psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/0002_policies.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql

# 2) Backfill historical prices
cd ingest
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
python backfill.py --start 2014-01-01

# 3) Run the web app
cd ../web
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

Detailed setup steps are in `plan/progress.md`.

## License

TBD. Repo is public for free GitHub Actions minutes — license terms forthcoming.
