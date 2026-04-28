"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { NavPoint } from "@/lib/paper/nav";

interface Props {
  data: NavPoint[];
  benchmarkLabel?: string;
  height?: number;
}

export function NavChart({ data, benchmarkLabel, height = 320 }: Props) {
  const step = Math.max(1, Math.floor(data.length / 500));
  const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1);
  const hasBenchmark = sampled.some((d) => d.benchmark != null);

  return (
    <div style={{ width: "100%", height }} className="text-xs">
      <ResponsiveContainer>
        <AreaChart data={sampled} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="dh-nav-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Portfolio"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#dh-nav-fill)"
            dot={false}
          />
          {hasBenchmark && (
            <Line
              type="monotone"
              dataKey="benchmark"
              name={benchmarkLabel ?? "Benchmark"}
              stroke="hsl(210 90% 70%)"
              strokeWidth={1.5}
              dot={false}
            />
          )}
          <Line
            type="monotone"
            dataKey="contributed"
            name="Net deposits"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
