import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { displaySymbol } from "@/lib/utils";
import type { BacktestParams, BacktestResult } from "@/lib/backtest/types";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function og(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("scenarios")
    .select("name, params, results")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .single();

  const sc = data as { name: string; params: BacktestParams; results: BacktestResult | null } | null;
  const m = sc?.results?.metrics;
  const total = m ? `${m.totalReturn >= 0 ? "+" : ""}${(m.totalReturn * 100).toFixed(1)}%` : "—";
  const cagr  = m ? `${(m.cagr * 100).toFixed(1)}% CAGR` : "—";
  const dd    = m ? `${(m.maxDrawdown * 100).toFixed(1)}% max DD` : "—";
  const positive = (m?.totalReturn ?? 0) >= 0;

  const allocation = sc?.params.assets.slice(0, 4)
    .map((a) => `${Math.round(a.weight * 100)}% ${displaySymbol(a.symbol)}`)
    .join(" · ") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0A0E1A 0%, #121826 100%)",
          color: "#F8FAFC",
          padding: 64,
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 600 }}>
          <svg width="36" height="36" viewBox="0 0 32 32">
            <path d="M16 3 L29 15.5 L3 15.5 Z" fill="#5EEAD4" />
            <path d="M3 16.5 L29 16.5 L16 29 Z" fill="#5EEAD4" fillOpacity="0.65" />
          </svg>
          <span>diamondhands</span>
        </div>

        <div style={{ marginTop: 56, fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000, display: "flex" }}>
          {sc?.name ?? "Untitled scenario"}
        </div>

        <div style={{ marginTop: 16, fontSize: 24, color: "#94A3B8", display: "flex" }}>
          {allocation}
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 2 }}>Total return</div>
            <div style={{ fontSize: 96, fontWeight: 800, color: positive ? "#34D399" : "#F87171", lineHeight: 1 }}>{total}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 28, color: "#F8FAFC" }}>{cagr}</div>
            <div style={{ fontSize: 22, color: "#94A3B8" }}>{dd}</div>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 16, color: "#64748B", display: "flex" }}>
          Hypothetical results · diamondhands.space
        </div>
      </div>
    ),
    { ...size },
  );
}
