import { formatBRLCompact, formatNumber } from "../lib/format";

export default function KpiCard({ label, total, isCurrency, isPercent, variacao }) {
  const positivo = typeof variacao === "number" && variacao >= 0;
  const negativo = typeof variacao === "number" && variacao < 0;

  let displayValue;
  if (isPercent) {
    displayValue = `${total.toFixed(1)}%`;
  } else if (isCurrency) {
    displayValue = formatBRLCompact(total);
  } else {
    displayValue = formatNumber(Math.round(total));
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-5 shadow-card">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-navy-900">{displayValue}</span>
        {typeof variacao === "number" && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              positivo ? "bg-good/10 text-good" : negativo ? "bg-bad/10 text-bad" : "text-muted"
            }`}
          >
            {positivo ? "▲" : "▼"} {Math.abs(variacao).toFixed(1)} p.p.
          </span>
        )}
      </div>
    </div>
  );
}
