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
import { detectLabelKey, detectNumericKeys, prettyLabel, colorForKey } from "../../lib/dataUtils";

// Barras empilhadas para "parcelasPagas.dados". As chaves numéricas viram os
// segmentos da pilha automaticamente (ex.: pagas / pendentes / atrasadas —
// ou quaisquer nomes que o Excel real utilizar).

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((acc, item) => acc + item.value, 0);
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3 shadow-card">
      <p className="text-xs font-semibold text-muted">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
      <p className="mt-1 border-t border-line pt-1 text-xs text-muted">
        Total: {formatNumber(total)}
      </p>
    </div>
  );
}

export default function ParcelasPagas({ rows }) {
  if (!rows || !rows.length) {
    return <p className="text-sm text-muted">Sem dados para exibir nesta visão.</p>;
  }

  const labelKey = detectLabelKey(rows);
  const numericKeys = detectNumericKeys(rows, labelKey);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E6E9F2" />
        <XAxis
          dataKey={labelKey}
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
        {numericKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            name={prettyLabel(key)}
            stackId="stack"
            fill={colorForKey(key, i)}
            radius={i === numericKeys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={44}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
