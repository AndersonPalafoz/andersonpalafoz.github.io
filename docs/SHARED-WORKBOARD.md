# Quadro compartilhado do projeto

> Este é o quadro operacional compartilhado para continuidade de atividades entre diferentes contas Manus que trabalham no mesmo repositório, na Vercel e no Neon.
>
> O arquivo deve ser atualizado junto com cada alteração relevante. O `todo.md` permanece como índice e histórico de longo prazo; o estado atual e o próximo passo devem ser registrados aqui.

## Como usar este quadro

A conta que iniciar uma atividade deve criar ou atualizar uma tarefa com identificador único, registrar os arquivos e serviços envolvidos, indicar a branch e deixar explícito o próximo passo. A conta que assumir a atividade deve ler este arquivo, verificar o commit indicado no GitHub e confirmar o estado real do código antes de continuar.

Nenhuma tarefa deve ser marcada como concluída apenas porque o código foi escrito. A conclusão exige validação adequada, registro dos testes e, quando houver mudança externa, confirmação do estado na Vercel, Neon ou outro serviço afetado.

## Convenções de status

| Status | Significado |
|---|---|
| `backlog` | Tarefa planejada, ainda não iniciada |
| `em andamento` | Existe uma conta trabalhando ativamente |
| `aguardando confirmação` | Não deve avançar sem autorização explícita |
| `bloqueada` | Existe uma dependência ou falha impedindo o avanço |
| `em validação` | Implementação concluída, aguardando testes ou verificação externa |
| `concluída` | Código, testes e publicação ou aplicação foram confirmados |

## Em andamento

### TASK-005 — Auditar segurança, banco e integração Classroom

| Campo | Valor |
|---|---|
| Status | `em andamento` |
| Responsável | Conta Manus que iniciou a auditoria; correções de lint iniciadas no v0 |
| Iniciada em | 2026-09-04 |
| Branch | `main` para o estado auditado; trabalho corretivo em andamento no v0 |
| Commit base | `62221f4` |
| Arquivos principais | `drizzle/schema.ts`, `lib/academic-context.ts`, `lib/admin-auth.ts`, `lib/google-classroom-api.ts`, `app/api/classroom/`, `app/api/cron/classroom-sync/`, `app/api/health/`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub, Vercel e Neon; nenhuma alteração de produção feita nesta etapa |
| Confirmação necessária | Sim antes de promover o `app_runtime` ou alterar a branch Neon de produção |

**Objetivo:** confirmar que o modelo de turmas internas, a sincronização Google Classroom, as migrations e o role PostgreSQL restrito permanecem seguros e funcionais na `main` atual.

**Estado atual:** o TypeScript e o build passam quando uma `DATABASE_URL` válida é fornecida; a deployment de produção do Vercel para `62221f4` está `READY`; a auditoria diária de ofertas está verde; o `app_runtime` e a migration de `offerId`/unicidade foram validados anteriormente em branch Neon de teste. O modelo usa `course_offers` como turma, `enrollments` como matrícula e `class_sessions.offerId` como vínculo explícito. As correções dos erros de lint foram iniciadas no v0; o identificador de branch, PR ou commit correspondente ainda não foi informado e não foi localizado entre as referências Git remotas disponíveis.

**Bloqueios:** o CI já foi ajustado para separar testes unitários e integração Neon, mas a execução de integração continua condicionada à existência de um secret de banco. O lint ainda falha com 96 erros e 44 avisos. A contagem detalhada da execução na `main` é: 70 ocorrências de `react-hooks/set-state-in-effect` (erro), 21 de `react-hooks/exhaustive-deps` (aviso), 14 de `@next/next/no-img-element` (aviso), 7 de `@next/next/no-location-assign-relative-destination` (erro), 6 de `react-hooks/immutability` (erro), 6 de `@next/next/no-assign-module-variable` (erro), 3 de `react-hooks/purity` (erro), 1 de `react-hooks/preserve-manual-memoization` (erro), 1 de `jsx-a11y/alt-text` (aviso) e 1 de `@next/next/no-html-link-for-pages` (aviso). As prioridades são corrigir primeiro os 70 efeitos com atualização síncrona de estado, depois os 13 erros de regras de navegação/mutabilidade e, por fim, os avisos de imagens, dependências de effects e acessibilidade. Também é necessário confirmar que a branch Neon de produção contém todas as migrations usadas pela `main` antes de promover o role restrito.

**Próximo passo exato:** registrar no quadro o primeiro commit ou PR gerado no v0, depois comparar a lista de arquivos e linhas corrigidos com os 70 erros `react-hooks/set-state-in-effect` da `main` e executar o lint novamente.

**Critério de conclusão:** CI e lint verdes, migrations comparadas e aplicadas em staging, Preview validado com `app_runtime`, fluxos de turma interna/Classroom testados e evidências registradas no quadro.

## Modelo de tarefa (referência)

```md
### TASK-000 — Título curto da atividade

| Campo | Valor |
|---|---|
| Status | `em andamento` |
| Responsável | Conta Manus ou pessoa responsável |
| Iniciada em | AAAA-MM-DD |
| Branch | `feature/nome-da-tarefa` |
| Commit base | `abcdef1` |
| Arquivos principais | `caminho/arquivo.tsx`, `docs/arquivo.md` |
| Serviços afetados | GitHub, Vercel, Neon ou nenhum |
| Confirmação necessária | Sim/Não |

**Objetivo:** descreva o resultado esperado.

**Estado atual:** descreva o que já foi feito e o que foi verificado.

**Bloqueios:** registre dependências, erros ou informações pendentes. Use “Nenhum” quando não houver.

**Próximo passo exato:** escreva uma ação única e verificável para a próxima conta executar.

**Critério de conclusão:** descreva quais testes, consultas, deployment ou evidências encerram a tarefa.
```

## Próximas atividades

Use esta seção para tarefas já decididas, mas ainda não iniciadas.

### TASK-002 — Otimizar especificamente a rota `/materiais`

| Campo | Valor |
|---|---|
| Status | `backlog` |
| Responsável | Conta Manus que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/performance-materiais` |
| Commit base | `704e1ac` |
| Arquivos principais | A identificar após auditoria da rota `/materiais` |
| Serviços afetados | GitHub e Vercel; Neon somente se forem encontradas consultas lentas |
| Confirmação necessária | Não para diagnóstico; sim antes de alterar produção, cache, banco ou infraestrutura |

**Objetivo:** reduzir o tempo de carregamento e o custo de execução da rota `/materiais`, que apresentou o menor score relativo no diagnóstico anterior.

**Escopo:** auditar imagens, fontes, JavaScript, chamadas de API, renderização, cache e consultas usadas pela página; corrigir os gargalos prioritários sem remover funcionalidades; e comparar LCP, INP, CLS, score de Performance e transferência total antes e depois.

**Estado atual:** a rota marcou Performance 83, LCP de 3,68 s e transferência de 366,9 KB no preview otimizado.

**Bloqueios:** nenhum bloqueio conhecido. Não alterar dados do Neon durante a auditoria sem registro e confirmação.

**Próximo passo exato:** executar Lighthouse e inspeção de rede na rota `/materiais`, identificar os três maiores recursos ou operações responsáveis pelo custo e registrar as evidências.

**Critério de conclusão:** obter melhoria mensurável sem regressão visual, passar nos testes e build, validar o deployment e registrar a comparação no quadro.

### TASK-003 — Monitorar Core Web Vitals continuamente

| Campo | Valor |
|---|---|
| Status | `em validação` |
| Responsável | Conta Manus que iniciou a implementação |
| Iniciada em | 2026-09-03 |
| Branch | `main` |
| Commit base | `62221f4` |
| Arquivos principais | `app/layout.tsx`, `components/speed-insights.tsx`, `scripts/measure-core-web-vitals.mjs`, `.github/workflows/performance-monitoring.yml`, `docs/core-web-vitals-monitoring.md`, `package.json`, `pnpm-lock.yaml` |
| Serviços afetados | GitHub Actions e Vercel; nenhum acesso ao Neon previsto |
| Confirmação necessária | Não há serviço pago novo; a coleta de RUM usa o Speed Insights disponível no projeto Vercel |

**Objetivo:** criar acompanhamento repetível de LCP, INP, CLS, score de Performance, erros e regressões nas rotas públicas prioritárias.

**Escopo:** combinar Vercel Speed Insights para dados reais de usuários com Lighthouse em GitHub Actions; executar pelo menos três medições por rota; armazenar o JSON como artefato de CI por 90 dias; estabelecer limites de alerta; e documentar o procedimento de comparação e resposta.

**Estado atual:** o pacote `@vercel/speed-insights@2.0.0` foi integrado ao layout raiz com amostragem de 50%. Eventos das rotas privadas e administrativas são descartados no `beforeSend`. O script `scripts/measure-core-web-vitals.mjs` mede as sete rotas públicas três vezes e calcula medianas para score, LCP, CLS, FCP, TBT e TTFB. O workflow diário está definido para 06:30 UTC e possui disparo manual.

**Validação realizada:** a série executada em 2026-09-04 mediu todas as sete rotas, totalizando 21 execuções Lighthouse, com status `passed`. As medianas ficaram entre 90 e 96 de Performance, LCP entre 2.328 ms e 2.790 ms e CLS igual a 0,000 em todas as rotas. TypeScript e sintaxe do script passaram.

**Dados reais:** a consulta de Web Analytics do projeto Vercel entre 2026-08-28 e 2026-09-04 retornou 0 visitantes e 0 pageviews. Portanto, o Speed Insights está integrado no código, mas ainda não existe amostra real suficiente para avaliar tendência de campo; isso deve ser reavaliado após tráfego de usuários.

**Bloqueios:** nenhum bloqueio de implementação. A validação de campo permanece pendente por ausência de tráfego real no período consultado.

**Próximo passo exato:** publicar a implementação na `main`, aguardar a primeira execução diária do workflow e revisar o primeiro artefato junto com os dados de Speed Insights após haver tráfego real.

**Critério de conclusão:** workflow publicado e executado com artefato válido, limites definidos, dados de campo disponíveis em volume suficiente e documentação de resposta a regressões confirmada.

### TASK-004 — Repetir e consolidar as medições de desempenho

| Campo | Valor |
|---|---|
| Status | `backlog` |
| Responsável | Conta Manus que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/performance-measurement-series` |
| Commit base | `704e1ac` |
| Arquivos principais | `docs/performance-optimization-baseline-2026-09-02.md` e novos artefatos de medição |
| Serviços afetados | GitHub e Vercel; nenhum acesso ao Neon previsto |
| Confirmação necessária | Não para medições somente leitura |

**Objetivo:** transformar a comparação inicial before/after em uma série de medições estatisticamente mais confiável antes de novas decisões de otimização.

**Escopo:** repetir pelo menos três execuções por rota em condições equivalentes, descartar execuções redirecionadas ou protegidas, calcular médias e variação, e registrar as limitações do método.

**Estado atual:** há uma rodada válida comparando produção e preview, com melhora média de Performance de 74,0 para 89,3.

**Bloqueios:** a série deve usar um preview acessível e um protocolo fixo para evitar misturar métricas de páginas protegidas, cold starts ou condições de rede diferentes.

**Próximo passo exato:** executar as três rodadas no mesmo deployment e atualizar o relatório com média, mediana e faixa observada por rota.

**Critério de conclusão:** relatório atualizado, artefatos brutos preservados, metodologia documentada e recomendação de merge ou nova rodada baseada nos dados.

- [x] Registrar alterações de produção que não estejam representadas por migration ou commit.

## Bloqueadas

Nenhuma tarefa bloqueada registrada.

## Aguardando confirmação

Nenhuma tarefa aguardando confirmação registrada.

## Concluídas recentemente

| Data | Tarefa | Evidência |
|---|---|---|
| 2026-09-02 | Criação do quadro compartilhado e transformação do `todo.md` em índice | Commit [`c746fd4`](https://github.com/AndersonPalafoz/andersonpalafoz.github.io/commit/c746fd4) |
| 2026-09-02 | TASK-001 — Auditoria e otimização de desempenho | PR [#29](https://github.com/AndersonPalafoz/andersonpalafoz.github.io/pull/29), deployment [`dpl_2spZwXyeXk6epDs3vjTKka9TVfb5`](https://vercel.com/palafozanderson-2076s-projects.vercel.app/2spZwXyeXk6epDs3vjTKka9TVfb5), baseline em [`docs/performance-optimization-baseline-2026-09-02.md`](./performance-optimization-baseline-2026-09-02.md) |

## Decisões compartilhadas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-09-02 | `todo.md` será o índice e histórico; este arquivo será o quadro operacional | Separar histórico extenso de estado atual e facilitar handoff |
| 2026-09-02 | `main` é a branch de publicação; tarefas maiores devem usar branch própria | Reduzir conflitos e manter rastreabilidade |
| 2026-09-04 | `docs/SHARED-WORKBOARD.md` deve ser lido no início de cada atividade e atualizado ao iniciar, pausar, concluir ou transferir uma tarefa | Manter um estado operacional único entre contas Manus |
| 2026-09-02 | Mudanças destrutivas no Neon exigem confirmação explícita e rollback documentado | Preservar dados e auditabilidade |
| 2026-09-02 | Código, migration, testes e estado de produção devem ser registrados separadamente | GitHub não representa sozinho o estado de serviços externos |

## Registro de produção

Registre nesta seção mudanças aplicadas diretamente em serviços externos.

| Data | Serviço | Alteração | Ambiente | Evidência/rollback | Responsável |
|---|---|---|---|---|---|
| — | — | Nenhuma alteração registrada neste quadro | — | — | — |

## Checklist de handoff

Antes de entregar uma tarefa a outra conta, confirme que o quadro informa o objetivo, o status, a branch, o commit base, os arquivos alterados, os testes executados, os serviços afetados, os bloqueios e o próximo passo exato. Se houver operação no Neon ou na Vercel, registre também se ela foi apenas preparada, executada ou verificada.

## Relação com outros documentos

- [`todo.md`](../todo.md): índice e histórico acumulado do projeto.
- [`legacy-tables-decommission-plan.md`](./legacy-tables-decommission-plan.md): plano específico para desativação das tabelas legadas.
- [`todo-reconciliation-2026-08-19.md`](./todo-reconciliation-2026-08-19.md): reconciliação histórica do TODO.
- [`auditoria-todo-2026-08-26.md`](./auditoria-todo-2026-08-26.md): auditoria histórica do TODO.
- [`google-reviews-setup.md`](./google-reviews-setup.md): configuração da integração com avaliações do Google.

## Regra de atualização

Sempre que uma conta iniciar, pausar, concluir ou transferir uma atividade, atualize este arquivo no mesmo commit da mudança, ou em um commit documental imediatamente relacionado. Não remova entradas concluídas; mova-as para o histórico para preservar a trilha de auditoria.
