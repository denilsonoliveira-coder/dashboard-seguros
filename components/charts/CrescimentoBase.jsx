"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "../../lib/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3 shadow-card">
      <p className="text-xs font-semibold text-muted">{label} · Q3 2026</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function CrescimentoBase({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E6E9F2" />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={{ stroke: "#E6E9F2" }}
          tick={{ fill: "#6B7794", fontSize: 13, fontWeight: 500 }}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(v) => formatNumber(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6B7794", fontSize: 12 }}
          width={64}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v) => formatNumber(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6B7794", fontSize: 12 }}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(10,45,135,0.04)" }} />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: 13, color: "#1B2340", paddingBottom: 12 }}
        />
        <Bar
          yAxisId="right"
          dataKey="adesoes"
          name="Novas adesões"
          fill="#B4C0E7"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          yAxisId="right"
          dataKey="cancelamentos"
          name="Cancelamentos"
          fill="#F1B4AD"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="base"
          name="Base ativa"
          stroke="#0A2D87"
          strokeWidth={3}
          dot={{ r: 4, fill: "#0A2D87" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
