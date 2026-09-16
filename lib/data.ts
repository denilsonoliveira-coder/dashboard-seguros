export type Row=Record<string,string|number|null>;export const present=(v:unknown)=>v!==null&&v!==undefined&&v!=='';export const num=(v:unknown):number|null=>{if(!present(v))return null;if(typeof v==='number')return Number.isFinite(v)?v:null;const n=Number(String(v).trim().replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'));return Number.isFinite(n)?n:null};export const sum=(a:(number|null)[])=>a.reduce<number>((t,v)=>t+(v??0),0);export const money=(v:number|null|undefined)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v??0);export const integer=(v:number|null|undefined)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(v??0);export const percent=(v:number|null|undefined)=>new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1}).format(v??0);export const abbr=(v:number|null|undefined)=>{const n=v??0,a=Math.abs(n),f=(x:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(x);return a>=1e6?f(n/1e6)+'MM':a>=1e3?f(n/1e3)+'k':integer(n)};export function matrix(rows:Row[]|undefined,key:string){const s=Array.isArray(rows)?rows:[],h=s.find(x=>!present(x[key]))??s[0];if(!h)return{months:[] as {key:string,label:string}[],items:[] as Row[]};const months=Object.entries(h).filter(([k,v])=>k!==key&&typeof v==='string'&&/^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/.test(v)).map(([key,label])=>({key,label:String(label)}));return{months,items:s.filter(x=>present(x[key])&&x[key]!=='Total')}}export const variation=(values:(number|null)[])=>{const valid=values.filter((v):v is number=>v!==null);if(valid.length<2)return null;const prev=valid[valid.length-2],last=valid[valid.length-1];return prev===0?(last===0?0:null):(last-prev)/prev};
// Compatibility exports for legacy components that may remain in the repository.
export const compactNumber = abbr;
export const compactCurrency = abbr;
export const formatNumber = integer;
export const formatCurrency = money;
export const formatPercent = percent;
export const toNumber = num;
export const isPresent = present;

export function parseMatrix(rows: Row[] | undefined, labelKey: string) {
  return matrix(rows, labelKey);
}

export function matrixToMonthlySeries(rows: Row[] | undefined, labelKey: string) {
  const parsed = matrix(rows, labelKey);
  const series = parsed.items.map((row) => String(row[labelKey]));
  const data = parsed.months
    .map((month) => {
      const point: Record<string, string | number> = { mes: month.label };
      parsed.items.forEach((row) => {
        point[String(row[labelKey])] = num(row[month.key]) ?? 0;
      });
      return point;
    })
    .filter((point) => series.some((name) => Number(point[name]) !== 0));
  return { data, series };
}
