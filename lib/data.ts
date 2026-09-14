export type Row=Record<string,string|number|null>;
export const present=(v:unknown)=>v!==null&&v!==undefined&&v!=='';
export const num=(v:unknown):number|null=>{if(!present(v))return null;if(typeof v==='number')return Number.isFinite(v)?v:null;const n=Number(String(v).trim().replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'));return Number.isFinite(n)?n:null};
export const sum=(a:(number|null)[])=>a.reduce<number>((t,v)=>t+(v??0),0);
export const money=(v:number|null|undefined)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v??0);
export const integer=(v:number|null|undefined)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(v??0);
export const percent=(v:number|null|undefined)=>new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1}).format(v??0);
export const abbr=(v:number|null|undefined)=>{const n=v??0,a=Math.abs(n),f=(x:number)=>new Intl.NumberFormat('pt-BR',{minimumFractionDigits:Number.isInteger(x)?0:1,maximumFractionDigits:1}).format(x);return a>=1e6?f(n/1e6)+'MM':a>=1e3?f(n/1e3)+'k':integer(n)};
export function matrix(rows:Row[]|undefined,labelKey:string){const safe=Array.isArray(rows)?rows:[];const header=safe.find(r=>!present(r[labelKey]))??safe[0];if(!header)return{months:[] as {key:string,label:string}[],items:[] as Row[],data:[] as Record<string,string|number>[],series:[] as string[]};const months=Object.entries(header).filter(([k,v])=>k!==labelKey&&typeof v==='string'&&/^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/.test(v)).map(([key,label])=>({key,label:String(label)}));const items=safe.filter(r=>present(r[labelKey])&&r[labelKey]!=='Total');const series=items.map(r=>String(r[labelKey]));const data=months.map(m=>{const p:Record<string,string|number>={mes:m.label};items.forEach(r=>p[String(r[labelKey])]=num(r[m.key])??0);return p}).filter(p=>series.some(s=>Number(p[s])!==0));return{months,items,data,series}}
// Compatibility exports for components from earlier project versions.
export const compactNumber = abbr;
export const formatNumber = integer;
export const compactCurrency = abbr;
export const formatCurrency = money;
export const formatPercent = percent;
export const toNumber = num;

// Full backward compatibility with components from the first dashboard version.
export const isPresent = present;

export function parseMatrix(rows: Row[] | undefined, labelKey: string) {
  const parsed = matrix(rows, labelKey);
  return { months: parsed.months, items: parsed.items };
}

export function matrixToMonthlySeries(rows: Row[] | undefined, labelKey: string) {
  const parsed = matrix(rows, labelKey);
  return { data: parsed.data, series: parsed.series };
}
