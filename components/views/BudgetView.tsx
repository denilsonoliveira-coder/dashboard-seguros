"use client";

import { useMemo, useState } from 'react';
import ChartCard from '@/components/ChartCard';
import KpiCard from '@/components/KpiCard';
import BudgetChart from '@/components/charts/BudgetChart';
import { formatCurrency, formatPercent, isPresent, sum, toNumber } from '@/lib/data';
import { DashboardData, JsonRow } from '@/lib/types';

const tabs = [
  { key: 'baseline', label: 'Baseline' },
  { key: 'alavanca', label: 'Alavanca' },
  { key: 'consolidado', label: 'Consolidado' },
] as const;

function normalize(rows: JsonRow[] | undefined) {
  const safe = Array.isArray(rows) ? rows : [];
  const firstKey = Object.keys(safe[0] ?? {}).find((key) => key !== 'Coluna1' && key !== 'Coluna2' && key !== 'Coluna3');
  if (!firstKey) return [];
  return safe
    .filter((row) => isPresent(row[firstKey]) && row[firstKey] !== 'Mês' && toNumber(row.Coluna1) !== null)
    .map((row) => ({
      mes: String(row[firstKey]),
      planejado: toNumber(row.Coluna1),
      realizado: toNumber(row.Coluna2),
      atingimento: toNumber(row.Coluna3),
    }));
}

export default function BudgetView({ data }: { data: DashboardData['orcadoVsRealizado'] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('consolidado');
  const points = useMemo(() => normalize(data?.[tab]), [data, tab]);
  const realizedPoints = points.filter((item) => item.realizado !== null);
  const planned = sum(realizedPoints.map((item) => item.planejado));
  const realized = sum(realizedPoints.map((item) => item.realizado));
  const attainment = planned ? realized / planned : 0;
  const difference = realized - planned;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === item.key ? 'bg-voltz-700 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-voltz-500 hover:text-voltz-700'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Planejado acumulado" value={formatCurrency(planned)} detail="Meses com realizado disponível" />
        <KpiCard label="Realizado acumulado" value={formatCurrency(realized)} accent="green" />
        <KpiCard label="Atingimento" value={formatPercent(attainment)} accent={attainment >= 1 ? 'green' : 'red'} />
        <KpiCard label="Diferença" value={formatCurrency(difference)} accent={difference >= 0 ? 'green' : 'red'} />
      </div>
      <ChartCard title={`Orçado vs Realizado · ${tabs.find((item) => item.key === tab)?.label}`} subtitle="Barras em reais e linha de atingimento no eixo secundário">
        <BudgetChart data={points} />
      </ChartCard>
    </div>
  );
}
