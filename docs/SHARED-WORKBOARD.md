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

### TASK-001 — Auditar e otimizar o desempenho do site

| Campo | Valor |
|---|---|
| Status | `backlog` |
| Responsável | Conta Manus que assumir a tarefa |
| Iniciada em | — |
| Branch | `feature/performance-optimization` |
| Commit base | `c746fd4` |
| Arquivos principais | A identificar após o diagnóstico; priorizar `app/`, `components/`, `next.config.ts` e assets públicos |
| Serviços afetados | GitHub e Vercel; Neon somente se o diagnóstico apontar consultas lentas |
| Confirmação necessária | Não para auditoria; sim antes de alterar produção, cache, banco ou infraestrutura |

**Objetivo:** medir e melhorar o desempenho das páginas públicas e das áreas de maior uso, reduzindo tempo de carregamento e custo de execução sem comprometer acessibilidade, SEO, responsividade ou funcionalidades existentes.

**Escopo inicial:** estabelecer uma linha de base com Lighthouse/PageSpeed e métricas Core Web Vitals (LCP, INP e CLS); identificar bundles, imagens, fontes, chamadas de API e consultas de banco com maior impacto; corrigir as maiores oportunidades; e comparar os resultados antes e depois nas rotas públicas prioritárias e nas páginas acadêmicas mais acessadas.

**Estado atual:** tarefa criada no quadro. Nenhum diagnóstico ou alteração de desempenho foi executado nesta atividade.

**Bloqueios:** não há bloqueio conhecido. As credenciais e os ambientes de produção não devem ser alterados durante a fase de diagnóstico.

**Próximo passo exato:** executar um diagnóstico somente leitura das rotas `/`, `/sobre`, `/cursos`, `/materiais`, `/blog`, `/contato` e `/depoimentos`, registrar as métricas de referência e anexar os principais gargalos ao quadro.

**Critério de conclusão:** apresentar comparação antes/depois das métricas de desempenho, registrar os arquivos e configurações alterados, passar nos testes e no build, confirmar o deployment da Vercel e documentar qualquer impacto residual.

- [ ] Registrar alterações de produção que não estejam representadas por migration ou commit.

## Bloqueadas

Nenhuma tarefa bloqueada registrada.

## Aguardando confirmação

Nenhuma tarefa aguardando confirmação registrada.

## Concluídas recentemente

| Data | Tarefa | Evidência |
|---|---|---|
| 2026-09-02 | Criação do quadro compartilhado e transformação do `todo.md` em índice | Commit a ser registrado após a publicação |

## Decisões compartilhadas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-09-02 | `todo.md` será o índice e histórico; este arquivo será o quadro operacional | Separar histórico extenso de estado atual e facilitar handoff |
| 2026-09-02 | `main` é a branch de publicação; tarefas maiores devem usar branch própria | Reduzir conflitos e manter rastreabilidade |
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
