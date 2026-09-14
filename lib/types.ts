export type Scalar = string | number | null;
export type JsonRow = Record<string, Scalar>;
export interface DashboardData {
  orcadoVsRealizado?: { baseline?: JsonRow[]; alavanca?: JsonRow[]; consolidado?: JsonRow[] };
  parcelasPagas?: { dados?: JsonRow[] };
  crescimentoBaseVsAdesoes?: { adesaoPlano?: JsonRow[]; adesaoCanal?: JsonRow[]; crescimentoBase?: JsonRow[] };
}
