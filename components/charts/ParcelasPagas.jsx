"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "../../lib/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((acc, item) => acc + item.value, 0);
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3 shadow-card">
      <p className="text-xs font-semibold text-muted">{label} · Q3 2026</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
      <p className="mt-1 border-t border-line pt-1 text-xs text-muted">
        Total: {formatNumber(total)} parcelas
      </p>
    </div>
  );
}

export default function ParcelasPagas({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E6E9F2" />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={{ stroke: "#E6E9F2" }}
          tick={{ fill: "#6B7794", fontSize: 13, fontWeight: 500 }}
        />
        <YAxis
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
        <Bar dataKey="pagas" name="Pagas" stackId="p" fill="#2E9E5B" radius={[0, 0, 0, 0]} maxBarSize={44} />
        <Bar dataKey="pendentes" name="Pendentes" stackId="p" fill="#D9A017" maxBarSize={44} />
        <Bar
          dataKey="atrasadas"
          name="Em atraso"
          stackId="p"
          fill="#D9483A"
          radius={[6, 6, 0, 0]}
          maxBarSize={44}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
