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
import { formatBRL, formatNumber } from "../../lib/format";
import {
  detectLabelKey,
  detectNumericKeys,
  prettyLabel,
  colorForKey,
  looksLikeCurrency,
} from "../../lib/dataUtils";

// Gráfico de barras genérico para as sub-visões de "Orçado vs Realizado"
// (baseline / alavanca / consolidado). Detecta a chave de rótulo e todas as
// chaves numéricas presentes nas linhas reais do JSON — não assume nomes fixos.

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3 shadow-card">
      <p className="text-xs font-semibold text-muted">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {currency ? formatBRL(item.value) : formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function OrcadoRealizado({ rows }) {
  if (!rows || !rows.length) {
    return <p className="text-sm text-muted">Sem dados para exibir nesta visão.</p>;
  }

  const labelKey = detectLabelKey(rows);
  const numericKeys = detectNumericKeys(rows, labelKey);
  const currency = numericKeys.some((k) => looksLikeCurrency(k));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }} barGap={8}>
        <CartesianGrid vertical={false} stroke="#E6E9F2" />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          axisLine={{ stroke: "#E6E9F2" }}
          tick={{ fill: "#6B7794", fontSize: 13, fontWeight: 500 }}
        />
        <YAxis
          tickFormatter={(v) => (currency ? formatBRL(v) : formatNumber(v))}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6B7794", fontSize: 12 }}
          width={currency ? 88 : 56}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: "rgba(10,45,135,0.04)" }} />
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
            fill={colorForKey(key, i)}
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
