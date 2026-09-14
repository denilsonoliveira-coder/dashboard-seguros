export function formatBRL(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatBRLCompact(valor) {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(2).replace(".", ",")} MM`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(0)} mil`;
  }
  return formatBRL(valor);
}

export function formatNumber(valor) {
  return new Intl.NumberFormat("pt-BR").format(valor);
}
