"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import KpiCard from "./KpiCard";
import OrcadoRealizado from "./charts/OrcadoRealizado";
import ParcelasPagas from "./charts/ParcelasPagas";
import CrescimentoBase from "./charts/CrescimentoBase";
import { buildKpisFromRows } from "../lib/dataUtils";

// Visões de topo = chaves de 1º nível do JSON real.
const VIEWS = [
  { key: "orcadoVsRealizado", label: "Orçado vs Realizado", Chart: OrcadoRealizado },
  { key: "parcelasPagas", label: "Parcelas Pagas", Chart: ParcelasPagas },
  { key: "crescimentoBaseVsAdesoes", label: "Crescimento da Base vs Adesões", Chart: CrescimentoBase },
];

// Rótulos amigáveis para as sub-chaves (2º nível) de cada visão.
const SUBVIEW_LABELS = {
  baseline: "Baseline",
  alavanca: "Alavanca",
  consolidado: "Consolidado",
  dados: "Dados",
  adesaoPlano: "Adesão por Plano",
  adesaoCanal: "Adesão por Canal",
  crescimentoBase: "Crescimento da Base",
};

function subLabel(key) {
  if (SUBVIEW_LABELS[key]) return SUBVIEW_LABELS[key];
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [view, setView] = useState(VIEWS[0].key);
  const [subView, setSubView] = useState(null);
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

  // Ao trocar a visão principal, seleciona a primeira sub-chave disponível.
  useEffect(() => {
    if (!data || !data[view]) return;
    const subKeys = Object.keys(data[view]);
    setSubView(subKeys[0] ?? null);
  }, [data, view]);

  const activeViewMeta = VIEWS.find((v) => v.key === view);
  const viewObject = data ? data[view] : null;
  const subKeys = viewObject ? Object.keys(viewObject) : [];
  const activeRows = viewObject && subView ? viewObject[subView] : [];

  const kpis = useMemo(() => buildKpisFromRows(activeRows), [activeRows]);

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
      link.download = `dashboard-${view}-${subView ?? "view"}-${Date.now()}.png`;
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

  const ChartComponent = activeViewMeta.Chart;

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
              <p className="text-sm font-semibold text-navy-900">Dashboard Executivo · Voltz</p>
              <p className="text-xs text-muted">Dados carregados de dashboard.json</p>
            </div>
          </div>

          <div className="flex items-end gap-3">
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
              className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-navy-600 disabled:opacity-60"
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
              Q3 2026
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              {activeViewMeta.label}
            </h1>
          </div>

          {/* Sub-visões (2º nível do JSON), quando houver mais de uma */}
          {subKeys.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {subKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setSubView(key)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    subView === key
                      ? "border-navy bg-navy text-white shadow-card"
                      : "border-line bg-panel text-navy-900 hover:border-navy-300"
                  }`}
                >
                  {subLabel(key)}
                </button>
              ))}
            </div>
          )}

          {/* KPIs — calculados dinamicamente a partir das linhas reais */}
          {kpis.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div>
          )}

          {/* Gráfico principal */}
          <div className="rounded-2xl border border-line bg-panel p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900">
                {activeViewMeta.label}
                {subKeys.length > 1 && subView ? ` · ${subLabel(subView)}` : ""}
              </h2>
              <span className="text-xs font-medium text-muted">
                {activeRows.length} registro{activeRows.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="h-[380px]">
              <ChartComponent rows={activeRows} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
