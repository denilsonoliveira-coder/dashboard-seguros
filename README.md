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

## Estrutura real consumida (dashboard.json)

O dashboard consome **exatamente** a estrutura gerada pelo Excel, sem nenhuma dependência de
`meta`, `kpis` ou `mensal`:

```json
{
  "orcadoVsRealizado": { "baseline": [...], "alavanca": [...], "consolidado": [...] },
  "parcelasPagas": { "dados": [...] },
  "crescimentoBaseVsAdesoes": { "adesaoPlano": [...], "adesaoCanal": [...], "crescimentoBase": [...] }
}
```

O arquivo é carregado via `fetch("/dashboard.json")` no navegador — troque
`public/dashboard.json` pelo arquivo real publicado pelo Excel/Vercel e nenhuma alteração de
código é necessária.

### Por que os componentes não assumem nomes de campo fixos

Como os nomes exatos das colunas dentro de cada array (`baseline`, `alavanca`, `dados`,
`adesaoPlano` etc.) não foram informados, os componentes **detectam a estrutura
automaticamente** em tempo de execução (`lib/dataUtils.js`):

- **Chave de rótulo (eixo X)**: procura por candidatos comuns (`mes`, `periodo`, `categoria`,
  `plano`, `canal`, `nome`...); se nenhum bater, usa o primeiro campo de texto da linha.
- **Séries numéricas**: qualquer campo cujo valor seja `number` vira uma série do gráfico
  automaticamente (barra, empilhada ou linha, dependendo da visão).
- **Cores semânticas**: campos como `orcado`/`realizado`, `pagas`/`pendentes`/`atrasadas`,
  `base`/`adesoes`/`cancelamentos` recebem cores fixas por nome; campos desconhecidos usam uma
  paleta cíclica.
- **KPIs**: somados dinamicamente a partir das mesmas chaves numéricas (ex.: "Total Realizado");
  se houver um par de campos que combinam com `orcado`/`realizado`, um KPI extra de
  **Atingimento da meta (%)** é calculado a partir dos totais reais.

Isso significa que, **se os nomes de campo reais do Excel forem diferentes** dos usados no
`dashboard.json` de exemplo (ex.: `mesRef` em vez de `mes`, ou `valorOrcado` em vez de
`orcado`), o dashboard continua funcionando sem quebrar — só os rótulos de legenda ficam menos
"bonitos" (usa `prettyLabel()` para converter camelCase em texto legível). Para refinar os
rótulos ou cores exibidos, edite `LABEL_MAP` e `COLOR_OVERRIDES` em `lib/dataUtils.js`.

## Estrutura de pastas

```
app/
  layout.jsx        → layout raiz, fontes e estilos globais
  page.jsx           → renderiza o componente <Dashboard />
  globals.css         → Tailwind + ajustes finos
components/
  Dashboard.jsx       → topo, seletor de visão + sub-visão, KPIs, export PNG
  KpiCard.jsx          → card individual de indicador (recebe total já calculado)
  charts/
    OrcadoRealizado.jsx   → barras agrupadas (baseline / alavanca / consolidado)
    ParcelasPagas.jsx      → barras empilhadas (dados)
    CrescimentoBase.jsx     → linha + barras (crescimentoBase) ou barras agrupadas
                               (adesaoPlano / adesaoCanal, sem série temporal)
lib/
  format.js            → formatação de moeda (BRL) e números pt-BR
  dataUtils.js           → detecção automática de rótulo/séries/cores/KPIs
public/
  dashboard.json          → dado real (ou de exemplo, com a MESMA estrutura)
```

## Seletor de visão e sub-visão

- O `<select>` no topo alterna entre as três visões de 1º nível
  (`orcadoVsRealizado`, `parcelasPagas`, `crescimentoBaseVsAdesoes`) — sem reload de página.
- Quando a visão ativa tem mais de uma sub-chave (ex.: `baseline` / `alavanca` / `consolidado`),
  aparecem pílulas de sub-visão logo abaixo do título para alternar entre elas.

## Exportar PNG

O botão **Exportar PNG** usa `html2canvas` (importado dinamicamente, só no clique) para
capturar a área do dashboard (título, sub-visão, KPIs e gráfico ativo) e baixar como imagem,
pronta para apresentações executivas.

## Customização visual

- Paleta: `tailwind.config.js` → `colors.navy`, `colors.gold`, `colors.bg`, `colors.good/warn/bad`.
- Tipografia: fonte Inter carregada via Google Fonts em `app/layout.jsx`.
- Todos os cards usam `rounded-xl`/`rounded-2xl` + `shadow-card` para o efeito de elevação suave.
