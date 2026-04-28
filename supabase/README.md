# Supabase

Schema, RLS policies, and asset universe seed.

## Apply migrations

### Option A — Supabase CLI (recommended once linked)

```bash
supabase link --project-ref <your-ref>
supabase db push
```

### Option B — psql against the connection string

```bash
# Get connection string from Supabase dashboard → Settings → Database
export SUPABASE_DB_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

psql "$SUPABASE_DB_URL" -f migrations/0001_init.sql
psql "$SUPABASE_DB_URL" -f migrations/0002_policies.sql
psql "$SUPABASE_DB_URL" -f seed.sql
```

After this:
1. Run `python ../ingest/backfill.py --start 2014-01-01` to populate historical prices.
2. Configure GitHub Actions secrets so the daily cron can refresh prices.

## Schema overview

See `../plan/architecture.md` for the full picture. Quick reference:

- **`assets`**, **`asset_prices`** — reference data, public-readable
- **`profiles`** — auto-created on signup, extends `auth.users`
- **`portfolios`** + **`holdings`** + **`transactions`** — user portfolios (backtest templates or paper portfolios)
- **`scenarios`** — saved backtest runs with cached results, public-shareable via `share_slug`
- **`strategies`**, **`watchlists`** — Phase 3, schema reserved
