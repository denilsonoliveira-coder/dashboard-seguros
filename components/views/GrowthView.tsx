"use client";

import { useMemo } from 'react';
import ChartCard from '@/components/ChartCard';
import KpiCard from '@/components/KpiCard';
import ChannelBarChart from '@/components/charts/ChannelBarChart';
import GrowthChart from '@/components/charts/GrowthChart';
import PlanBarChart from '@/components/charts/PlanBarChart';
import { formatNumber, parseMatrix, sum, toNumber } from '@/lib/data';
import { DashboardData, JsonRow } from '@/lib/types';

function totals(rows: JsonRow[] | undefined, labelKey: string) {
  const { items } = parseMatrix(rows, labelKey);
  return items.map((row) => ({ nome: String(row[labelKey]), total: toNumber(row.Coluna13) ?? 0 }));
}

export default function GrowthView({ data }: { data: DashboardData['crescimentoBaseVsAdesoes'] }) {
  const model = useMemo(() => {
    const growth = (Array.isArray(data?.crescimentoBase) ? data.crescimentoBase : []).map((row) => ({
      mes: String(row.mes ?? ''),
      adesoes: toNumber(row.adesoes),
      cancelamentos: toNumber(row.cancelamentos),
      crescimento_liquido: toNumber(row.crescimento_liquido),
      total_base: toNumber(row.total_base),
    })).filter((row) => row.mes && [row.adesoes, row.cancelamentos, row.crescimento_liquido, row.total_base].some((v) => v !== null));
    const validBase = growth.map((row) => row.total_base).filter((value): value is number => value !== null);
    return {
      plans: totals(data?.adesaoPlano, 'Share de Planos'),
      channels: totals(data?.adesaoCanal, 'Share de Canais'),
      growth,
      adhesions: sum(growth.map((row) => row.adesoes)),
      cancellations: sum(growth.map((row) => row.cancelamentos)),
      net: sum(growth.map((row) => row.crescimento_liquido)),
      currentBase: validBase.at(-1) ?? 0,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Adesões acumuladas" value={formatNumber(model.adhesions)} />
        <KpiCard label="Cancelamentos acumulados" value={formatNumber(model.cancellations)} accent="red" />
        <KpiCard label="Crescimento líquido acumulado" value={formatNumber(model.net)} accent={model.net >= 0 ? 'green' : 'red'} />
        <KpiCard label="Base atual" value={formatNumber(model.currentBase)} accent="green" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Adesão por plano" subtitle="Total acumulado no período"><PlanBarChart data={model.plans} /></ChartCard>
        <ChartCard title="Adesão por canal" subtitle="Total acumulado no período"><ChannelBarChart data={model.channels} /></ChartCard>
      </div>
      <ChartCard title="Crescimento da base" subtitle="Adesões, cancelamentos, crescimento líquido e evolução da base"><GrowthChart data={model.growth} /></ChartCard>
    </div>
  );
}
