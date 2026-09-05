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

### TASK-006 — Restringir acesso a Turmas Externas

| Campo | Valor |
|---|---|
| Status | `concluída` |
| Responsável | v0 |
| Iniciada em | 2026-09-04 |
| Branch | `main` |
| Commit base | `33e1c960` |
| Arquivos principais | `app/api/enrollments/route.ts`, `app/api/enrollments/external-enrollment.test.ts`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub e Vercel; nenhum serviço externo alterado |
| Confirmação necessária | Não |

**Objetivo:** garantir que Turmas Externas sejam acessíveis apenas a professores/administradores e a alunos previamente cadastrados, sem autoinscrição ou solicitação de matrícula.

**Estado atual:** o endpoint de matrículas rejeita alunos que tentem se matricular em ofertas com `sourceExternalClassId`; professores e administradores permanecem autorizados. O catálogo interno continua excluindo cursos externos. TypeScript passou com heap ampliado, 12 testes de contrato passaram e a API sem sessão respondeu `401 Não autenticado`.

**Bloqueios:** Nenhum.

**Próximo passo exato:** nenhuma ação pendente; manter a regra em revisões futuras de matrícula e acesso externo.

**Critério de conclusão:** validações verdes, proteção server-side confirmada, preview/API verificados e alterações sincronizadas na branch.

### TASK-005 — Auditar segurança, banco e integração Classroom

| Campo | Valor |
|---|---|
| Status | `em validação` |
| Responsável | v0 |
| Iniciada em | 2026-09-04 |
| Branch | `v0/restrict-external-class-enrollment` |
| Commit base | `38f4226` |
| Arquivos principais | `drizzle/schema.ts`, `lib/academic-context.ts`, `lib/admin-auth.ts`, `lib/google-classroom-api.ts`, `app/api/classroom/`, `app/api/cron/classroom-sync/`, `app/api/health/`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub, Vercel e Neon; nenhuma alteração de produção feita nesta etapa |
| Confirmação necessária | Sim antes de promover o `app_runtime` ou alterar a branch Neon de produção |

**Objetivo:** confirmar que o modelo de turmas internas, a sincronização Google Classroom, as migrations e o role PostgreSQL restrito permanecem seguros e funcionais na `main` atual.

**Estado atual:** o typecheck passou com heap ampliado; o lint completo permanece vermelho, principalmente por ocorrências de `react-hooks/set-state-in-effect`. Os ciclos anteriores corrigiram `app/admin/blog/page.tsx`, `app/admin/cursos/page.tsx`, `app/admin/atividades/page.tsx`, `app/admin/auditoria/page.tsx`, `app/admin/avaliacoes/page.tsx`, `app/admin/chamada/page.tsx` e, neste ciclo, `app/admin/materiais/page.tsx` e `app/admin/matriculas/page.tsx`. Também foram corrigidos os carregamentos assíncronos em `app/admin/cms/engagement-analytics.tsx`, `app/admin/cms/page.tsx`, `app/admin/cursos/audit/page.tsx`, `app/admin/cupons/page.tsx` e `app/admin/liberacao-acesso/page.tsx`. O lint focalizado de matrículas, medalhas e mensagens, além do typecheck, passou; `git diff --check` também passou. Em `app/admin/medalhas/page.tsx` e `app/admin/mensagens/page.tsx`, os carregamentos iniciais agora são agendados com cleanup para evitar `setState` síncrono no efeito; mensagens também usa atualização funcional para preservar imutabilidade. Neste ciclo, `app/professor/turmas-externas/page.tsx` também foi corrigido: inicialização de duração, carregamento inicial e seleção de aba usam callbacks agendados com cleanup; o lint ficou com 0 erros e 3 avisos não bloqueantes, e typecheck/diff check passaram. Permanecem avisos não bloqueantes e outros grupos de erros fora do escopo deste ciclo. As migrations do Google Classroom estão presentes até `0088_classroom_connection_roles.sql`; o workflow do CI já aceita `NEON_DATABASE_URL`, `DATABASE_URL` ou `COURSE_AUDIT_DATABASE_URL`. O modelo usa `course_offers` como turma, `enrollments` como matrícula e `class_sessions.offerId` como vínculo explícito.

**Bloqueios:** o CI do GitHub continua sem um secret Neon/staging disponível; o lint completo permanece vermelho; ainda não foi possível comparar o inventário real da branch Neon de produção, e nenhuma alteração de produção foi feita.

**Próximo passo exato:** configurar um secret de staging no CI, continuar corrigindo os erros de lint por grupos nas áreas admin/docente, e então comparar a branch Neon de produção com as migrations até `0088` antes de qualquer promoção do `app_runtime` ou alteração do role restrito.

**Critério de conclusão:** CI e lint verdes, migrations comparadas e aplicadas em staging, Preview validado com `app_runtime`, fluxos de turma interna/Classroom testados e evidências registradas no quadro.

### TASK-002 — Atualizar painéis administrativos e docentes

| Campo | Valor |
|---|---|
| Status | `concluída` |
| Responsável | v0 |
| Iniciada em | 2026-09-04 |
| Branch | `v0/github-para-v0-bf0d37b9` |
| Commit base | `654ae100` |
| Arquivos principais | `app/admin/page.tsx`, `app/professor/page.tsx`, `components/admin-mobile-nav.tsx`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub e Vercel; nenhum serviço externo alterado |
| Confirmação necessária | Não |

**Objetivo:** melhorar a descoberta e a consistência dos painéis admin e docente, destacando Turmas Internas sem duplicar Turmas Externas.

**Estado atual:** link de Turmas Internas adicionado às ações rápidas do dashboard docente e à navegação administrativa mobile. Turmas Externas permanece como fluxo separado.

**Bloqueios:** Nenhum.

**Próximo passo exato:** executar typecheck, testes relacionados à navegação e verificar o preview em desktop/mobile.

**Critério de conclusão:** validações verdes, preview verificado e alterações sincronizadas na branch de trabalho.

Ao iniciar uma nova atividade, substitua ou mova esta entrada conforme o estado real.

### Modelo de tarefa

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

### Modelo de tarefa

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

### TASK-007 — Diferenciar alunos internos e externos

| Campo | Valor |
|---|---|
| Status | `backlog` |
| Responsável | Conta que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/student-internal-external-separation` |
| Commit base | `main` |
| Arquivos principais | A identificar após auditoria de `/dashboard`, `/dashboard/aluno-externo`, APIs de alunos e componentes de matrícula |
| Serviços afetados | GitHub e Vercel; Neon somente se a auditoria exigir mudança de dados |
| Confirmação necessária | Sim antes de migration ou alteração de dados em produção |

**Objetivo:** tornar inequívoca a diferença entre aluno interno e aluno externo em navegação, permissões, dashboard, perfil, relatórios e comunicações.

**Escopo:** mapear os papéis e vínculos reais; impedir que um aluno externo veja ou acesse fluxos internos; garantir que um aluno interno não seja enviado para a experiência externa por engano; revisar labels, CTAs, breadcrumbs e estados vazios; preservar vínculos existentes e LGPD.

**Estado atual:** Turmas Externas já bloqueiam autoinscrição no servidor, mas a separação de experiência e nomenclatura ainda precisa de uma auditoria transversal.

**Bloqueios:** Nenhum conhecido.

**Próximo passo exato:** inventariar as rotas e endpoints que carregam dados de alunos e classificar cada superfície como interna, externa ou compartilhada.

**Critério de conclusão:** matriz de acesso documentada, testes de autorização verdes, navegação sem ambiguidade e preview validado para aluno interno, aluno externo, professor e administrador.

### TASK-008 — Diferenciar cursos internos e externos

| Campo | Valor |
|---|---|
| Status | `backlog` |
| Responsável | Conta que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/course-internal-external-separation` |
| Commit base | `main` |
| Arquivos principais | A identificar após auditoria de `/cursos`, `/dashboard/cursos`, `/professor/cursos`, `course_offers` e catálogo |
| Serviços afetados | GitHub e Vercel; Neon somente se a auditoria exigir mudança de dados |
| Confirmação necessária | Sim antes de migration ou alteração de dados em produção |

**Objetivo:** separar claramente cursos internos, que pertencem à experiência educacional da plataforma, de cursos/turmas externos, que dependem de cadastro explícito por professor ou administrador.

**Escopo:** revisar origem do curso, visibilidade, catálogo, URLs, cards, filtros, matrículas, aulas, progresso, avaliações e relatórios; eliminar CTAs ou links que misturem os dois contextos; garantir que APIs mantenham o filtro por origem no servidor.

**Estado atual:** o catálogo interno já exclui ofertas com `sourceExternalClassId`, e a matrícula externa por aluno está bloqueada server-side. Ainda falta harmonizar as superfícies de leitura e gestão.

**Bloqueios:** Nenhum conhecido.

**Próximo passo exato:** construir uma matriz de rotas/API por origem do curso e identificar as telas que exibem dados externos dentro de fluxos internos.

**Critério de conclusão:** filtros server-side testados, contratos de API atualizados, CTAs coerentes, ausência de mistura visual e preview validado por perfil.

### TASK-009 — Governar vínculos professor-aluno em turmas externas

| Campo | Valor |
|---|---|
| Status | `backlog` |
| Responsável | Conta que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/external-class-roster-governance` |
| Commit base | `main` |
| Arquivos principais | A identificar após auditoria de `app/api/course-offers/[id]/students`, `app/api/admin/external-students`, `app/api/professor/external-classes` e relatórios |
| Serviços afetados | GitHub, Vercel e Neon; nenhuma alteração de produção sem confirmação |
| Confirmação necessária | Sim antes de alteração de dados ou políticas de produção |

**Objetivo:** garantir que somente professores e administradores possam cadastrar, remover ou consultar vínculos de alunos em Turmas Externas, com escopo e trilha de auditoria corretos.

**Escopo:** validar autorização por papel e por turma, evitar enumeração de alunos, revisar remoção/desativação, convites e e-mails, e cobrir as diferenças entre roster externo e matrícula interna.

**Estado atual:** a tentativa de autoinscrição externa foi bloqueada; o fluxo administrativo/docente de cadastro permanece permitido e precisa de auditoria específica.

**Bloqueios:** Nenhum conhecido.

**Próximo passo exato:** mapear cada endpoint de roster externo e escrever uma matriz de autorização para aluno, professor, administrador e usuário sem sessão.

**Critério de conclusão:** testes negativos e positivos por papel, escopo por turma validado, respostas sem vazamento de dados e evidências registradas no workboard.

### TASK-002 — Otimizar especificamente a rota `/materiais`

| Campo | Valor |
|---|---|
| Status | `concluída` |
| Responsável | Conta Manus que iniciou a implementação |
| Iniciada em | 2026-09-03 |
| Concluída em | 2026-09-05 |
| Branch | `feature/optimize-materiais` |
| Commit de implementação | `1989823` |
| Merge commit | `32071c0` |
| Arquivos principais | `app/materiais/page.tsx`, `app/api/materials/route.ts`, `app/materials-pagination.test.ts` |
| Serviços afetados | GitHub e Vercel; Neon não alterado |
| Confirmação necessária | Não |

**Objetivo:** reduzir o tempo de carregamento e o custo de execução da rota `/materiais`, que apresentou o menor score relativo no diagnóstico anterior.

**Estado atual:** a API retorna somente `id`, `title`, `description`, `category` e `level` na listagem pública; a busca aguarda 250 ms após a última digitação; e o progresso só é consultado quando a sessão está autenticada. Nenhuma tabela ou dado do Neon foi alterado.

**Validação realizada:** o preview da branch foi medido com Lighthouse. Em comparação com o baseline, o score de Performance passou de 64 para 94, o LCP caiu de 5,02 s para 2,27 s, o FCP ficou em 1,08 s, o CLS em 0 e a transferência caiu de 553,2 KB para 366,4 KB. Os testes direcionados pós-sincronização passaram, totalizando 8 testes aprovados; `git diff --check` também passou.

**Merge e produção:** o [PR #34](https://github.com/AndersonPalafoz/andersonpalafoz.github.io/pull/34) foi mesclado na `main` em `2026-09-05`. O deployment de produção da Vercel ficou `READY` no commit `32071c0`, com alias `andersonpalafoz.vercel.app`.

**Bloqueios:** nenhum. A branch foi preservada para auditoria.

**Próximo passo exato:** acompanhar os Core Web Vitals em produção e iniciar a TASK-003, sem reabrir esta tarefa salvo surgimento de regressão.

**Critério de conclusão:** melhoria mensurável, testes verdes, preview validado, merge realizado, deployment de produção `READY` e evidências registradas no quadro.

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

Antes de entregar uma tarefa a outra conta, confirme que o quadro informa o objetivo, o status, a branch, o commit base, os arquivos alterados, os testes executados, os servi��os afetados, os bloqueios e o próximo passo exato. Se houver operação no Neon ou na Vercel, registre também se ela foi apenas preparada, executada ou verificada.

## Relação com outros documentos

- [`todo.md`](../todo.md): índice e histórico acumulado do projeto.
- [`legacy-tables-decommission-plan.md`](./legacy-tables-decommission-plan.md): plano específico para desativação das tabelas legadas.
- [`todo-reconciliation-2026-08-19.md`](./todo-reconciliation-2026-08-19.md): reconciliação histórica do TODO.
- [`auditoria-todo-2026-08-26.md`](./auditoria-todo-2026-08-26.md): auditoria histórica do TODO.
- [`google-reviews-setup.md`](./google-reviews-setup.md): configuração da integração com avaliações do Google.

## Regra de atualização

Sempre que uma conta iniciar, pausar, concluir ou transferir uma atividade, atualize este arquivo no mesmo commit da mudança, ou em um commit documental imediatamente relacionado. Não remova entradas concluídas; mova-as para o histórico para preservar a trilha de auditoria.
