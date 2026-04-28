"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DrawdownPoint } from "@/lib/backtest/types";
import { formatPercent } from "@/lib/utils";

interface Props {
  data: DrawdownPoint[];
  height?: number;
}

export function DrawdownChart({ data, height = 220 }: Props) {
  // Down-sample to ~500 points for browser perf on long ranges
  const step = Math.max(1, Math.floor(data.length / 500));
  const sampled = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => ({ date: d.date, drawdown: d.drawdown * 100 }));

  return (
    <div style={{ width: "100%", height }} className="text-xs">
      <ResponsiveContainer>
        <AreaChart data={sampled} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="dh-dd-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="hsl(var(--loss))" stopOpacity={0} />
              <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
            tickFormatter={(v: string) => v.slice(0, 7)}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            domain={["dataMin", 0]}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(value: number) => [formatPercent(value), "Drawdown"]}
          />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="hsl(var(--loss))"
            strokeWidth={1.5}
            fill="url(#dh-dd-fill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
