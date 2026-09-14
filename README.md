# Dashboard Executivo · Voltz

Projeto completo para substituir a versão atual.

## Ajustes incluídos
- Rótulos em Planejado, Realizado e Atingimento nas três abas de Orçado vs Realizado.
- Rótulos abreviados em Parcelas Pagas: `1,5k` e `1,5MM`.
- Linha Total na tabela Detalhamento por plano.
- Adesão por plano e canal exibidas mês a mês.
- Crescimento da Base com área para `total_base` e linha para `crescimento_percentual_base`; demais séries suprimidas desse gráfico.

## Deploy
1. Extraia o ZIP.
2. Substitua todo o conteúdo do repositório atual.
3. Faça commit e push.
4. O Vercel fará o novo deploy automaticamente.

Para futuras atualizações de dados, substitua apenas `public/dashboard.json`.


## Substituição segura do repositório

Antes de enviar esta versão, exclua os arquivos antigos do repositório. Em especial, não mantenha componentes removidos como `ChannelBarChart.tsx` e `PlanBarChart.tsx`. Depois envie o conteúdo deste ZIP para a raiz do repositório.
