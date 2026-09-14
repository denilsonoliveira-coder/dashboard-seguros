"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compactNumber, formatNumber } from '@/lib/data';

export default function ChannelBarChart({ data }: { data: Array<{ nome: string; total: number }> }) {
  return (
    <div className="h-[330px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={compactNumber} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis type="category" dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={54} />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="total" name="Adesões" fill="#2871d4" radius={[0, 6, 6, 0]} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
