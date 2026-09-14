export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card"><h2 className="text-lg font-bold">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}<div className="mt-5">{children}</div></section>;
}
export function Kpi({ label, value }: { label: string; value: string }) {
  return <article className="rounded-3xl border border-slate-200 border-l-4 border-l-voltz bg-white p-5 shadow-card"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>;
}
