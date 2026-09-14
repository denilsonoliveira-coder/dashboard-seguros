"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { abbr, integer } from '@/lib/data';
const colors = ['#0A2D87', '#2871d4', '#12a66a', '#f59e0b', '#7c3aed'];
export default function MonthlyChart({ data, series, horizontal = false }: { data: Array<Record<string, string | number>>; series: string[]; horizontal?: boolean }) {
  return <div className="h-[430px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ right: 15 }} barGap={5}><CartesianGrid stroke="#e8edf5" strokeDasharray="3 5" vertical={!horizontal} horizontal={horizontal} />{horizontal ? <><XAxis type="number" tickFormatter={abbr} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="mes" width={45} axisLine={false} tickLine={false} /></> : <><XAxis dataKey="mes" axisLine={false} tickLine={false} /><YAxis tickFormatter={abbr} axisLine={false} tickLine={false} /></>}<Tooltip formatter={(value) => integer(Number(value))} /><Legend iconType="circle" />{series.map((name, index) => <Bar key={name} dataKey={name} fill={colors[index % colors.length]} radius={[10, 10, 10, 10]} maxBarSize={24} />)}</BarChart></ResponsiveContainer></div>;
}
