"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "../../lib/format";
import { detectLabelKey, detectNumericKeys, prettyLabel, colorForKey } from "../../lib/dataUtils";

// Usado para as três sub-visões de "crescimentoBaseVsAdesoes":
// - crescimentoBase: normalmente tem uma chave "base" (evolução da base) →
//   renderizada como linha, demais chaves numéricas como barras.
// - adesaoPlano / adesaoCanal: quebras categóricas (por plano/canal) sem uma
//   chave "base" → renderizadas como barras agrupadas.

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3 shadow-card">
      <p className="text-xs font-semibold text-muted">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm font-semibold" style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function CrescimentoBase({ rows }) {
  if (!rows || !rows.length) {
    return <p className="text-sm text-muted">Sem dados para exibir nesta visão.</p>;
  }

  const labelKey = detectLabelKey(rows);
  const numericKeys = detectNumericKeys(rows, labelKey);
  const baseKey = numericKeys.find((k) => /^base/i.test(k));
  const barKeys = numericKeys.filter((k) => k !== baseKey);

  if (!baseKey) {
    // Quebra categórica (plano/canal) — barras agrupadas simples.
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
              fill={colorForKey(key, i)}
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Série temporal com evolução da base → linha + barras para os demais indicadores.
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={rows} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E6E9F2" />
        <XAxis
          dataKey={labelKey}
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
        {barKeys.length > 0 && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatNumber(v)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6B7794", fontSize: 12 }}
            width={56}
          />
        )}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(10,45,135,0.04)" }} />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: 13, color: "#1B2340", paddingBottom: 12 }}
        />
        {barKeys.map((key, i) => (
          <Bar
            key={key}
            yAxisId="right"
            dataKey={key}
            name={prettyLabel(key)}
            fill={colorForKey(key, i)}
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        ))}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey={baseKey}
          name={prettyLabel(baseKey)}
          stroke={colorForKey(baseKey)}
          strokeWidth={3}
          dot={{ r: 4, fill: colorForKey(baseKey) }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
