# Monitoramento contínuo de Core Web Vitals

## Objetivo

A TASK-003 combina duas fontes complementares: medições de laboratório executadas por Lighthouse e dados reais de usuários coletados pelo Vercel Speed Insights. O laboratório detecta regressões reproduzíveis no deployment; o campo mostra a experiência efetiva de visitantes em dispositivos, redes e geografias diferentes.

O componente `PrivacyAwareSpeedInsights` está instalado no layout raiz e encapsula o SDK em um Client Component, usando `sampleRate={0.5}`. Eventos de rotas privadas ou sensíveis são descartados antes do envio: `/admin`, `/api`, `/dashboard`, `/professor`, `/aluno`, `/login`, `/cadastro`, `/primeiro-acesso` e `/redefinir-senha`. O encapsulamento no Client Component é necessário porque o callback `beforeSend` é uma função e não pode ser passado diretamente de um Server Component do App Router. A coleta de RUM deve ser consultada no projeto Vercel, em **Speed Insights**. O Vercel documenta que Speed Insights usa dados reais de dispositivos dos usuários e que os valores de campo são analisados principalmente por percentis, não por médias [1] [2].

## Rotas e protocolo

O workflow `.github/workflows/performance-monitoring.yml` é executado diariamente às 06:30 UTC e também pode ser iniciado manualmente. Cada execução mede três vezes as sete rotas públicas da TASK-003, no domínio de produção `https://andersonpalafoz.vercel.app`, usando Lighthouse com a categoria Performance.

| Rota | Fonte | Rodadas padrão |
|---|---|---:|
| `/` | Lighthouse + Speed Insights | 3 |
| `/sobre` | Lighthouse + Speed Insights | 3 |
| `/cursos` | Lighthouse + Speed Insights | 3 |
| `/materiais` | Lighthouse + Speed Insights | 3 |
| `/blog` | Lighthouse + Speed Insights | 3 |
| `/contato` | Lighthouse + Speed Insights | 3 |
| `/depoimentos` | Lighthouse + Speed Insights | 3 |

O script `scripts/measure-core-web-vitals.mjs` grava `performance-results/core-web-vitals.json` como artefato do GitHub Actions por 90 dias. O relatório inclui cada medição, a mediana por rota e o status da execução.

## Limites de regressão

Os limites atuais são deliberadamente mais tolerantes que a classificação “good” de campo, porque Lighthouse é uma simulação de laboratório e apresenta variabilidade. Eles servem para detectar uma regressão significativa, não para declarar que a experiência real atende aos Core Web Vitals.

| Métrica | Limite de falha laboratorial | Referência de campo “good” |
|---|---:|---:|
| Performance score mediano | menor que 80 | não é um Core Web Vital |
| LCP mediano | maior que 4.000 ms | até 2.500 ms no p75 |
| CLS mediano | maior que 0,25 | até 0,10 no p75 |

A análise de campo deve usar o p75 por métrica e rota quando houver amostra suficiente. O CrUX é uma alternativa pública, mas só retorna origens e páginas elegíveis com volume suficiente de usuários; sua API também exige uma chave do Google Cloud [3]. Como o projeto já está hospedado na Vercel e o Speed Insights está integrado ao layout, não foi adicionada uma chave Google nem uma coleta paralela de identificadores.

## Primeiro baseline da implementação

A série executada em 4 de setembro de 2026 produziu três medições para cada rota e passou em todos os limites laboratoriais.

| Rota | Score mediano | LCP mediano | CLS mediano | FCP mediano | TBT mediano |
|---|---:|---:|---:|---:|---:|
| `/` | 90 | 2.328 ms | 0,000 | 1.093 ms | 256 ms |
| `/sobre` | 96 | 2.626 ms | 0,000 | 946 ms | 112 ms |
| `/cursos` | 93 | 2.647 ms | 0,000 | 1.051 ms | 160 ms |
| `/materiais` | 93 | 2.790 ms | 0,000 | 984 ms | 115 ms |
| `/blog` | 95 | 2.667 ms | 0,000 | 1.092 ms | 84 ms |
| `/contato` | 93 | 2.681 ms | 0,000 | 950 ms | 201 ms |
| `/depoimentos` | 91 | 2.761 ms | 0,000 | 1.085 ms | 252 ms |

No período de 28 de agosto a 4 de setembro de 2026, a consulta de Web Analytics do projeto retornou zero pageviews e zero visitantes. Portanto, ainda não há volume de tráfego real suficiente para validar uma tendência de RUM; o dashboard deve ser reavaliado depois que usuários reais acessarem a produção.

## Resposta a regressões

Uma falha no workflow deve ser tratada como sinal de investigação, não como prova isolada de degradação. A primeira ação é baixar o artefato JSON, comparar a mediana com as três rodadas anteriores e verificar se a falha afeta uma rota ou todas. Em seguida, deve-se comparar o deployment medido com o commit publicado e consultar o Speed Insights por ambiente, rota, dispositivo e percentil. Alterações de produção só devem ser consideradas confirmadas quando o laboratório e os dados de campo apontarem na mesma direção.

## Referências

[1]: https://vercel.com/docs/speed-insights "Vercel — Speed Insights Overview"
[2]: https://web.dev/articles/vitals-field-measurement-best-practices "web.dev — Best practices for measuring Web Vitals in the field"
[3]: https://developer.chrome.com/docs/crux/api "Chrome for Developers — CrUX API"
