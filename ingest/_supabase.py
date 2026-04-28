"""Shared Supabase client + DB helpers."""
from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]


def client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def fetch_active_assets(sb: Client) -> list[dict[str, Any]]:
    """All active assets we should be tracking."""
    res = (
        sb.table("assets")
        .select("id, symbol, type, last_price_date")
        .eq("active", True)
        .order("symbol")
        .execute()
    )
    return res.data or []


def upsert_prices(sb: Client, rows: list[dict[str, Any]]) -> None:
    """Upsert into asset_prices in batches of 1000."""
    if not rows:
        return
    BATCH = 1000
    for i in range(0, len(rows), BATCH):
        chunk = rows[i : i + BATCH]
        sb.table("asset_prices").upsert(chunk, on_conflict="asset_id,date").execute()


def update_asset_dates(sb: Client, asset_id: int, first_date: str | None, last_date: str | None) -> None:
    payload: dict[str, Any] = {}
    if first_date:
        payload["first_price_date"] = first_date
    if last_date:
        payload["last_price_date"] = last_date
    if payload:
        sb.table("assets").update(payload).eq("id", asset_id).execute()
