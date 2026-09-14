"use client";

import { useMemo } from 'react';
import ChartCard from '@/components/ChartCard';
import KpiCard from '@/components/KpiCard';
import StackedMonthlyChart from '@/components/charts/StackedMonthlyChart';
import { formatCurrency, formatPercent, parseMatrix, sum, toNumber } from '@/lib/data';
import { DashboardData, JsonRow } from '@/lib/types';

export default function InstallmentsView({ data }: { data: DashboardData['parcelasPagas'] }) {
  const model = useMemo(() => {
    const rows = Array.isArray(data?.dados) ? data.dados : [];
    const labelKey = 'Share de Planos';
    const { months, items } = parseMatrix(rows, labelKey);
    const totalRow = rows.find((row) => row[labelKey] === 'Total');
    const series = items.map((row) => String(row[labelKey]));
    const chartData = months
      .map((month) => {
        const point: Record<string, string | number> = { mes: month.label };
        items.forEach((row) => { point[String(row[labelKey])] = toNumber(row[month.key]) ?? 0; });
        return point;
      })
      .filter((point) => series.some((name) => Number(point[name]) > 0));
    const biggest = items.reduce<JsonRow | null>((best, row) => !best || (toNumber(row.Coluna14) ?? 0) > (toNumber(best.Coluna14) ?? 0) ? row : best, null);
    const total = toNumber(totalRow?.Coluna13) ?? sum(items.map((row) => toNumber(row.Coluna13)));
    const activeMonths = months.filter((month) => (toNumber(totalRow?.[month.key]) ?? 0) > 0).length;
    const ticket = activeMonths ? total / activeMonths : 0;
    return { chartData, series, items, total, biggest, ticket, months };
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total arrecadado" value={formatCurrency(model.total)} accent="green" />
        <KpiCard label="Plano com maior share" value={String(model.biggest?.['Share de Planos'] ?? 'Sem dados')} detail={formatPercent(toNumber(model.biggest?.Coluna14))} />
        <KpiCard label="Quantidade de planos" value={String(model.items.length)} />
        <KpiCard label="Ticket médio mensal" value={formatCurrency(model.ticket)} detail="Total arrecadado ÷ meses com arrecadação" />
      </div>
      <ChartCard title="Parcelas pagas por plano" subtitle="Arrecadação mensal empilhada, considerando apenas meses com valores">
        <StackedMonthlyChart data={model.chartData} series={model.series} />
      </ChartCard>
      <ChartCard title="Detalhamento por plano" subtitle="Valores mensais, total acumulado e participação na arrecadação">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead><tr>{['Plano', ...model.months.map((m) => m.label), 'Total', 'Share'].map((name) => <th key={name} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-semibold text-slate-600 first:text-left">{name}</th>)}</tr></thead>
            <tbody>{model.items.map((row) => <tr key={String(row['Share de Planos'])} className="hover:bg-slate-50"><td className="border-b border-slate-100 px-3 py-3 font-semibold text-slate-800">{String(row['Share de Planos'])}</td>{model.months.map((m) => <td key={m.key} className="border-b border-slate-100 px-3 py-3 text-right text-slate-600">{toNumber(row[m.key]) === null ? '—' : formatCurrency(toNumber(row[m.key]))}</td>)}<td className="border-b border-slate-100 px-3 py-3 text-right font-semibold text-slate-800">{formatCurrency(toNumber(row.Coluna13))}</td><td className="border-b border-slate-100 px-3 py-3 text-right font-semibold text-voltz-700">{formatPercent(toNumber(row.Coluna14))}</td></tr>)}</tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
