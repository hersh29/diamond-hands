# Ingest

Python workers that pull EOD price data from Yahoo Finance and push into Supabase.

## Files

- `_supabase.py` — Supabase client + DB helpers (shared)
- `_yfinance.py` — yfinance helpers (download + normalize)
- `backfill.py` — one-shot historical pull
- `ingest_prices.py` — nightly incremental update (run by GitHub Actions)

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Required env vars (or put in .env in this directory)
export SUPABASE_URL="https://[ref].supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="..."
```

## First-time backfill

After applying migrations + seed:

```bash
python backfill.py --start 2014-01-01
```

Takes ~30 minutes for the seeded universe. Polite delay between symbols (0.5s) keeps Yahoo happy.

## Daily incremental

```bash
python ingest_prices.py
```

This is what GitHub Actions runs nightly. For each active asset, fetches from `last_price_date + 1` to today.

## Notes

- yfinance is unofficial. If Yahoo breaks the API, the failure mode is "no new prices" — the existing DB is unaffected. Plan B is to swap to Twelve Data; the helpers in `_yfinance.py` are easy to replace because they're already isolated behind `fetch_history` + `to_price_rows`.
- Crypto symbols use yfinance's `BTC-USD` format. This format is what we store in `assets.symbol`. UI should pretty-print these.
- The service role key bypasses RLS. **Never** expose it client-side.
