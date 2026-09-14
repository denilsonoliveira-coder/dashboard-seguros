type Props = {
  label: string;
  value: string;
  detail?: string;
  accent?: 'blue' | 'green' | 'red' | 'neutral';
};

const accents = {
  blue: 'border-l-voltz-700',
  green: 'border-l-emerald-500',
  red: 'border-l-rose-500',
  neutral: 'border-l-slate-300',
};

export default function KpiCard({ label, value, detail, accent = 'blue' }: Props) {
  return (
    <article className={`rounded-2xl border border-slate-200 border-l-4 ${accents[accent]} bg-white p-5 shadow-card`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
    </article>
  );
}
