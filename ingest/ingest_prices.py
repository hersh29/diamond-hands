"""Daily incremental ingest.

For each active asset, fetches prices from (last_price_date + 1) through today
and upserts. Designed to run nightly via GitHub Actions.

Usage (locally or in Actions):
    export SUPABASE_URL=...
    export SUPABASE_SERVICE_ROLE_KEY=...
    python ingest_prices.py
"""
from __future__ import annotations

import sys
import time
from datetime import date, datetime, timedelta

from _supabase import client, fetch_active_assets, update_asset_dates, upsert_prices
from _yfinance import fetch_history, to_price_rows


# Default lookback if asset has never been ingested before
DEFAULT_LOOKBACK_YEARS = 10


def main() -> int:
    sb = client()
    assets = fetch_active_assets(sb)
    today = date.today()
    print(f"Daily ingest for {len(assets)} assets ({today.isoformat()})")
    failed: list[str] = []
    updated = 0

    for asset in assets:
        symbol = asset["symbol"]
        last = asset.get("last_price_date")

        if last:
            last_date = datetime.strptime(last, "%Y-%m-%d").date() if isinstance(last, str) else last
            start = (last_date + timedelta(days=1)).isoformat()
        else:
            start = (today - timedelta(days=365 * DEFAULT_LOOKBACK_YEARS)).isoformat()

        # nothing to fetch if we're already current
        if start > today.isoformat():
            continue

        try:
            df = fetch_history(symbol, start=start)
            if df.empty:
                continue
            rows = to_price_rows(asset["id"], df)
            if not rows:
                continue
            upsert_prices(sb, rows)
            update_asset_dates(sb, asset["id"], first_date=None, last_date=rows[-1]["date"])
            updated += 1
            print(f"  {symbol:<10} +{len(rows)} rows")
        except Exception as e:  # noqa: BLE001
            print(f"  {symbol:<10} FAILED: {e}")
            failed.append(symbol)

        time.sleep(0.3)  # be polite

    print()
    print(f"Done. {updated} assets updated. {len(failed)} failed.")
    if failed:
        print(f"Failed: {', '.join(failed)}")
        # don't exit non-zero on partial failure — Actions notification spam
    return 0


if __name__ == "__main__":
    sys.exit(main())
