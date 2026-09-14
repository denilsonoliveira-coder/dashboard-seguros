"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KpiCard from "./KpiCard";
import OrcadoRealizado from "./charts/OrcadoRealizado";
import ParcelasPagas from "./charts/ParcelasPagas";
import CrescimentoBase from "./charts/CrescimentoBase";
import { formatBRLCompact } from "../lib/format";

const VIEWS = [
  { key: "orcadoRealizado", label: "Orçado vs Realizado" },
  { key: "parcelasPagas", label: "Parcelas Pagas" },
  { key: "crescimentoBaseVsAdesoes", label: "Crescimento da Base vs Adesões" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("orcadoRealizado");
  const [exporting, setExporting] = useState(false);
  const captureRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch("/dashboard.json")
      .then((res) => res.json())
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((err) => console.error("Falha ao carregar dashboard.json", err));
    return () => {
      mounted = false;
    };
  }, []);

  const activeView = VIEWS.find((v) => v.key === view);
  const activeData = data ? data[view] : null;

  const chart = useMemo(() => {
    if (!activeData) return null;
    if (view === "orcadoRealizado") return <OrcadoRealizado data={activeData.mensal} />;
    if (view === "parcelasPagas") return <ParcelasPagas data={activeData.mensal} />;
    if (view === "crescimentoBaseVsAdesoes") return <CrescimentoBase data={activeData.mensal} />;
    return null;
  }, [activeData, view]);

  async function handleExportPNG() {
    if (!captureRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#F4F6FB",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `dashboard-${view}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Falha ao exportar PNG", err);
    } finally {
      setExporting(false);
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm font-medium text-muted">Carregando indicadores…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-16">
      {/* Barra superior */}
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-sm font-bold text-white">
              V
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-900">Voltz · {data.meta.time}</p>
              <p className="text-xs text-muted">
                Versão {data.meta.versao} · <span className="text-good">{data.meta.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted">Visão</span>
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="min-w-[260px] cursor-pointer rounded-lg border border-line bg-panel px-3 py-2 text-sm font-semibold text-navy-900 shadow-sm outline-none focus:border-navy-400"
              >
                {VIEWS.map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={handleExportPNG}
              disabled={exporting}
              className="mt-5 flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-navy-600 disabled:opacity-60"
            >
              {exporting ? "Exportando…" : "⬇ Exportar PNG"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-8">
        <div ref={captureRef} className="bg-bg">
          {/* Título da visão */}
          <div className="mb-6 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              {data.meta.time} · {data.meta.periodo}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              {activeView.label}
            </h1>
          </div>

          {/* Cards de contexto (meta / objetivo / período) */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ContextCard
              icon="🎯"
              title="Meta financeira"
              value={formatBRLCompact(data.meta.metaFinanceira)}
              subtitle="Alcançar lucro bruto"
            />
            <ContextCard
              icon="🚩"
              title="Objetivo estratégico"
              value={data.meta.objetivoEstrategico}
              subtitle=""
              small
            />
            <ContextCard
              icon="📅"
              title="Período"
              value={data.meta.periodo}
              subtitle={data.meta.trimestre}
            />
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeData.kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Gráfico principal */}
          <div className="rounded-2xl border border-line bg-panel p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900">{activeView.label} · mensal</h2>
              <span className="text-xs font-medium text-muted">Jul – Set 2026</span>
            </div>
            <div className="h-[380px]">{chart}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ContextCard({ icon, title, value, subtitle, small }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-line bg-panel p-5 shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-lg text-white">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
        <p className={`mt-1 font-bold text-navy-900 ${small ? "text-sm leading-snug" : "text-xl"}`}>
          {value}
        </p>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
