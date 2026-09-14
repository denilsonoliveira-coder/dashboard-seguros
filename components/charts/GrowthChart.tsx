"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { abbr, integer, percent } from "@/lib/data";

/**
 * Uses a permissive input row so this chart remains type-compatible with both
 * the current GrowthView and older GrowthView files that may still exist in a
 * repository during migration. Only the fields used by the chart are read.
 */
type GrowthRow = Record<string, string | number | null | undefined>;

export default function GrowthChart({ data }: { data: GrowthRow[] }) {
  const chartData = data.map((row) => ({
    ...row,
    mes: String(row.mes ?? ""),
    total_base: typeof row.total_base === "number" ? row.total_base : null,
    crescimento_percentual_base:
      typeof row.crescimento_percentual_base === "number"
        ? row.crescimento_percentual_base
        : null,
  }));

  return (
    <div className="h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0A2D87" stopOpacity={0.42} />
              <stop offset="95%" stopColor="#0A2D87" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mes" />
          <YAxis yAxisId="base" tickFormatter={abbr} />
          <YAxis yAxisId="growth" orientation="right" tickFormatter={percent} />
          <Tooltip
            formatter={(value, name) =>
              name === "Crescimento percentual da base"
                ? percent(Number(value))
                : integer(Number(value))
            }
          />
          <Legend />
          <Area
            yAxisId="base"
            dataKey="total_base"
            name="Total da base"
            stroke="#0A2D87"
            strokeWidth={3}
            fill="url(#area)"
            connectNulls={false}
          />
          <Line
            yAxisId="growth"
            dataKey="crescimento_percentual_base"
            name="Crescimento percentual da base"
            stroke="#12a66a"
            strokeWidth={3}
            dot={{ r: 4 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
