# Dashboard Executivo — Voltz

Dashboard em **Next.js 14 (App Router) + Tailwind CSS + Recharts**, inspirado visualmente no
`roadmap-voltz.vercel.app`: fundo cinza claro, cards brancos com bordas suaves, azul-marinho
(`#0A2D87`) como cor principal e leitura rápida dos indicadores.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Para gerar a versão de produção:

```bash
npm run build
npm run start
```

## Estrutura

```
app/
  layout.jsx        → layout raiz, fontes e estilos globais
  page.jsx           → renderiza o componente <Dashboard />
  globals.css         → Tailwind + ajustes finos
components/
  Dashboard.jsx       → topo, seletor de visão, KPIs, export PNG
  KpiCard.jsx          → card individual de indicador
  charts/
    OrcadoRealizado.jsx
    ParcelasPagas.jsx
    CrescimentoBase.jsx
lib/
  format.js            → formatação de moeda (BRL) e números pt-BR
public/
  dashboard.json        → fonte única dos dados (KPIs + séries mensais)
```

## Trocando os dados

Edite `public/dashboard.json`. O arquivo é carregado via `fetch("/dashboard.json")` no
navegador, então basta salvar e recarregar a página — não é necessário rebuild.

Cada visão tem sua própria seção no JSON:

- `orcadoRealizado` → KPIs + série mensal `{ mes, orcado, realizado }`
- `parcelasPagas` → KPIs + série mensal `{ mes, pagas, pendentes, atrasadas }`
- `crescimentoBaseVsAdesoes` → KPIs + série mensal `{ mes, base, adesoes, cancelamentos }`

## Seletor de visão

O `<select>` no topo alterna entre as três visões (`Orçado vs Realizado`, `Parcelas Pagas`,
`Crescimento da Base vs Adesões`) trocando apenas o estado React — sem reload de página.

## Exportar PNG

O botão **Exportar PNG** usa `html2canvas` (importado dinamicamente, só no clique) para
capturar a área do dashboard (título, cards de contexto, KPIs e gráfico da visão ativa) e
baixar como imagem, pronta para apresentações executivas.

## Customização visual

- Paleta: `tailwind.config.js` → `colors.navy`, `colors.gold`, `colors.bg`, `colors.good/warn/bad`.
- Tipografia: fonte Inter carregada via Google Fonts em `app/layout.jsx`.
- Todos os cards usam `rounded-xl`/`rounded-2xl` + `shadow-card` para o efeito de elevação suave.
