"""One-shot historical backfill.

Walks every active asset in the DB and downloads price history starting from
--start (default 2014-01-01). Idempotent: rows already in the DB are upserted.

Usage:
    export SUPABASE_URL=...
    export SUPABASE_SERVICE_ROLE_KEY=...
    python backfill.py --start 2014-01-01
"""
from __future__ import annotations

import argparse
import sys
import time
from datetime import date

from _supabase import client, fetch_active_assets, update_asset_dates, upsert_prices
from _yfinance import fetch_history, to_price_rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", default="2014-01-01", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", default=None, help="End date (YYYY-MM-DD), defaults to today")
    parser.add_argument("--symbols", nargs="*", help="Only these symbols (default: all)")
    args = parser.parse_args()

    sb = client()
    assets = fetch_active_assets(sb)
    if args.symbols:
        wanted = {s.upper() for s in args.symbols}
        assets = [a for a in assets if a["symbol"].upper() in wanted]

    total = len(assets)
    print(f"Backfilling {total} assets from {args.start} to {args.end or 'today'}")
    failed: list[str] = []

    for i, asset in enumerate(assets, start=1):
        symbol = asset["symbol"]
        try:
            print(f"  [{i:>3}/{total}] {symbol:<10} ...", end=" ", flush=True)
            df = fetch_history(symbol, start=args.start, end=args.end)
            if df.empty:
                print("no data")
                continue

            rows = to_price_rows(asset["id"], df)
            if not rows:
                print("no rows")
                continue

            upsert_prices(sb, rows)
            first = rows[0]["date"]
            last = rows[-1]["date"]
            update_asset_dates(sb, asset["id"], first_date=first, last_date=last)
            print(f"{len(rows)} rows ({first} → {last})")
        except Exception as e:  # noqa: BLE001
            print(f"FAILED: {e}")
            failed.append(symbol)

        # be polite to Yahoo
        time.sleep(0.5)

    print()
    print(f"Done. {total - len(failed)}/{total} succeeded.")
    if failed:
        print(f"Failed: {', '.join(failed)}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
