"use client";

import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { PercentileBand } from "@/lib/simulate/types";

interface Props {
  bands: PercentileBand[];
  height?: number;
}

interface ChartPoint {
  date: string;
  contributed: number;
  p5: number;
  p25_band: number; // p25 - p5 (stack delta for area)
  p50: number;
  p75_band: number; // p75 - p25
  p95_band: number; // p95 - p75
}

export function SimulationFanChart({ bands, height = 360 }: Props) {
  // Convert bands to stacked-area-friendly deltas
  const data: ChartPoint[] = bands.map((b) => ({
    date: b.date,
    contributed: b.contributed,
    p5: b.p5,
    p25_band: b.p25 - b.p5,
    p50: b.p50,
    p75_band: b.p75 - b.p25,
    p95_band: b.p95 - b.p75,
  }));

  return (
    <div style={{ width: "100%", height }} className="text-xs">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                p5: "5th %ile",
                p25_band: "5–25",
                p75_band: "25–75",
                p95_band: "75–95",
                p50: "Median",
                contributed: "Contributed",
              };
              return [formatCurrency(value), labels[name] ?? name];
            }}
          />
          {/* Bottom band: invisible up to p5 to position the stack */}
          <Area
            type="monotone"
            dataKey="p5"
            stackId="1"
            stroke="transparent"
            fill="transparent"
          />
          {/* p5 → p25 (outer band, low) */}
          <Area
            type="monotone"
            dataKey="p25_band"
            stackId="1"
            stroke="transparent"
            fill="hsl(var(--primary))"
            fillOpacity={0.10}
          />
          {/* p25 → p75 (interquartile, prominent) */}
          <Area
            type="monotone"
            dataKey="p75_band"
            stackId="1"
            stroke="transparent"
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
          />
          {/* p75 → p95 (outer band, high) */}
          <Area
            type="monotone"
            dataKey="p95_band"
            stackId="1"
            stroke="transparent"
            fill="hsl(var(--primary))"
            fillOpacity={0.10}
          />
          {/* Median line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
          {/* Contributions reference line */}
          <Line
            type="monotone"
            dataKey="contributed"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
