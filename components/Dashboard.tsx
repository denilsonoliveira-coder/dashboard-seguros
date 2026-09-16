"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import BudgetChart from "./charts/BudgetChart";
import GrowthChart from "./charts/GrowthChart";
import MiniChart from "./charts/MiniChart";
import StackChart from "./charts/StackChart";
import { Card, Kpi } from "./UI";
import {
  integer,
  matrix,
  money,
  num,
  percent,
  Row,
  sum,
  variation,
} from "@/lib/data";

type DashboardData = {
  orcadoVsRealizado?: Record<string, Row[]>;
  parcelasPagas?: { dados?: Row[] };
  crescimentoBaseVsAdesoes?: {
    adesaoPlano?: Row[];
    adesaoCanal?: Row[];
    crescimentoBase?: Row[];
  };
};

type GrowthTab = "plan" | "channel" | "base";

type CategoryModel = {
  name: string;
  total: number;
  share: number;
  change: number | null;
  points: Array<{ mes: string; valor: number }>;
};

function buildCategoryModels(
  rows: Row[] | undefined,
  labelKey: string,
): CategoryModel[] {
  const parsed = matrix(rows, labelKey);

  return parsed.items.map((row) => {
    const values = parsed.months.map((month) => num(row[month.key]));
    const points = parsed.months
      .map((month, index) => ({
        mes: month.label,
        valor: values[index] ?? 0,
        valid: values[index] !== null && values[index] !== 0,
      }))
      .filter((point) => point.valid)
      .map(({ mes, valor }) => ({ mes, valor }));

    return {
      name: String(row[labelKey]),
      total: num(row.Coluna13) ?? sum(values),
      share: num(row.Coluna14) ?? 0,
      change: variation(values),
      points,
    };
  });
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [view, setView] = useState("budget");
  const [budgetTab, setBudgetTab] = useState("consolidado");
  const [growthTab, setGrowthTab] = useState<GrowthTab>("plan");
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/dashboard.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar dashboard.json: ${response.status}`);
        }
        return response.json() as Promise<DashboardData>;
      })
      .then(setData)
      .catch((error: unknown) => {
        console.error(error);
        setData({});
      });
  }, []);

  const budget = useMemo(() => {
    const rows = data?.orcadoVsRealizado?.[budgetTab] ?? [];
    const monthKey = Object.keys(rows[0] ?? {}).find(
      (key) => !["Coluna1", "Coluna2", "Coluna3"].includes(key),
    );

    if (!monthKey) return [];

    return rows
      .filter(
        (row) => row[monthKey] !== "Mês" && num(row.Coluna1) !== null,
      )
      .map((row) => ({
        mes: String(row[monthKey]),
        planejado: num(row.Coluna1),
        realizado: num(row.Coluna2),
        atingimento: num(row.Coluna3),
      }));
  }, [data, budgetTab]);

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center">
        Carregando...
      </main>
    );
  }

  const realizedBudget = budget.filter((item) => item.realizado !== null);
  const planned = sum(realizedBudget.map((item) => item.planejado));
  const actual = sum(realizedBudget.map((item) => item.realizado));

  const parcelMatrix = matrix(data.parcelasPagas?.dados, "Share de Planos");
  const parcelModels = buildCategoryModels(
    data.parcelasPagas?.dados,
    "Share de Planos",
  );
  const parcelTotalRow = data.parcelasPagas?.dados?.find(
    (row) => row["Share de Planos"] === "Total",
  );
  const parcelData = parcelMatrix.months
    .map((month) => {
      const point: Record<string, string | number> = { mes: month.label };
      parcelMatrix.items.forEach((row) => {
        point[String(row["Share de Planos"])] = num(row[month.key]) ?? 0;
      });
      return point;
    })
    .filter((point) =>
      parcelMatrix.items.some(
        (row) => Number(point[String(row["Share de Planos"])]) > 0,
      ),
    );
  const parcelTotal =
    num(parcelTotalRow?.Coluna13) ??
    sum(parcelModels.map((item) => item.total));

  const planModels = buildCategoryModels(
    data.crescimentoBaseVsAdesoes?.adesaoPlano,
    "Share de Planos",
  );
  const channelModels = buildCategoryModels(
    data.crescimentoBaseVsAdesoes?.adesaoCanal,
    "Share de Canais",
  );

  const growthRows = data.crescimentoBaseVsAdesoes?.crescimentoBase ?? [];
  const growth = growthRows
    .map((row) => ({
      mes: String(row.mes ?? ""),
      total_base: num(row.total_base),
      crescimento_percentual_base: num(row.crescimento_percentual_base),
    }))
    .filter((row) => row.mes && row.total_base !== null);
  const validBase = growth
    .map((row) => row.total_base)
    .filter((value): value is number => value !== null);
  const growthPercent = growth
    .map((row) => row.crescimento_percentual_base)
    .filter((value): value is number => value !== null);
  const accumulatedAdhesions = sum(growthRows.map((row) => num(row.adesoes)));
  const accumulatedCancellations = sum(
    growthRows.map((row) => num(row.cancelamentos)),
  );
  const accumulatedNetGrowth = sum(
    growthRows.map((row) => num(row.crescimento_liquido)),
  );

  async function exportPng() {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: "#f4f6f9",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "dashboard-voltz.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  return (
    <div ref={dashboardRef} className="min-h-screen p-4 md:p-8">
      <main className="mx-auto max-w-[1500px]">
        <header className="mb-6 rounded-3xl bg-voltz p-7 text-white md:flex md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Executivo · Voltz</h1>
            <p className="mt-2 text-blue-100">
              Dados carregados de dashboard.json
            </p>
          </div>
          <div className="mt-5 flex gap-3 md:mt-0">
            <select
              value={view}
              onChange={(event) => setView(event.target.value)}
              className="rounded-2xl bg-white px-4 py-3 text-slate-800"
            >
              <option value="budget">Orçado vs Realizado</option>
              <option value="parcel">Parcelas Pagas</option>
              <option value="growth">Crescimento da Base vs Adesões</option>
            </select>
            <button
              data-html2canvas-ignore
              onClick={exportPng}
              className="rounded-2xl border border-white/30 px-4"
            >
              ↓ Exportar PNG
            </button>
          </div>
        </header>

        {view === "budget" && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {["baseline", "alavanca", "consolidado"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBudgetTab(tab)}
                  className={`rounded-2xl px-4 py-2 capitalize ${
                    budgetTab === tab ? "bg-voltz text-white" : "bg-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Kpi label="Planejado acumulado" value={money(planned)} />
              <Kpi label="Realizado acumulado" value={money(actual)} />
              <Kpi
                label="Atingimento"
                value={percent(planned ? actual / planned : 0)}
              />
              <Kpi label="Diferença" value={money(actual - planned)} />
            </div>
            <Card title={`Orçado vs Realizado · ${budgetTab}`}>
              <BudgetChart data={budget} />
            </Card>
          </div>
        )}

        {view === "parcel" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              <Kpi label="Total arrecadado" value={money(parcelTotal)} />
              <Kpi
                label="Quantidade de planos"
                value={String(parcelModels.length)}
              />
              <Kpi
                label="Meses com arrecadação"
                value={String(parcelData.length)}
              />
              <Kpi
                label="Média mensal"
                value={money(
                  parcelData.length ? parcelTotal / parcelData.length : 0,
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {parcelModels.map((item) => (
                <Kpi
                  key={item.name}
                  label={item.name}
                  value={money(item.total)}
                  detail={`${percent(item.share)} de representatividade`}
                />
              ))}
            </div>
            <Card
              title="Parcelas pagas por plano"
              subtitle="Acumulado mensal por plano"
            >
              <StackChart
                data={parcelData}
                series={parcelModels.map((item) => item.name)}
              />
            </Card>
          </div>
        )}

        {view === "growth" && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {[
                ["plan", "Adesão por Plano"],
                ["channel", "Adesão por Canal"],
                ["base", "Crescimento da Base"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setGrowthTab(key as GrowthTab)}
                  className={`rounded-2xl px-4 py-2 ${
                    growthTab === key ? "bg-voltz text-white" : "bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {growthTab === "plan" && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  {planModels.map((item) => (
                    <Kpi
                      key={item.name}
                      label={item.name}
                      value={integer(item.total)}
                      detail={`${percent(item.share)} de representatividade`}
                      variation={item.change}
                    />
                  ))}
                </div>
                <div className="grid gap-5 xl:grid-cols-3">
                  {planModels.map((item) => (
                    <Card
                      key={item.name}
                      title={item.name}
                      subtitle="Adesões mês a mês"
                    >
                      <MiniChart data={item.points} />
                    </Card>
                  ))}
                </div>
              </>
            )}

            {growthTab === "channel" && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {channelModels.map((item) => (
                    <Kpi
                      key={item.name}
                      label={item.name}
                      value={integer(item.total)}
                      detail={`${percent(item.share)} de representatividade`}
                      variation={item.change}
                    />
                  ))}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {channelModels.map((item) => (
                    <Card
                      key={item.name}
                      title={item.name}
                      subtitle="Adesões mês a mês"
                    >
                      <MiniChart data={item.points} />
                    </Card>
                  ))}
                </div>
              </>
            )}

            {growthTab === "base" && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Kpi
                    label="Base atual"
                    value={integer(validBase.at(-1) ?? 0)}
                    detail={`Variação no último mês: ${percent(
                      growthPercent.at(-1) ?? 0,
                    )}`}
                  />
                  <Kpi
                    label="Adesões acumuladas"
                    value={integer(accumulatedAdhesions)}
                  />
                  <Kpi
                    label="Cancelamentos acumulados"
                    value={integer(accumulatedCancellations)}
                  />
                  <Kpi
                    label="Crescimento líquido"
                    value={integer(accumulatedNetGrowth)}
                  />
                </div>
                <Card
                  title="Crescimento da Base"
                  subtitle="Total da base e crescimento percentual"
                >
                  <GrowthChart data={growth} />
                </Card>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
