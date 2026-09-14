"use client";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { abbr, money } from '@/lib/data';
const colors = ['#0A2D87', '#2871d4', '#12a66a', '#f59e0b', '#7c3aed'];
export default function ParcelChart({ data, series }: { data: Array<Record<string, string | number>>; series: string[] }) {
  return <div className="h-[430px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 20 }} barGap={5}><CartesianGrid stroke="#e8edf5" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="mes" axisLine={false} tickLine={false} /><YAxis tickFormatter={abbr} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => money(Number(value))} /><Legend iconType="circle" />{series.map((name, index) => <Bar key={name} dataKey={name} stackId="total" fill={colors[index % colors.length]} radius={[8, 8, 8, 8]}><LabelList dataKey={name} position="center" formatter={(value: number) => value ? abbr(value) : ''} fill="white" fontSize={10} /></Bar>)}</BarChart></ResponsiveContainer></div>;
}
