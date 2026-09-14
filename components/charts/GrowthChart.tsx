"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactNumber, formatNumber } from '@/lib/data';

type Point = { mes: string; adesoes: number | null; cancelamentos: number | null; crescimento_liquido: number | null; total_base: number | null };

export default function GrowthChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[410px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis yAxisId="flow" tickFormatter={compactNumber} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={55} />
          <YAxis yAxisId="base" orientation="right" tickFormatter={compactNumber} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={58} />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Legend iconType="circle" />
          <Line yAxisId="flow" type="monotone" dataKey="adesoes" name="Adesões" stroke="#2871d4" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
          <Line yAxisId="flow" type="monotone" dataKey="cancelamentos" name="Cancelamentos" stroke="#e34b5f" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
          <Line yAxisId="flow" type="monotone" dataKey="crescimento_liquido" name="Crescimento líquido" stroke="#12a66a" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
          <Line yAxisId="base" type="monotone" dataKey="total_base" name="Total da base" stroke="#0A2D87" strokeWidth={3.5} dot={{ r: 4 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
