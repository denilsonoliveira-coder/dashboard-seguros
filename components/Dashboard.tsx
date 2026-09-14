"use client";

import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import BudgetView from '@/components/views/BudgetView';
import GrowthView from '@/components/views/GrowthView';
import InstallmentsView from '@/components/views/InstallmentsView';
import { DashboardData } from '@/lib/types';

type View = 'budget' | 'installments' | 'growth';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState<View>('budget');
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/dashboard.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Falha ao carregar o JSON (${response.status})`);
        return response.json();
      })
      .then((json: DashboardData) => setData(json))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Não foi possível carregar dashboard.json'));
  }, []);

  async function exportPng() {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#f4f6f9',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `dashboard-voltz-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setExporting(false);
    }
  }

  if (error) return <main className="mx-auto max-w-3xl p-8"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><h1 className="font-bold">Erro ao carregar os dados</h1><p className="mt-2 text-sm">{error}</p></div></main>;
  if (!data) return <main className="grid min-h-screen place-items-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-voltz-700"/><p className="mt-4 text-sm font-medium text-slate-500">Carregando dashboard.json...</p></div></main>;

  return (
    <div ref={dashboardRef} className="min-h-screen bg-[#f4f6f9] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-3xl bg-voltz-700 px-6 py-7 text-white shadow-card lg:flex lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Seguros · Resultados executivos</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard Executivo · Voltz</h1>
            <p className="mt-2 text-sm text-blue-100">Dados carregados de dashboard.json</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <select value={view} onChange={(event) => setView(event.target.value as View)} className="min-w-[260px] rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none ring-blue-300 focus:ring-2">
              <option value="budget">Orçado vs Realizado</option>
              <option value="installments">Parcelas Pagas</option>
              <option value="growth">Crescimento da Base vs Adesões</option>
            </select>
            <button onClick={exportPng} disabled={exporting} data-html2canvas-ignore className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-60">
              {exporting ? 'Exportando...' : '⬇ Exportar PNG'}
            </button>
          </div>
        </header>
        {view === 'budget' && <BudgetView data={data.orcadoVsRealizado} />}
        {view === 'installments' && <InstallmentsView data={data.parcelasPagas} />}
        {view === 'growth' && <GrowthView data={data.crescimentoBaseVsAdesoes} />}
        <footer className="py-8 text-center text-xs text-slate-400">Dashboard Executivo · Voltz · Fonte: dashboard.json</footer>
      </main>
    </div>
  );
}
