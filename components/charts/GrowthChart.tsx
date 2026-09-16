"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { abbr, integer, num, percent } from "@/lib/data";

/**
 * Permissive input type for compatibility with the current dashboard and
 * legacy GrowthView components that may still exist in the repository.
 */
export type GrowthChartRow = {
  mes?: string | number | null;
  total_base?: string | number | null;
  crescimento_percentual_base?: string | number | null;
  adesoes?: string | number | null;
  cancelamentos?: string | number | null;
  crescimento_liquido?: string | number | null;
  [key: string]: string | number | null | undefined;
};

export default function GrowthChart({ data }: { data: GrowthChartRow[] }) {
  const chartData = data
    .map((row) => ({
      mes: String(row.mes ?? ""),
      total_base: num(row.total_base),
      crescimento_percentual_base: num(row.crescimento_percentual_base),
    }))
    .filter(
      (row) =>
        row.mes !== "" &&
        (row.total_base !== null || row.crescimento_percentual_base !== null),
    );

  return (
    <div className="h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 28, right: 8 }}>
          <defs>
            <linearGradient id="base-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0A2D87" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0A2D87" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#e8edf5"
            strokeDasharray="3 5"
            vertical={false}
          />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="base"
            tickFormatter={abbr}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="growth"
            orientation="right"
            tickFormatter={percent}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "Crescimento percentual"
                ? percent(Number(value))
                : integer(Number(value))
            }
          />
          <Legend iconType="circle" />
          <Area
            yAxisId="base"
            type="monotone"
            dataKey="total_base"
            name="Total da base"
            stroke="#0A2D87"
            strokeWidth={4}
            fill="url(#base-area)"
            connectNulls={false}
          >
            <LabelList
              dataKey="total_base"
              position="top"
              formatter={abbr}
              fontSize={10}
            />
          </Area>
          <Line
            yAxisId="growth"
            type="monotone"
            dataKey="crescimento_percentual_base"
            name="Crescimento percentual"
            stroke="#12a66a"
            strokeWidth={4}
            dot={{ r: 5, strokeWidth: 0, fill: "#12a66a" }}
            activeDot={{ r: 7 }}
            connectNulls={false}
          >
            <LabelList
              dataKey="crescimento_percentual_base"
              position="top"
              formatter={percent}
              fontSize={10}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
