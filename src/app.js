const $ = (selector) => document.querySelector(selector);
const content = $('#content');
const tooltip = $('#tooltip');
let data;
const state = { view: 'council', budget: 'consolidado', growth: 'plan' };
const colors = ['#b9c7e8', '#0A2D87', '#2871d4', '#12a66a', '#f59e0b'];

const toNumber = (value) => value === '' || value == null ? null : Number(value);
const sum = (values) => values.reduce((total, value) => total + (value || 0), 0);
const number = (value) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value || 0);
const currency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0);
const percentage = (value) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value || 0);
const compact = (value) => Math.abs(value) >= 1e6 ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value / 1e6) + 'MM' : Math.abs(value) >= 1e3 ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value / 1e3) + 'k' : number(value);

function matrix(rows, key) {
  const header = rows[0];
  const months = Object.entries(header).filter(([column, value]) => column !== key && /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/.test(value)).map(([column, label]) => ({ column, label }));
  return { months, items: rows.slice(1).filter((row) => row[key] !== 'Total') };
}

function categories(rows, key) {
  const parsed = matrix(rows, key);
  const totalRow = rows.find((row) => row[key] === 'Total');
  const months = parsed.months.filter((month) => !totalRow || (toNumber(totalRow[month.column]) || 0) > 0);
  return parsed.items.map((row) => {
    const values = months.map((month) => toNumber(row[month.column]));
    return { name: row[key], total: toNumber(row.Coluna13) || sum(values), share: toNumber(row.Coluna14) || 0, points: months.map((month, index) => ({ period: month.label, value: values[index] || 0 })) };
  });
}

const icon = (type) => `<span class="icon">${{ money: '$', chart: '↗', phone: '▯', star: '★', award: '♙', tag: '◇', diamond: '♢', globe: '◎', chat: '◯', kiosk: '▣' }[type]}</span>`;
const kpi = (label, value, detail = '', change) => `<article class="kpi"><small>${label}</small><strong>${value}</strong>${detail ? `<div class="detail">${detail}</div>` : ''}${change === undefined ? '' : `<div class="variation ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '▲' : '▼'} ${percentage(Math.abs(change))} vs. mês anterior</div>`}</article>`;
const tabs = (items, active, group) => `<div class="tabs">${items.map(([value, label]) => `<button data-tab="${group}:${value}" class="${active === value ? 'active' : ''}">${label}</button>`).join('')}</div>`;
const legend = (series) => `<div class="legend">${series.map((item) => `<span><i style="background:${item.color}"></i>${item.name}</span>`).join('')}</div>`;
const safe = (text) => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hit = (series, period, raw, formatted) => `class="hit" data-series="${safe(series)}" data-period="${safe(period)}" data-raw="${safe(raw)}" data-value="${safe(formatted)}"`;

function axesSvg({ width, height, left, right, top, bottom, max, formatter = compact, xLabels = [] }) {
  const plotHeight = height - top - bottom;
  let svg = '';
  for (let index = 0; index <= 4; index += 1) {
    const y = top + index * plotHeight / 4;
    const value = max * (1 - index / 4);
    svg += `<line class="gridline" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"/><text class="tick" text-anchor="end" x="${left - 9}" y="${y + 4}">${formatter(value)}</text>`;
  }
  svg += `<line class="axisline" x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}"/><line class="axisline" x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}"/>`;
  xLabels.forEach(({ x, label }) => { svg += `<text class="tick" text-anchor="middle" x="${x}" y="${height - 15}">${safe(label)}</text>`; });
  return svg;
}

function smoothPath(points) {
  if (points.length < 2) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index], next = points[index + 1], mid = (current.x + next.x) / 2;
    path += ` C ${mid} ${current.y}, ${mid} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function budgetChart(rows) {
  const width = 1480, height = 390, left = 75, right = 75, top = 42, bottom = 48;
  const plotHeight = height - top - bottom, group = (width - left - right) / rows.length;
  const maxMoney = Math.max(...rows.flatMap((row) => [row.Planejado || 0, row.Realizado || 0]), 1) * 1.16;
  const maxPercent = Math.max(...rows.map((row) => row.Atingimento || 0), 1) * 1.15;
  const xLabels = rows.map((row, index) => ({ x: left + group * index + group / 2, label: row.mes }));
  let svg = `<svg viewBox="0 0 ${width} ${height}">${axesSvg({ width, height, left, right, top, bottom, max: maxMoney, formatter: compact, xLabels })}`;
  const barWidth = Math.min(36, group / 3);
  rows.forEach((row, index) => {
    const center = left + group * index + group / 2;
    [['Planejado', colors[0]], ['Realizado', colors[1]]].forEach(([name, color], seriesIndex) => {
      const value = row[name]; if (value == null) return;
      const h = value / maxMoney * plotHeight, x = center + (seriesIndex - .5) * barWidth - (barWidth - 5) / 2, y = top + plotHeight - h;
      svg += `<rect ${hit(name, row.mes, value, currency(value))} x="${x}" y="${y}" width="${barWidth - 5}" height="${h}" rx="8" fill="${color}"/><text class="label" text-anchor="middle" x="${x + (barWidth - 5) / 2}" y="${y - 7}">${compact(value)}</text>`;
    });
  });
  const linePoints = rows.map((row, index) => row.Atingimento == null ? null : ({ x: left + group * index + group / 2, y: top + plotHeight - row.Atingimento / maxPercent * plotHeight, value: row.Atingimento, period: row.mes })).filter(Boolean);
  svg += `<path d="${smoothPath(linePoints)}" fill="none" stroke="${colors[3]}" stroke-width="4" stroke-linecap="round"/>`;
  linePoints.forEach((point) => { svg += `<circle ${hit('Atingimento', point.period, point.value, percentage(point.value))} cx="${point.x}" cy="${point.y}" r="6" fill="#fff" stroke="${colors[3]}" stroke-width="3"/><text class="label" text-anchor="middle" x="${point.x}" y="${point.y - 13}">${percentage(point.value)}</text>`; });
  return svg + '</svg>' + legend([{ name: 'Planejado', color: colors[0] }, { name: 'Realizado', color: colors[1] }, { name: 'Atingimento', color: colors[3] }]);
}

function stackedChart(rows, series) {
  const width = 1480, height = 390, left = 75, right = 35, top = 35, bottom = 48;
  const totals = rows.map((row) => sum(series.map((name) => row[name]))), max = Math.max(...totals, 1) * 1.12, plotHeight = height - top - bottom, group = (width - left - right) / rows.length, barWidth = Math.min(58, group * .58);
  const xLabels = rows.map((row, index) => ({ x: left + group * index + group / 2, label: row.mes }));
  let svg = `<svg viewBox="0 0 ${width} ${height}">${axesSvg({ width, height, left, right, top, bottom, max, xLabels })}`;
  rows.forEach((row, index) => {
    const x = left + group * index + group / 2 - barWidth / 2; let stackHeight = 0;
    series.forEach((name, seriesIndex) => {
      const value = row[name] || 0, h = value / max * plotHeight, y = top + plotHeight - stackHeight - h;
      svg += `<rect ${hit(name, row.mes, value, currency(value))} x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="5" fill="${colors[seriesIndex + 1] || colors[seriesIndex]}"/>`;
      if (h > 25) svg += `<text class="label" fill="#fff" text-anchor="middle" x="${x + barWidth / 2}" y="${y + h / 2 + 4}">${compact(value)}</text>`;
      stackHeight += h;
    });
    svg += `<text class="label" text-anchor="middle" x="${x + barWidth / 2}" y="${top + plotHeight - stackHeight - 8}">${compact(totals[index])}</text>`;
  });
  return svg + '</svg>' + legend(series.map((name, index) => ({ name, color: colors[index + 1] || colors[index] })));
}

function barChart(points, seriesName = 'Adesões') {
  const width = 720, height = 270, left = 60, right = 25, top = 42, bottom = 44, max = Math.max(...points.map((point) => point.value), 1) * 1.18, plotHeight = height - top - bottom, group = (width - left - right) / points.length, barWidth = Math.min(42, group * .55);
  const xLabels = points.map((point, index) => ({ x: left + group * index + group / 2, label: point.period }));
  let svg = `<svg viewBox="0 0 ${width} ${height}">${axesSvg({ width, height, left, right, top, bottom, max, xLabels })}`;
  points.forEach((point, index) => {
    const h = point.value / max * plotHeight, x = left + group * index + group / 2 - barWidth / 2, y = top + plotHeight - h;
    svg += `<rect ${hit(seriesName, point.period, point.value, number(point.value))} x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="8" fill="${colors[1]}"/><text class="label" text-anchor="middle" x="${x + barWidth / 2}" y="${y - 9}">${compact(point.value)}</text>`;
  });
  return svg + '</svg>';
}

function growthChart(rows) {
  const width = 1480, height = 390, left = 80, right = 80, top = 44, bottom = 48, plotHeight = height - top - bottom, group = (width - left - right) / rows.length;
  const maxBase = Math.max(...rows.map((row) => row.total_base), 1) * 1.12, maxGrowth = Math.max(...rows.map((row) => row.crescimento_percentual_base), .01) * 1.18, barWidth = Math.min(54, group * .5);
  const xLabels = rows.map((row, index) => ({ x: left + group * index + group / 2, label: row.mes }));
  let svg = `<svg viewBox="0 0 ${width} ${height}">${axesSvg({ width, height, left, right, top, bottom, max: maxBase, xLabels })}`;
  rows.forEach((row, index) => {
    const h = row.total_base / maxBase * plotHeight, x = left + group * index + group / 2 - barWidth / 2, y = top + plotHeight - h;
    svg += `<rect ${hit('Total da base', row.mes, row.total_base, number(row.total_base))} x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="9" fill="${colors[1]}" opacity=".82"/><text class="label" text-anchor="middle" x="${x + barWidth / 2}" y="${y - 9}">${compact(row.total_base)}</text>`;
  });
  const points = rows.map((row, index) => ({ x: left + group * index + group / 2, y: top + plotHeight - row.crescimento_percentual_base / maxGrowth * plotHeight, value: row.crescimento_percentual_base, period: row.mes }));
  svg += `<path d="${smoothPath(points)}" fill="none" stroke="${colors[3]}" stroke-width="4" stroke-linecap="round"/>`;
  points.forEach((point) => { svg += `<circle ${hit('Crescimento percentual', point.period, point.value, percentage(point.value))} cx="${point.x}" cy="${point.y}" r="6" fill="#fff" stroke="${colors[3]}" stroke-width="3"/><text class="label" text-anchor="middle" x="${point.x}" y="${point.y - 14}">${percentage(point.value)}</text>`; });
  return svg + '</svg>' + legend([{ name: 'Total da base', color: colors[1] }, { name: 'Crescimento percentual', color: colors[3] }]);
}

function spark(points) {
  const width = 310, height = 96, padding = 30, top = 22, bottom = 18, values = points.map((point) => point.value), min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const coordinates = points.map((point, index) => ({ ...point, x: padding + index * (width - 2 * padding) / Math.max(1, points.length - 1), y: top + (max - point.value) / range * (height - top - bottom) }));
  return `<svg viewBox="0 0 ${width} ${height}"><path d="${smoothPath(coordinates)}" fill="none" stroke="#0A2D87" stroke-width="3" stroke-linecap="round"/>${coordinates.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#fff" stroke="#0A2D87" stroke-width="3"/><text class="label" text-anchor="middle" x="${point.x}" y="${point.y - 10}">${compact(point.value)}</text><text class="tick" text-anchor="middle" x="${point.x}" y="${height - 2}">${point.period}</text>`).join('')}</svg>`;
}

function councilView() {
  const parcels = categories(data.parcelasPagas.dados, 'Share de Planos'), plans = categories(data.crescimentoBaseVsAdesoes.adesaoPlano, 'Share de Planos'), channels = categories(data.crescimentoBaseVsAdesoes.adesaoCanal, 'Share de Canais');
  const period = `Jan a ${parcels[0].points[parcels[0].points.length - 1].period}/2026`;
  const mix = (items, icons, showCurrency) => items.map((item, index) => `<div class="mixrow">${icon(icons[index])}<b>${item.name}</b><div class="barbg"><div class="barfill" style="width:${Math.max(0, Math.min(100, item.share * 100))}%"></div></div><div class="right"><strong>${percentage(item.share)}</strong><small>${showCurrency ? currency(item.total) : compact(item.total)}</small></div></div>`).join('');
  return `<div class="council"><section class="panel"><h2>1. Arrecadação por plano | ${period}</h2><div class="hero">${icon('money')}<div><strong>${compact(sum(parcels.map((item) => item.total)))}</strong><span>Total de parcelas pagas</span></div></div>${mix(parcels, ['award', 'star', 'tag', 'diamond'], true)}</section><section class="panel"><h2>2. Adesões por plano | ${period}</h2><div class="hero">${icon('chart')}<div><strong>${number(sum(plans.map((item) => item.total)))}</strong><span>adesões</span></div></div>${plans.map((item, index) => `<div class="trend">${icon(['star', 'tag', 'diamond'][index])}<div class="meta"><b>${item.name}</b><strong>${number(item.total)}</strong><strong>${percentage(item.share)}</strong></div><div class="spark">${spark(item.points)}</div></div>`).join('')}</section><section class="panel"><h2>3. Adesões por canal | ${period}</h2><div class="hero">${icon('phone')}<div><strong>${number(sum(channels.map((item) => item.total)))}</strong><span>adesões digitais</span></div></div>${mix(channels, ['phone', 'globe', 'chat', 'kiosk'], false)}</section></div>`;
}

function budgetView() {
  const rows = data.orcadoVsRealizado[state.budget], monthKey = Object.keys(rows[0]).find((key) => !key.startsWith('Coluna'));
  const chartRows = rows.slice(1).map((row) => ({ mes: row[monthKey], Planejado: toNumber(row.Coluna1), Realizado: toNumber(row.Coluna2), Atingimento: toNumber(row.Coluna3) }));
  const realizedRows = chartRows.filter((row) => row.Realizado != null), planned = sum(realizedRows.map((row) => row.Planejado)), actual = sum(realizedRows.map((row) => row.Realizado));
  return tabs([['baseline', 'Baseline'], ['alavanca', 'Alavanca'], ['consolidado', 'Consolidado']], state.budget, 'budget') + `<div class="grid4">${kpi('Planejado acumulado', currency(planned))}${kpi('Realizado acumulado', currency(actual))}${kpi('Atingimento', percentage(actual / planned))}${kpi('Diferença', currency(actual - planned))}</div><section class="card"><h2>Orçado vs Realizado · ${state.budget}</h2><div class="chart">${budgetChart(chartRows)}</div></section>`;
}

function parcelView() {
  const items = categories(data.parcelasPagas.dados, 'Share de Planos'), parsed = matrix(data.parcelasPagas.dados, 'Share de Planos');
  const chartRows = parsed.months.map((month) => { const row = { mes: month.label }; parsed.items.forEach((item) => { row[item['Share de Planos']] = toNumber(item[month.column]) || 0; }); return row; }).filter((row) => items.some((item) => row[item.name] > 0));
  const total = sum(items.map((item) => item.total));
  return `<div class="grid4">${kpi('Total arrecadado', currency(total))}${kpi('Quantidade de planos', items.length)}${kpi('Meses com arrecadação', chartRows.length)}${kpi('Média mensal', currency(total / chartRows.length))}</div><div class="grid4" style="margin-top:14px">${items.map((item) => kpi(item.name, currency(item.total), `${percentage(item.share)} de representatividade`)).join('')}</div><section class="card"><h2>Parcelas pagas por plano</h2><div class="chart">${stackedChart(chartRows, items.map((item) => item.name))}</div></section>`;
}

function monthlyChange(points) { const previous = points[points.length - 2]?.value, current = points[points.length - 1]?.value; return previous ? (current - previous) / previous : 0; }
function growthView() {
  const plans = categories(data.crescimentoBaseVsAdesoes.adesaoPlano, 'Share de Planos'), channels = categories(data.crescimentoBaseVsAdesoes.adesaoCanal, 'Share de Canais');
  const nav = tabs([['plan', 'Adesão por Plano'], ['channel', 'Adesão por Canal'], ['base', 'Crescimento da Base']], state.growth, 'growth');
  if (state.growth !== 'base') {
    const items = state.growth === 'plan' ? plans : channels, cardsClass = state.growth === 'plan' ? 'grid3' : 'grid4', chartsClass = state.growth === 'plan' ? 'grid3' : 'grid2';
    return nav + `<div class="${cardsClass}">${items.map((item) => kpi(item.name, number(item.total), `${percentage(item.share)} de representatividade`, monthlyChange(item.points))).join('')}</div><div class="${chartsClass}">${items.map((item) => `<section class="card"><h2>${item.name}</h2><div class="chart mini">${barChart(item.points)}</div></section>`).join('')}</div>`;
  }
  const rows = data.crescimentoBaseVsAdesoes.crescimentoBase.filter((row) => toNumber(row.total_base) != null), last = rows[rows.length - 1];
  return nav + `<div class="grid4">${kpi('Base atual', number(last.total_base), '', last.crescimento_percentual_base)}${kpi('Adesões acumuladas', number(sum(rows.map((row) => toNumber(row.adesoes)))))}${kpi('Cancelamentos acumulados', number(sum(rows.map((row) => toNumber(row.cancelamentos)))))}${kpi('Crescimento líquido', number(sum(rows.map((row) => toNumber(row.crescimento_liquido)))))}</div><section class="card"><h2>Crescimento da Base</h2><div class="chart">${growthChart(rows)}</div></section>`;
}

function render() { content.innerHTML = state.view === 'council' ? councilView() : state.view === 'budget' ? budgetView() : state.view === 'parcel' ? parcelView() : growthView(); }
document.addEventListener('click', (event) => { const command = event.target.dataset.tab; if (command) { const [group, value] = command.split(':'); state[group] = value; render(); } });
$('#view').addEventListener('change', (event) => { state.view = event.target.value; render(); });
document.addEventListener('pointerover', (event) => { const target = event.target.closest('.hit'); if (!target) return; tooltip.innerHTML = `<strong>${target.dataset.series}</strong><br>${target.dataset.period}<br>${target.dataset.value}`; tooltip.hidden = false; });
document.addEventListener('pointermove', (event) => { if (!tooltip.hidden) { tooltip.style.left = `${event.clientX + 14}px`; tooltip.style.top = `${event.clientY + 14}px`; } });
document.addEventListener('pointerout', (event) => { if (event.target.closest('.hit')) tooltip.hidden = true; });
$('#export').addEventListener('click', async () => {
  document.body.classList.add('exporting'); await new Promise((resolve) => setTimeout(resolve, 100));
  const node = $('#capture'), styles = [...document.styleSheets].map((sheet) => { try { return [...sheet.cssRules].map((rule) => rule.cssText).join(''); } catch { return ''; } }).join('');
  const markup = new XMLSerializer().serializeToString(node.cloneNode(true));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${styles}</style>${markup}</div></foreignObject></svg>`;
  const image = new Image(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = 3840; canvas.height = 2160; const context = canvas.getContext('2d'); context.scale(2, 2); context.drawImage(image, 0, 0); URL.revokeObjectURL(url); const link = document.createElement('a'); link.download = `dashboard-voltz-${state.view}-16x9.png`; link.href = canvas.toDataURL('image/png'); link.click(); document.body.classList.remove('exporting'); };
  image.onerror = () => { URL.revokeObjectURL(url); document.body.classList.remove('exporting'); alert('Não foi possível exportar a imagem.'); };
  image.src = url;
});
fetch('./dashboard.json', { cache: 'no-store' }).then((response) => { if (!response.ok) throw new Error('dashboard.json não encontrado'); return response.json(); }).then((result) => { data = result; render(); }).catch((error) => { content.innerHTML = `<div class="error"><h2>Erro ao carregar o dashboard</h2><p>${error.message}</p></div>`; });
