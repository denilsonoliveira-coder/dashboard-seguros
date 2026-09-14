"use client";

import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactCurrency, formatCurrency, formatPercent } from '@/lib/data';

export type BudgetPoint = { mes: string; planejado: number | null; realizado: number | null; atingimento: number | null };

export default function BudgetChart({ data }: { data: BudgetPoint[] }) {
  return (
    <div className="h-[390px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 10, left: 2, bottom: 0 }}>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis yAxisId="money" tickFormatter={compactCurrency} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={74} />
          <YAxis yAxisId="percent" orientation="right" tickFormatter={(v) => formatPercent(v)} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={58} />
          <Tooltip formatter={(value, name) => name === 'Atingimento' ? formatPercent(Number(value)) : formatCurrency(Number(value))} />
          <Legend iconType="circle" />
          <Bar yAxisId="money" dataKey="planejado" name="Planejado" fill="#b9c7e8" radius={[5, 5, 0, 0]} maxBarSize={34} />
          <Bar yAxisId="money" dataKey="realizado" name="Realizado" fill="#0A2D87" radius={[5, 5, 0, 0]} maxBarSize={34} />
          <Line yAxisId="percent" type="monotone" dataKey="atingimento" name="Atingimento" stroke="#12a66a" strokeWidth={3} dot={{ r: 3, fill: '#12a66a' }} connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
