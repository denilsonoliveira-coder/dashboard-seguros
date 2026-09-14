export type Row = Record<string, string | number | null>;
export const present = (value: unknown) => value !== null && value !== undefined && value !== '';
export const num = (value: unknown): number | null => {
  if (!present(value)) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};
export const sum = (values: Array<number | null>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
export const money = (value: number | null | undefined) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value ?? 0);
export const integer = (value: number | null | undefined) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value ?? 0);
export const percent = (value: number | null | undefined) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value ?? 0);
export const abbr = (value: number | null | undefined) => {
  const numeric = value ?? 0;
  const absolute = Math.abs(numeric);
  const format = (result: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: Number.isInteger(result) ? 0 : 1, maximumFractionDigits: 1 }).format(result);
  return absolute >= 1_000_000 ? `${format(numeric / 1_000_000)}MM` : absolute >= 1_000 ? `${format(numeric / 1_000)}k` : integer(numeric);
};
export function matrix(rows: Row[] | undefined, labelKey: string) {
  const safe = Array.isArray(rows) ? rows : [];
  const header = safe.find((row) => !present(row[labelKey])) ?? safe[0];
  if (!header) return { months: [] as Array<{ key: string; label: string }>, items: [] as Row[], data: [] as Array<Record<string, string | number>>, series: [] as string[] };
  const months = Object.entries(header)
    .filter(([key, value]) => key !== labelKey && typeof value === 'string' && /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/.test(value))
    .map(([key, value]) => ({ key, label: String(value) }));
  const items = safe.filter((row) => present(row[labelKey]) && row[labelKey] !== 'Total');
  const series = items.map((row) => String(row[labelKey]));
  const data = months.map((month) => {
    const point: Record<string, string | number> = { mes: month.label };
    items.forEach((row) => { point[String(row[labelKey])] = num(row[month.key]) ?? 0; });
    return point;
  }).filter((point) => series.some((name) => Number(point[name]) !== 0));
  return { months, items, data, series };
}
// Compatibility exports for any residual component during repository migration.
export const isPresent = present;
export const toNumber = num;
export const formatCurrency = money;
export const formatNumber = integer;
export const formatPercent = percent;
export const compactNumber = abbr;
export const compactCurrency = abbr;
export function parseMatrix(rows: Row[] | undefined, labelKey: string) { const value = matrix(rows, labelKey); return { months: value.months, items: value.items }; }
export function matrixToMonthlySeries(rows: Row[] | undefined, labelKey: string) { const value = matrix(rows, labelKey); return { data: value.data, series: value.series }; }
