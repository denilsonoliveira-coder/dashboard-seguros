"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactNumber, formatNumber } from '@/lib/data';

export default function PlanBarChart({ data }: { data: Array<{ nome: string; total: number }> }) {
  return (
    <div className="h-[330px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 34 }}>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nome" angle={-12} textAnchor="end" interval={0} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tickFormatter={compactNumber} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={55} />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="total" name="Adesões" fill="#0A2D87" radius={[6, 6, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
