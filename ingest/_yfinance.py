"""yfinance helpers — download EOD price history, normalize to our schema."""
from __future__ import annotations

import time
from datetime import date
from typing import Any

import pandas as pd
import yfinance as yf


def fetch_history(symbol: str, start: str, end: str | None = None, retries: int = 3) -> pd.DataFrame:
    """Download EOD history. Returns a DataFrame indexed by date."""
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            df = yf.download(
                symbol,
                start=start,
                end=end,
                interval="1d",
                auto_adjust=False,
                progress=False,
                threads=False,
            )
            if df is None or df.empty:
                return pd.DataFrame()
            # yfinance can return MultiIndex columns when only one symbol — flatten
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            return df
        except Exception as e:  # noqa: BLE001
            last_err = e
            time.sleep(2 ** attempt)
    if last_err:
        raise last_err
    return pd.DataFrame()


def to_price_rows(asset_id: int, df: pd.DataFrame) -> list[dict[str, Any]]:
    """Convert a yfinance DataFrame into asset_prices rows."""
    if df.empty:
        return []

    rows: list[dict[str, Any]] = []
    for idx, row in df.iterrows():
        d = idx.date() if hasattr(idx, "date") else idx
        if isinstance(d, date):
            date_str = d.isoformat()
        else:
            date_str = str(d)[:10]

        close = _num(row.get("Close"))
        if close is None:
            continue  # skip empty rows

        adj = _num(row.get("Adj Close"))
        if adj is None:
            adj = close

        rows.append({
            "asset_id": asset_id,
            "date": date_str,
            "open":  _num(row.get("Open")),
            "high":  _num(row.get("High")),
            "low":   _num(row.get("Low")),
            "close": close,
            "adj_close": adj,
            "volume": _int(row.get("Volume")),
        })
    return rows


def _num(v: Any) -> float | None:
    try:
        if v is None:
            return None
        f = float(v)
        if f != f:  # NaN check
            return None
        return round(f, 4)
    except (TypeError, ValueError):
        return None


def _int(v: Any) -> int | None:
    try:
        if v is None:
            return None
        f = float(v)
        if f != f:
            return None
        return int(f)
    except (TypeError, ValueError):
        return None
