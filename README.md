# Dashboard Executivo · Voltz

Projeto em Next.js, Tailwind CSS, Recharts e html2canvas, pronto para GitHub e Vercel.

## Estrutura consumida

O projeto usa exclusivamente os caminhos existentes em `public/dashboard.json`:

- `orcadoVsRealizado.baseline`
- `orcadoVsRealizado.alavanca`
- `orcadoVsRealizado.consolidado`
- `parcelasPagas.dados`
- `crescimentoBaseVsAdesoes.adesaoPlano`
- `crescimentoBaseVsAdesoes.adesaoCanal`
- `crescimentoBaseVsAdesoes.crescimentoBase`

Não há dependência de `meta`, `kpis`, `mensal`, `time` ou outros campos inexistentes.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Publicar no Vercel

1. Envie todos os arquivos deste projeto para um repositório no GitHub.
2. No Vercel, clique em **Add New > Project**.
3. Importe o repositório.
4. Mantenha o framework detectado como **Next.js**.
5. Clique em **Deploy**.

## Atualizar os dados

Substitua somente `public/dashboard.json` pelo novo arquivo gerado pelo Office Script e faça um novo commit. O Vercel fará um novo deploy automaticamente.

## Observação sobre ticket médio

Como o JSON não contém quantidade de parcelas ou transações, o KPI é calculado sem criar campos fictícios: **total arrecadado dividido pela quantidade de meses com arrecadação**, sendo exibido como “Ticket médio mensal”.
