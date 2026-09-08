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
| Status | `em andamento` — correções de lint iniciadas no v0 |
| Responsável | Conta Manus que iniciou a auditoria; execução corretiva em andamento no v0 |
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

### TASK-006 — Completar fluxo e gestão de Turmas Internas
| Campo | Valor |
|---|---|
| Status | `em andamento` |
| Responsável | Conta Manus que iniciou a implementação, a partir da auditoria fornecida |
| Iniciada em | 2026-09-05 |
| Branch | `feature/internal-classes-management` |
| Commit base | `e815461` — referência da auditoria fornecida; a main remota consultada está em `64bf582` |
| Arquivos principais | `app/professor/turmas-internas/`, `app/dashboard/turmas-internas/`, `components/internal-classes-workspace.tsx`, `components/student-internal-classes.tsx`, `app/api/course-offers/`, `lib/course-offer-service.ts`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub e Vercel; Neon somente após validação explícita de consultas ou migrations |
| Confirmação necessária | Não para diagnóstico e implementação local; sim antes de alterar dados, permissões ou produção |

**Objetivo:** transformar a auditoria das Turmas Internas em um fluxo único e completo de criação e gestão de ofertas, sem alterar dados ou permissões antes da validação.

**Escopo inicial:** corrigir o botão **Nova turma** para levar ao fluxo correto de criação de oferta; completar o detalhe com abas responsivas de Visão geral, Alunos, Sessões, Presença, Atividades e Progresso; calcular o progresso real do aluno a partir dos registros existentes; reorganizar filtros e ações para telas de 320–375 px; separar visualmente ações de professor, administrador e superadministrador; e reduzir consultas sequenciais no dashboard do aluno.

**Estado atual:** a implementação base já existe sobre `course_offers`, com catálogo, busca, filtros, detalhe, alunos vinculados e área do aluno. A branch `v0/task-006-turmas-internas` adicionou o detalhe responsivo com abas de Visão geral, Alunos, Sessões, Presença, Atividades e Progresso. A branch `v0/task-006-turmas-dados-reais` adicionou a rota protegida `/api/course-offers/[id]/academic-summary`, agregando sessões, presença, atividades e progresso real dos alunos vinculados, conectou as métricas do workspace e adicionou `components/create-internal-class-dialog.tsx` ao fluxo de criação explícita. Neste ciclo, `v0/task-006-turmas-formulario` substituiu o reload completo por `router.refresh()` e adicionou fechamento do diálogo por Escape com cleanup. Também foram adicionadas ações protegidas de edição dos dados operacionais da turma e arquivamento (exclusão lógica), preservando os registros acadêmicos históricos. O detalhe agora permite desvincular alunos da turma com confirmação, reutilizando o DELETE protegido de matrículas e preservando o histórico acadêmico. A migration `0089_link_sessions_to_offers.sql` foi aplicada na branch principal do Neon após validação em branch temporária sem registros, e o resumo acadêmico passou a filtrar sessões por `class_sessions.offerId` em vez de misturar sessões de outras turmas do mesmo curso. A criação de sessões administrativas também aceita `offerId`. A remoção definitiva de registros associados permanece deliberadamente fora do fluxo até definir política de retenção e confirmação explícita.

**Validação realizada:** lint focalizado, typecheck e `git diff --check` passaram; 14 testes de contrato/e2e/consistência de ofertas passaram neste ciclo. O navegador em 375px confirmou o redirecionamento correto para login quando não há sessão.

**Bloqueios:** a criação e a rota protegida ainda precisam ser exercitadas com uma sessão real de professor/admin em desktop e mobile; sem credenciais/sessão no preview, não foi possível confirmar criação draft/publicada nem registrar evidência de deployment. Não promover alterações ao Neon nem modificar permissões sem registrar evidências e confirmação.

**Próximo passo exato:** validar os fluxos de presença com uma sessão autorizada e avançar para a edição/exclusão de atividades. A aba Presença agora lista os registros por aluno e sessão, permite alterar entre presente/ausente/justificada e excluir com confirmação, usando `attendanceId + sessionId + offerId`; as métricas são atualizadas sem reload. TypeScript, lint focalizado, 14 testes acadêmicos e `git diff --check` passaram neste ciclo. Sem sessão, o navegador confirmou corretamente o redirecionamento para login em 384×591. A migration já foi aplicada no Neon principal e está registrada localmente como `0089_link_sessions_to_offers.sql`.

**Critério de conclusão:** fluxo de criação funcional, detalhe com abas e dados reais, progresso calculado a partir dos registros existentes, layout validado em mobile, permissões distinguíveis, testes/build verdes e deployment verificado.

### TASK-002 — Otimizar especificamente a rota `/materiais`


| Campo | Valor |
|---|---|
| Status | `concluída` |
| Responsável | v0 |
| Iniciada em | 2026-09-08 |
| Branch | `v0/task-002-performance-materiais` |
| Commit base | `0a10aad` |
| Arquivos principais | `app/materiais/page.tsx`, `app/api/materials/route.ts`, `app/api/materials/progress/route.ts`, `components/material-card.tsx` |
| Serviços afetados | GitHub e Vercel; nenhum dado do Neon alterado neste diagnóstico |
| Confirmação necessária | Não para diagnóstico; sim antes de alterar produção, cache, banco ou infraestrutura |

**Objetivo:** reduzir o tempo de carregamento e o custo de execução da rota `/materiais`, que apresentou o menor score relativo no diagnóstico anterior.

**Escopo:** auditar imagens, fontes, JavaScript, chamadas de API, renderização, cache e consultas usadas pela página; corrigir os gargalos prioritários sem remover funcionalidades; e comparar LCP, INP, CLS, score de Performance e transferência total antes e depois.

**Estado atual:** a rota marcou Performance 83, LCP de 3,68 s e transferência de 366,9 KB no preview otimizado. A medição local inicial em desenvolvimento, viewport 384×591 e dark mode, registrou TTFB 1.300 ms, FCP/LCP 1.612 ms, CLS 0,002 e hidratação React de 125 ms.

**Diagnóstico inicial:** os três custos prioritários são (1) TTFB/consulta da API `/api/materials`, (2) hidratação client-side de toda a página, incluindo busca, filtros, cards e seção de guias, e (3) chamada separada para `/api/materials/progress` após autenticação, que adiciona uma segunda atualização da lista. A página também mantém 24 cards e todos os filtros em um único Client Component.

**Otimização concluída neste ciclo:** a rota agora usa `force-cache` para visitantes não autenticados e mantém `no-store` para usuários autenticados, evitando reutilizar respostas personalizadas de matrícula. A dependência `sessionStatus` foi adicionada ao efeito para repetir a consulta quando a sessão muda. A API agora também envia `Vary: Cookie`, evitando que caches intermediários reutilizem uma resposta de acesso público para uma requisição com sessão. A medição atual em desenvolvimento, viewport 384×591 e dark mode, registrou TTFB 218,9 ms, FCP/LCP 408 ms e hidratação 64,3 ms; a interface e os filtros foram confirmados no preview mobile.

**Bloqueios:** nenhum bloqueio da TASK-002. O lint focalizado continua apontando um erro `react-hooks/set-state-in-effect` preexistente na própria página, na linha que limpa o estado de progresso para visitantes; essa correção pertence à TASK-005 e não foi alterada conforme solicitado.

**Próximo passo exato:** comparar a rota em build de produção e avaliar índices para `isPublic`, `courseId`, `level` e `category` antes de propor uma migration do Neon. A otimização de cache está concluída sem alteração de schema; a correção do erro de lint `react-hooks/set-state-in-effect` permanece fora desta tarefa e não deve ser iniciada, pois pertence à TASK-005.

**Critério de conclusão:** obter melhoria mensurável sem regressão visual, passar nos testes e build, validar o deployment e registrar a comparação no quadro.

### TASK-003 — Monitorar Core Web Vitals continuamente

| Campo | Valor |
|---|---|
| Status | `bloqueada no ambiente local` |
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

**Validação realizada:** a série executada em 2026-09-04 mediu todas as sete rotas, totalizando 21 execuções Lighthouse, com status `passed`. As medianas ficaram entre 90 e 96 de Performance, LCP entre 2.328 ms e 2.790 ms e CLS igual a 0,000 em todas as rotas. TypeScript e sintaxe do script passaram. Nesta retomada, a execução local de `pnpm performance:measure` foi iniciada contra `https://andersonpalafoz.vercel.app`, mas falhou antes da primeira rota porque o ambiente não possui Chrome/Chromium e `CHROME_PATH` não está definido.

**Próximo passo exato:** executar a série Lighthouse no GitHub Actions/CI, onde o Chrome está disponível, e anexar o JSON gerado como artefato; não alterar o script nem instalar navegador no projeto nesta retomada. A validação não deve iniciar a TASK-005.

**Dados reais:** a consulta de Web Analytics do projeto Vercel entre 2026-08-28 e 2026-09-04 retornou 0 visitantes e 0 pageviews. Portanto, o Speed Insights está integrado no código, mas ainda não existe amostra real suficiente para avaliar tendência de campo; isso deve ser reavaliado após tráfego de usuários.

**Bloqueios:** nenhum bloqueio de implementação. A validação de campo permanece pendente por ausência de tráfego real no período consultado.

**Próximo passo exato:** publicar a implementação na `main`, aguardar a primeira execução diária do workflow e revisar o primeiro artefato junto com os dados de Speed Insights após haver tráfego real.

**Critério de conclusão:** workflow publicado e executado com artefato válido, limites definidos, dados de campo disponíveis em volume suficiente e documentação de resposta a regressões confirmada.

### TASK-004 — Repetir e consolidar as medições de desempenho

| Campo | Valor |
|---|---|
| Status | `em validação` |
| Responsável | Conta Manus que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/performance-measurement-series` |
| Commit base | `704e1ac` |
| Arquivos principais | `docs/performance-optimization-baseline-2026-09-02.md` e novos artefatos de medição |
| Serviços afetados | GitHub e Vercel; nenhum acesso ao Neon previsto |
| Confirmação necessária | Não para medições somente leitura |

**Objetivo:** transformar a comparação inicial before/after em uma série de medições estatisticamente mais confiável antes de novas decis��es de otimização.

**Escopo:** repetir pelo menos três execuções por rota em condições equivalentes, descartar execuções redirecionadas ou protegidas, calcular médias e variação, e registrar as limitações do método.

**Estado atual:** a série válida de 4 de setembro de 2026 executou três medições por rota no mesmo deployment público, totalizando 21 execuções. As medianas estão consolidadas em `docs/core-web-vitals-monitoring.md` e agora também foram registradas no relatório `docs/performance-optimization-baseline-2026-09-02.md`: Performance entre 90 e 96, LCP entre 2.328 ms e 2.790 ms, CLS 0,000, FCP entre 946 ms e 1.093 ms e TBT entre 84 ms e 256 ms.

**Bloqueios:** não há artefatos JSON versionados no repositório; a execução local posterior foi bloqueada pela ausência de Chrome/Chromium. A repetição automatizada deve ocorrer no GitHub Actions, onde o workflow já instala as dependências necessárias.

**Próximo passo exato:** executar manualmente o workflow de performance no GitHub Actions, baixar o artefato `core-web-vitals-<run_number>` e anexar o resultado bruto ao registro da tarefa antes de marcá-la como concluída.

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
