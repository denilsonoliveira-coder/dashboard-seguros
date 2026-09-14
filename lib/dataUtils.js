// Utilitários para consumir os dados REAIS do dashboard.json sem assumir
// nomes fixos de campo (o Excel pode nomear as colunas de formas distintas).
// Cada linha de um array é inspecionada: a primeira chave "textual" vira o
// rótulo do eixo X (categoria/mês/plano/canal...) e as chaves numéricas
// viram as séries plotadas.

const LABEL_KEY_CANDIDATES = [
  "mes",
  "mês",
  "mesAno",
  "mes_ano",
  "periodo",
  "período",
  "data",
  "categoria",
  "plano",
  "canal",
  "nome",
  "label",
  "item",
  "grupo",
];

export function detectLabelKey(rows) {
  if (!rows || !rows.length) return null;
  const sample = rows[0];
  for (const cand of LABEL_KEY_CANDIDATES) {
    if (cand in sample) return cand;
  }
  const stringKey = Object.keys(sample).find((k) => typeof sample[k] === "string");
  return stringKey || Object.keys(sample)[0];
}

export function detectNumericKeys(rows, labelKey) {
  if (!rows || !rows.length) return [];
  const sample = rows[0];
  return Object.keys(sample).filter((k) => k !== labelKey && typeof sample[k] === "number");
}

const LABEL_MAP = {
  orcado: "Orçado",
  orçado: "Orçado",
  realizado: "Realizado",
  meta: "Meta",
  valor: "Valor",
  pagas: "Pagas",
  paga: "Pagas",
  pendentes: "Pendentes",
  pendente: "Pendentes",
  atrasadas: "Em atraso",
  atraso: "Em atraso",
  adesoes: "Adesões",
  adesões: "Adesões",
  cancelamentos: "Cancelamentos",
  base: "Base ativa",
  baseAtiva: "Base ativa",
  quantidade: "Quantidade",
  qtd: "Quantidade",
};

export function prettyLabel(key) {
  const lower = key.toLowerCase();
  if (LABEL_MAP[lower]) return LABEL_MAP[lower];
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function looksLikeCurrency(key) {
  return /orcad|orçad|realizad|valor|receita|faturamento|lucro|^meta$/i.test(key);
}

export function looksLikePercent(key) {
  return /taxa|percentual|conversao|conversão|atingimento|%/.test(key);
}

const PALETTE = ["#0A2D87", "#B4C0E7", "#2E9E5B", "#D9A017", "#D9483A", "#5670C0", "#C88A2E", "#8C9ED9"];

const COLOR_OVERRIDES = [
  { test: /^realizad/i, color: "#0A2D87" },
  { test: /^orcad|^orçad/i, color: "#B4C0E7" },
  { test: /^pagas?$/i, color: "#2E9E5B" },
  { test: /pendent/i, color: "#D9A017" },
  { test: /atras/i, color: "#D9483A" },
  { test: /^base/i, color: "#0A2D87" },
  { test: /adesa|adesõ/i, color: "#B4C0E7" },
  { test: /cancelament/i, color: "#F1B4AD" },
  { test: /alavanca/i, color: "#5670C0" },
  { test: /baseline/i, color: "#8C9ED9" },
  { test: /consolidad/i, color: "#0A2D87" },
];

export function colorForKey(key, index = 0) {
  const override = COLOR_OVERRIDES.find((o) => o.test.test(key));
  if (override) return override.color;
  return PALETTE[index % PALETTE.length];
}

export function sum(rows, key) {
  return rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

// Constrói KPIs somando cada chave numérica encontrada nas linhas.
// Se existir um par "orçado"/"realizado" (por nome), adiciona um KPI de
// atingimento (%) calculado a partir dos totais reais.
export function buildKpisFromRows(rows) {
  if (!rows || !rows.length) return [];
  const labelKey = detectLabelKey(rows);
  const numericKeys = detectNumericKeys(rows, labelKey);

  const kpis = numericKeys.map((key) => ({
    label: `Total ${prettyLabel(key)}`,
    total: sum(rows, key),
    isCurrency: looksLikeCurrency(key),
    isPercent: looksLikePercent(key),
  }));

  const orcadoKey = numericKeys.find((k) => /orcad|orçad/i.test(k));
  const realizadoKey = numericKeys.find((k) => /realizad/i.test(k));
  if (orcadoKey && realizadoKey) {
    const totalOrcado = sum(rows, orcadoKey);
    const totalRealizado = sum(rows, realizadoKey);
    const atingimento = totalOrcado ? (totalRealizado / totalOrcado) * 100 : 0;
    kpis.push({
      label: "Atingimento da meta",
      total: atingimento,
      isPercent: true,
      variacao: Number((atingimento - 100).toFixed(1)),
    });
  }

  return kpis;
}

// Última linha da série = leitura mais recente (útil para um KPI de "atual").
export function lastValue(rows, key) {
  if (!rows || !rows.length) return null;
  return rows[rows.length - 1][key] ?? null;
}
