# Diagnóstico de desempenho — 2026-09-02

## Escopo

Este diagnóstico compara a produção antes da otimização com o deployment de preview da branch `feature/performance-optimization`, commit `a78f0af`. Foram avaliadas as rotas públicas `/`, `/sobre`, `/cursos`, `/materiais`, `/blog`, `/contato` e `/depoimentos`.

A medição foi feita com Lighthouse 12.8.2 em execução headless, usando o mesmo ambiente de execução e o mesmo conjunto de rotas. A produção foi acessada em `https://andersonpalafoz.vercel.app`; o preview foi acessado no deployment da branch com um link temporário de leitura da Vercel.

> Os resultados representam uma rodada comparativa e não substituem uma série estatística de execuções em dispositivos e redes diferentes. A decisão de merge deve considerar também a validação visual, o build da Vercel e uma nova medição após a publicação.

## Comparação before/after

| Rota | Performance antes | Performance depois | Variação | LCP antes | LCP depois | Variação LCP | Transferência antes | Transferência depois | Variação |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 78 | 89 | +11 | 4,22 s | 2,03 s | -2,19 s | 777,4 KB | 399,0 KB | -378,4 KB |
| `/sobre` | 68 | 92 | +24 | 4,91 s | 2,34 s | -2,58 s | 567,4 KB | 380,5 KB | -186,9 KB |
| `/cursos` | 79 | 88 | +9 | 4,53 s | 2,32 s | -2,21 s | 554,9 KB | 368,6 KB | -186,2 KB |
| `/materiais` | 64 | 83 | +19 | 5,02 s | 3,68 s | -1,34 s | 553,2 KB | 366,9 KB | -186,3 KB |
| `/blog` | 78 | 86 | +8 | 4,51 s | 3,60 s | -0,91 s | 552,9 KB | 365,8 KB | -187,2 KB |
| `/contato` | 73 | 93 | +20 | 4,61 s | 2,24 s | -2,37 s | 550,2 KB | 363,9 KB | -186,2 KB |
| `/depoimentos` | 78 | 94 | +16 | 4,50 s | 2,32 s | -2,19 s | 547,8 KB | 361,1 KB | -186,7 KB |

## Síntese dos resultados

A média do score de Performance subiu de aproximadamente **74,0** para **89,3** pontos nas sete rotas, uma evolução média de **15,3 pontos**. O LCP médio caiu de aproximadamente **4,58 s** para **2,65 s**, redução média de **1,93 s**. A transferência média caiu de aproximadamente **586,2 KB** para **372,3 KB**, redução média de **213,9 KB** por rota.

O maior ganho de score ocorreu em `/sobre`, com aumento de 24 pontos. A maior redução de transferência ocorreu na home, principalmente porque a imagem principal passou a ser entregue pelo pipeline de otimização do Next.js. A rota `/materiais` continua sendo a de menor score relativo e deve permanecer como prioridade na próxima rodada, sobretudo por apresentar LCP de 3,68 s no preview.

## Alterações correlacionadas

A branch removeu o carregamento duplicado de Poppins no CSS global, migrou Poppins e Inter para `next/font`, converteu a imagem principal da home e os logos do cabeçalho e rodapé para `next/image`, definiu `sizes` e qualidade para os assets públicos e habilitou AVIF/WebP com cache mínimo de 30 dias no `next.config.ts`.

## Validações complementares

Os contratos direcionados de assets, integração de depoimentos e rotas públicas passaram, totalizando **9 testes aprovados**. O `git diff --check` também passou. O build local compilou o código, mas a coleta de rotas não pôde terminar porque o sandbox não possui `NEON_DATABASE_URL` nem `DATABASE_URL`; a validação definitiva do build deve ocorrer no deployment da Vercel com as variáveis configuradas.

## Próximos passos

A branch deve ser revisada visualmente no preview, com atenção especial a logos, imagem principal, layout responsivo e carregamento da rota `/materiais`. Depois, deve ser executada uma série de pelo menos três medições por rota, em condições equivalentes, para reduzir a variabilidade do score. Somente após confirmar o build da Vercel e a ausência de regressões a branch deve ser mesclada na `main`.

## Evidências

- Branch: `feature/performance-optimization`
- Commit: `a78f0af`
- Preview: `https://andersonpalafoz-5707kjimr-palafozanderson-2076s-projects.vercel.app`
- Produção comparada: `https://andersonpalafoz.vercel.app`
- Relatórios brutos do Lighthouse: `/tmp/performance-baseline-2026-09-02/` e `/tmp/performance-after-2026-09-02/` no ambiente de diagnóstico.
