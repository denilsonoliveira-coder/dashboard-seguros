export const present=v=>v!==null&&v!==undefined&&v!=='';
export const num=v=>{if(!present(v))return null;if(typeof v==='number')return Number.isFinite(v)?v:null;const n=Number(String(v).replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'));return Number.isFinite(n)?n:null};
export const sum=a=>a.reduce((t,v)=>t+(v??0),0);
export const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v??0);
export const integer=v=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(v??0);
export const percent=v=>new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1}).format(v??0);
export const abbr=v=>{const n=v??0,a=Math.abs(n),f=x=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(x);return a>=1e6?f(n/1e6)+' MM':a>=1e3?f(n/1e3)+'k':integer(n)};
export function matrix(rows,key){const s=Array.isArray(rows)?rows:[],h=s.find(x=>!present(x[key]))??s[0];if(!h)return{months:[],items:[]};const months=Object.entries(h).filter(([k,v])=>k!==key&&typeof v==='string'&&/^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)$/.test(v)).map(([key,label])=>({key,label:String(label)}));return{months,items:s.filter(x=>present(x[key])&&x[key]!=='Total')}}
export const variation=a=>{const v=a.filter(x=>x!==null);if(v.length<2)return null;const p=v.at(-2),n=v.at(-1);return p===0?null:(n-p)/p};
