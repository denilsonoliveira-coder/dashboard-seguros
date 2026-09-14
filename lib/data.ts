import { JsonRow } from './types';

export const isPresent = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

export const toNumber = (value: unknown): number | null => {
  if (!isPresent(value)) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const sum = (values: Array<number | null>): number =>
  values.reduce<number>((total, value) => total + (value ?? 0), 0);

export const formatCurrency = (value: number | null | undefined): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export const formatNumber = (value: number | null | undefined): string =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value ?? 0);

export const formatPercent = (value: number | null | undefined): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value ?? 0);

export const compactCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 1,
  }).format(value);

export const compactNumber = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export function parseMatrix(rows: JsonRow[] | undefined, labelKey: string) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const header = safeRows.find((row) => !isPresent(row[labelKey])) ?? safeRows[0];
  if (!header) return { months: [] as Array<{ key: string; label: string }>, items: [] as JsonRow[] };

  const months = Object.entries(header)
    .filter(([key, label]) => key !== labelKey && typeof label === 'string' && /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/.test(label))
    .map(([key, label]) => ({ key, label: String(label) }));

  const items = safeRows.filter((row) => {
    const label = row[labelKey];
    return isPresent(label) && label !== 'Total' && !months.some((month) => label === month.label);
  });

  return { months, items };
}
