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
# Get connection string from Supabase Dashboard → Project Settings → Database → Connection string (URI tab, "Direct connection")
export SUPABASE_DB_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

psql "$SUPABASE_DB_URL" -f migrations/0001_init.sql
psql "$SUPABASE_DB_URL" -f migrations/0002_policies.sql
psql "$SUPABASE_DB_URL" -f seed.sql
```

### Option C — Paste into the Supabase SQL editor (quickest)

1. Open Supabase Dashboard → SQL Editor → New query
2. Paste the contents of `migrations/0001_init.sql` → Run
3. Paste the contents of `migrations/0002_policies.sql` → Run
4. Paste the contents of `seed.sql` → Run

## Troubleshooting

### `PGRST205 — Could not find the table 'public.assets' in the schema cache`

Two possible causes:

**1. Migrations didn't actually run.** Verify in SQL Editor:

```sql
select table_name
  from information_schema.tables
 where table_schema = 'public'
 order by table_name;
```

Expected tables: `asset_prices`, `assets`, `holdings`, `portfolios`, `profiles`,
`scenarios`, `strategies`, `transactions`, `watchlist_assets`, `watchlists`.

If the list is empty or missing tables, re-run the migrations (Option C above).

**2. Schema cache is stale.** PostgREST caches the schema and sometimes doesn't
notice newly-created tables. Force a reload:

```sql
notify pgrst, 'reload schema';
```

Or in Dashboard: **Project Settings → API → Restart server**. Cache reload takes
~10 seconds. Refresh your browser tab and try again.

## Schema overview

See `../plan/architecture.md` for the full picture. Quick reference:

- **`assets`**, **`asset_prices`** — reference data, public-readable
- **`profiles`** — auto-created on signup, extends `auth.users`
- **`portfolios`** + **`holdings`** + **`transactions`** — user portfolios
- **`scenarios`** — saved backtest runs with cached results, public-shareable via `share_slug`
- **`strategies`**, **`watchlists`** — Phase 3, schema reserved
