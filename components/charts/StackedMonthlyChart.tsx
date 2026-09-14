"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactCurrency, formatCurrency } from '@/lib/data';

const colors = ['#0A2D87', '#2871d4', '#12a66a', '#f59e0b', '#7c3aed', '#ec4899'];

export default function StackedMonthlyChart({ data, series }: { data: Record<string, string | number>[]; series: string[] }) {
  return (
    <div className="h-[390px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickFormatter={compactCurrency} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={74} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend iconType="circle" />
          {series.map((name, index) => <Bar key={name} dataKey={name} stackId="a" fill={colors[index % colors.length]} radius={index === series.length - 1 ? [5, 5, 0, 0] : undefined} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
