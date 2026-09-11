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
| Status | `em andamento` — correções incrementais de lint entregues e deploy automático confirmado; integração Neon permanece pendente |
| Responsável | Conta Manus atual, em continuidade da auditoria e da correção incremental de lint |
| Iniciada em | 2026-09-04 |
| Branch | `main` — sincronizada no GitHub em `bd99886` |
| Commit base | `62221f4`; estado entregue em `bd99886` — Sync current platform state to main |
| Arquivos principais | `drizzle/schema.ts`, `lib/academic-context.ts`, `lib/admin-auth.ts`, `lib/google-classroom-api.ts`, `app/api/classroom/`, `app/api/cron/classroom-sync/`, `app/api/health/`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub e Vercel confirmados; Neon permanece sem alteração de produção |
| Confirmação necessária | Sim antes de promover o `app_runtime` ou alterar a branch Neon de produção |

**Objetivo:** confirmar que o modelo de turmas internas, a sincronização Google Classroom, as migrations e o role PostgreSQL restrito permanecem seguros e funcionais na `main` atual.

**Estado atual:** o TypeScript e o build passam quando uma `DATABASE_URL` válida é fornecida; a deployment de produção do Vercel para `62221f4` está `READY`; a auditoria diária de ofertas está verde; o `app_runtime` e a migration de `offerId`/unicidade foram validados anteriormente em branch Neon de teste. O modelo usa `course_offers` como turma, `enrollments` como matrícula e `class_sessions.offerId` como vínculo explícito. Como não foi localizado um commit corretivo do v0, foi iniciado um lote local seguro: três componentes tiveram o carregamento assíncrono refatorado sem alteração funcional, reduzindo os erros `react-hooks/set-state-in-effect` de 58 para 55. Os arquivos corrigidos são `components/saved-materials-section.tsx`, `app/dashboard/notificacoes/page.tsx` e `components/teacher-zip-history.tsx`. Neste segundo lote, os carregamentos remotos de `components/material-comments-section.tsx` e `components/professor-summary-dashboard.tsx` passaram a usar dependências estáveis, cancelamento por `AbortController` e agendamento fora do corpo síncrono do efeito; o total global caiu de 55 para 53. No terceiro lote, os carregamentos remotos de `components/media-player.tsx`, `components/profile-medals-gallery.tsx` e `components/weekly-progress-chart.tsx` receberam o mesmo tratamento, reduzindo o total global para 50. A execução completa mais recente do ESLint registrou 68 erros e 41 avisos, incluindo 50 ocorrências de `react-hooks/set-state-in-effect` antes deste lote. Em seguida, os efeitos de rede de `app/admin/relatorios/page.tsx` e `app/dashboard/metas-semanais.tsx` foram refatorados com AbortController e agendamento seguro; a contagem de `react-hooks/set-state-in-effect` caiu para 48 e o total passou a 66 erros e 41 avisos. No lote seguinte, os carregamentos de `app/admin/reviews/page.tsx` e `app/admin/relatorios-academicos/page.tsx` foram refatorados com AbortController, dependências estáveis e agendamento seguro; o lint global passou a registrar 64 erros, 40 avisos e 46 ocorrências de `react-hooks/set-state-in-effect`. Na etapa seguinte, `app/admin/usuarios/page.tsx` teve o carregamento de usuários refatorado com cancelamento seguro, a lista derivada de professores foi convertida para `useMemo` e um efeito síncrono de paginação foi removido; reviews e relatórios acadêmicos receberam skeletons responsivos e toasts amigáveis para falhas de rede. O lint global passou a registrar 62 erros, 40 avisos e 44 ocorrências de `react-hooks/set-state-in-effect`. No lote seguinte, os carregamentos de `app/dashboard/calendario/page.tsx` e `app/dashboard/compras/page.tsx` foram refatorados com AbortController, agendamento seguro e toasts de erro preservados; o lint global passou a registrar 60 erros, 40 avisos e 42 ocorrências de `react-hooks/set-state-in-effect`. A validação móvel das rotas protegidas em 320px, 375px e 414px redirecionou ao login por ausência de sessão autenticada; o fluxo de login não apresentou overflow. O carregamento de `app/professor/alunos/page.tsx` foi então refatorado com cancelamento seguro e toast de erro, reduzindo o lint global para 59 erros, 40 avisos e 41 ocorrências de `react-hooks/set-state-in-effect`. O estado foi salvo no checkpoint `5f4ee9be`; a validação móvel também cobriu 320px, 375px e 414px, sem overflow no fluxo de login. As rotas protegidas redirecionaram corretamente sem sessão autenticada, portanto a verificação interna de skeletons e toasts ainda aguarda uma sessão administrativa real. No lote seguinte, o carregamento do resumo acadêmico em `components/internal-class-detail.tsx` e das submissões em `app/professor/speaking/page.tsx` recebeu cancelamento por `AbortController`, reduzindo o lint global para 57 erros, 40 avisos e 39 ocorrências de `react-hooks/set-state-in-effect`. Neste lote, o polling de `client/src/components/realtime-notifications.tsx` passou a usar `AbortController`, timer inicial controlado e limpeza do intervalo, reduzindo o lint global para 56 erros, 40 avisos e 38 ocorrências de `react-hooks/set-state-in-effect`. Na rodada seguinte, os efeitos de carregamento de `app/pagamento/recibo/[id]/page.tsx` e `app/pagamento/sucesso/page.tsx` passaram a iniciar a rede após um timer controlado, com cancelamento e limpeza no desmontagem; o lint global caiu para 54 erros, 40 avisos e 36 ocorrências da regra. Os dois arquivos passaram no lint específico, os 6 testes focados, TypeScript e build de produção passaram. Nesta rodada, `app/dashboard/dashboard-shell.tsx` teve os estados de tour/avatar adiados e protegidos contra desmontagem, reduzindo o lint para 52 erros, 40 avisos e 34 ocorrências. `next.config.ts` passou a declarar `images.qualities: [70, 75, 85]`, eliminando o aviso de qualidade 85 no build. A integração Stripe foi verificada em modo read-only/test mode via endpoint de balance, sem criação de transações. Nesta rodada, `app/professor/progresso-aulas/page.tsx` e `app/professor/tarefas/page.tsx` tiveram os carregadores estabilizados com `useCallback` e efeitos agendados com limpeza de timers; a sincronização do curso selecionado nas tarefas também passou a ser agendada. O lint global caiu de 52 para 49 erros, de 40 para 38 avisos e de 34 para 31 ocorrências de `react-hooks/set-state-in-effect`. Em seguida, a página de tarefas recebeu exportação CSV e PDF baseada nas tarefas visíveis após os filtros atuais, com nomes de arquivo que identificam a oferta ou turma, CSV UTF-8 com BOM e delimitador compatível com planilhas brasileiras, estado de geração do PDF e toasts de sucesso/erro. Foi criado `lib/task-export.ts` com testes unitários.

**Bloqueios:** o CI já foi ajustado para separar testes unitários e integração Neon, mas a execução de integração continua condicionada à existência de um secret de banco. O lint ainda falha; o primeiro levantamento encontrou 58 ocorrências de `react-hooks/set-state-in-effect` e o lote inicial reduziu esse número para 55. Permanecem também os demais erros e avisos já registrados, além da necessidade de confirmar que a branch Neon de produção contém todas as migrations usadas pela `main` antes de promover o role restrito. A correção deve continuar em lotes pequenos, pois vários casos envolvem estado derivado, hidratação ou efeitos com chamadas de rede.

**Validação realizada:** o dashboard shell passou sem novos erros de hook; o build não apresentou o aviso de qualidade de imagem 85; a API Stripe respondeu em test mode sem erro de autenticação e sem transação criada; os 6 testes focados, TypeScript e build de produção passaram. O lint global agora reporta 49 erros, 38 avisos e 31 ocorrências de `react-hooks/set-state-in-effect`. Nesta rodada, lint específico, TypeScript, 233 arquivos de teste com 742 testes e build de produção passaram. A exportação passou em 2 testes unitários focados; a prévia sem sessão redirecionou `/professor/tarefas` corretamente para login em 375px, sem permitir validação autenticada dos botões. Em seguida, o cabeçalho mobile compartilhado de `app/dashboard/dashboard-shell.tsx` recebeu um botão persistente para `/`, com ícone Home, rótulo acessível e foco visível; como dashboard, professor e admin reutilizam esse shell, a correção cobre as três áreas e suas subpáginas. O rodapé do menu lateral também recebeu o atalho textual **Ver site**, acima de Sair, fechando o menu após a navegação. Nesta rodada, o contêiner raiz do shell passou a usar `md:h-[100dvh]` com `md:overflow-hidden`, enquanto a barra lateral mantém `h-[100dvh]` e recebeu acabamento desktop com borda arredondada à direita e sombra mais controlada. Assim, o painel lateral ocupa toda a altura da janela e o conteúdo continua rolando na área principal. O teste de navegação unificada passou com 11 testes; lint específico, TypeScript e build de produção passaram. A captura desktop sem sessão redirecionou `/dashboard` para login, portanto a interação autenticada permanece pendente. No novo lote de linting, `app/materiais/page.tsx` teve o carregamento de progresso protegido por timer e `AbortController`, e `client/src/components/student-dashboard-onboarding.tsx` teve a abertura inicial do tour agendada com limpeza no desmontagem. A contagem global caiu de 49 para 47 erros, de 38 para 38 avisos e de 31 para 29 ocorrências de `react-hooks/set-state-in-effect`. Os 234 arquivos de teste, 746 testes, TypeScript e build de produção passaram. Os demais erros continuam pendentes e não foram mascarados. Nesta rodada, o `components/certificate-standard-manager.tsx` recebeu cancelamento por `AbortController` no carregamento inicial, sincronizações agendadas para dados derivados e paginação, além de uma faixa de progresso animada durante geração oficial ou exportação em lote. O teste de fluxo administrativo foi ampliado para verificar os estados de carregamento. O lint global caiu de 47 para 41 erros e de 29 para 23 ocorrências de `react-hooks/set-state-in-effect`, mantendo 38 avisos. Lint específico, TypeScript, 234 arquivos de teste, build de produção e validações desktop/mobile passaram. Sem sessão autenticada disponível, as rotas protegidas redirecionaram para `/login`; não foi possível clicar nos controles internos nem validar os dados reais da área autenticada. Nesta rodada, os protótipos `certificate-fabric-prototype.tsx`, `certificate-grapes-prototype.tsx` e `certificate-konva-prototype.tsx` tiveram sincronizações de composição e dados de amostra agendadas com limpeza dos timers. A contagem global caiu de 41 para 37 erros e de 23 para 19 ocorrências de `react-hooks/set-state-in-effect`, mantendo 38 avisos. Lint específico, TypeScript, suíte completa de testes e build de produção passaram. Na rodada de navegação, o drawer mobile compartilhado recebeu a seção **Menu principal do site**, com acesso explícito às páginas públicas sem sair do painel. O teste de navegação unificada passou com 12 testes; lint específico, TypeScript e build passaram. A validação visual sem sessão redirecionou as rotas protegidas para `/login`, portanto a abertura autenticada do drawer permanece para confirmação manual.

**Próximo passo exato:** corrigir o próximo lote de ocorrências de `react-hooks/set-state-in-effect`, priorizando `certificate-signature-manager.tsx` e `certificate-template-manager.tsx` com atenção aos fluxos de assinatura e edição. Manter lint, testes, TypeScript e build como gates; não alterar o Neon até existir uma `DATABASE_URL` válida. A navegação mobile do dashboard agora também inclui a seção **Menu principal do site**, com links para Início, Sobre, Cursos, Materiais, Blog e Contato; cada link fecha o drawer ao navegar.

**Critério de conclusão:** CI e lint verdes, migrations comparadas e aplicadas em staging, Preview validado com `app_runtime`, fluxos de turma interna/Classroom testados e evidências registradas no quadro.

## Atualização de sincronização e deploy — 09/09/2026

| Item | Status confirmado |
|---|---|
| GitHub | A branch `main` recebeu o commit `bd99886ccc6c647e79cecb8188b5eb10e7babfdc`; o push foi concluído após remover somente caches de build `.next-build` que excediam o limite de tamanho do GitHub. |
| Vercel | O projeto `andersonpalafoz` detectou automaticamente o push na `main`; o deployment de produção `dpl_G89hKfpVbfRP3obXhENN3v5MmP3W` foi criado para o commit `bd99886` e terminou com estado `READY`. |
| Domínio para teste | [andersonpalafoz.vercel.app](https://andersonpalafoz.vercel.app) está disponível para validação no celular. |
| Pendências | Validar o drawer autenticado no dispositivo móvel e continuar a correção dos hooks restantes. |

## Force push seguro e estado atual — 09/09/2026

| Item | Status confirmado |
|---|---|
| Backup remoto | Criada a branch `backup/main-before-force-20260909`, preservando a main anterior em `bd99886`. |
| Main do GitHub | Atualizada com `force-with-lease` para `4af117e478740da35cd8bd70a5e6f404d560cbd4`; a operação só prosseguiu porque a main permanecia no SHA esperado. |
| Conteúdo sincronizado | Snapshot local enviado sem `.next`, `.next-build` e `node_modules`, evitando os arquivos de cache acima do limite do GitHub. |
| Vercel | Deploy automático acionado pela `main`: `dpl_7fRkCgwkdcPiLXWm7o3q3Pe77NnH`, produção, estado `READY`. |
| Próximo passo | Testar o menu principal do site no drawer autenticado usando o domínio de produção. |

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

### Nota de design — azul cerúleo
A expansão gradual do azul nas áreas públicas e autenticadas foi revertida a pedido do usuário. A paleta original foi restaurada em todas as áreas; permanece somente a linha azul fina antes do rodapé, explicitamente aprovada. Nenhum dado, rota ou regra de negócio foi alterado.

### TASK-006 — Completar fluxo e gestão de Turmas Internas
| Campo | Valor |
|---|---|
| Status | `em validação` |
| Responsável | Conta Manus atual, em continuidade da implementação iniciada |
| Iniciada em | 2026-09-05 |
| Branch | `main` |
| Commit base | `cd8a123c` — checkpoint mais recente reconciliado com `user_github/main` |
| Arquivos principais | `app/professor/turmas-internas/`, `app/dashboard/turmas-internas/`, `components/internal-classes-workspace.tsx`, `components/student-internal-classes.tsx`, `app/api/course-offers/`, `lib/course-offer-service.ts`, `docs/SHARED-WORKBOARD.md` |
| Serviços afetados | GitHub e Vercel; Neon somente após validação explícita de consultas ou migrations |
| Confirmação necessária | Não para diagnóstico e implementação local; sim antes de alterar dados, permissões ou produção |

**Objetivo:** transformar a auditoria das Turmas Internas em um fluxo único e completo de criação e gestão de ofertas, sem alterar dados ou permissões antes da validação.

**Escopo inicial:** corrigir o botão **Nova turma** para levar ao fluxo correto de criação de oferta; completar o detalhe com abas responsivas de Visão geral, Alunos, Sessões, Presença, Atividades e Progresso; calcular o progresso real do aluno a partir dos registros existentes; reorganizar filtros e ações para telas de 320–375 px; separar visualmente ações de professor, administrador e superadministrador; e reduzir consultas sequenciais no dashboard do aluno.

**Estado atual:** o checkpoint `cd8a123c` consolidou na `main` o fluxo de Turmas Internas com criação explícita de ofertas, detalhe responsivo, abas de Visão geral, Alunos, Sessões, Presença, Atividades e Progresso, separação de turmas externas, cálculo real do progresso do aluno e ações protegidas de edição, arquivamento e desvinculação. O resumo acadêmico protegido carrega sessões, presenças, atividades e métricas reais por oferta. A aba Sessões exibe data, horário, duração, descrição, status e registros associados; a aba Presença exibe contagens por status e registros editáveis por aluno e sessão. O dashboard do aluno mostra a evidência de aulas e atividades e celebra aumentos reais de progresso com animação acessível e suporte a movimento reduzido. O checkpoint foi reconciliado com `user_github/main` sem apagar dados acadêmicos.

**Validação realizada:** os testes focados do pacote passaram com 6 testes; TypeScript, `git diff --check` e build de produção passaram; a prévia foi reiniciada sem erros de LSP; e a verificação móvel em 375px confirmou o comportamento seguro de redirecionamento para login quando não há sessão autenticada.

**Bloqueios:** ainda falta exercitar criação, sessões, presença, edição e arquivamento com uma sessão real de professor/admin em desktop e mobile. Sem credenciais/sessão no preview, não há evidência de validação autenticada nem de deployment de produção. Não promover alterações ao Neon nem modificar permissões sem registrar evidências e confirmação.

**Próximo passo exato:** validar os fluxos de presença e atividades com uma sessão autorizada em desktop e mobile. A aba Presença lista os registros por aluno e sessão, permite alterar entre presente/ausente/justificada e excluir com confirmação, usando `attendanceId + sessionId + offerId`; a aba Atividades permite editar título, descrição e prazo, além de excluir com confirmação, sempre atualizando o resumo acadêmico sem reload. Foram adicionados testes de contrato cobrindo autorização/escopo e controles de mutação: 4 testes passaram, além dos testes de ofertas (9 testes). Neste ciclo, a `main` remota foi reconciliada sem apagar dados; o polling de notificações recebeu cancelamento seguro e a contagem global ficou em 56 erros, 40 avisos e 38 ocorrências de `react-hooks/set-state-in-effect`. TypeScript, `git diff --check` e build passaram. Sem sessão, o navegador confirmou corretamente o redirecionamento para login em 384×591. A migration já foi aplicada no Neon principal e o próximo checkpoint deve validar este estado em uma sessão autorizada.

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
| Status | `em validação externa` |
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

**Próximo passo exato:** executar a série Lighthouse no GitHub Actions/CI, onde o Chrome está disponível, e anexar o JSON gerado como artefato; não alterar o script nem instalar navegador no projeto nesta retomada. A tentativa de dispatch manual em 2026-09-09 foi recusada pela integração GitHub com HTTP 403 (`Resource not accessible by integration`), portanto a execução depende de permissões de workflow ou do agendamento diário. A validação não deve iniciar a TASK-005.

**Dados reais:** a consulta de Web Analytics do projeto Vercel entre 2026-08-28 e 2026-09-04 retornou 0 visitantes e 0 pageviews. Portanto, o Speed Insights está integrado no código, mas ainda não existe amostra real suficiente para avaliar tendência de campo; isso deve ser reavaliado após tráfego de usuários.

**Bloqueios:** nenhum bloqueio de implementação. A medição local está limitada pela ausência de Chrome/Chromium no sandbox; a validação externa depende da execução do workflow no GitHub Actions. A validação de campo também permanece pendente por ausência de tráfego real no período consultado.

**Próximo passo exato:** aguardar a execução diária do workflow ou corrigir a permissão de dispatch da integração GitHub, baixar o primeiro artefato `core-web-vitals-<run_number>` e revisar junto com os dados de Speed Insights após haver tráfego real.

**Critério de conclusão:** workflow publicado e executado com artefato válido, limites definidos, dados de campo disponíveis em volume suficiente e documentação de resposta a regressões confirmada.

### TASK-004 — Repetir e consolidar as medições de desempenho

| Campo | Valor |
|---|---|
| Status | `em validação externa` |
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
