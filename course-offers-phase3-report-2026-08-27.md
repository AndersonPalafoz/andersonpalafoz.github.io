# Relatório da Fase 3 — Serviços, autorização e endpoints de ofertas

**Data:** 27 de agosto de 2026  
**Status:** implementação local concluída e validada por TypeScript e testes de contrato; ainda não publicada nem exercitada contra banco de produção.

## Entrega realizada

Foi criada uma camada de serviço em `lib/course-offer-service.ts` para listar ofertas por escopo, consultar oferta individual, criar, atualizar, arquivar logicamente e restaurar ofertas. A listagem de professores considera proprietário e atribuições delegadas; administradores podem consultar ofertas arquivadas quando solicitado.

A autorização foi centralizada em `lib/admin-auth.ts` com `canManageCourseOffer` e `canReadCourseOffer`. Administradores globais têm escopo global; professores precisam ser proprietários ou delegados; alunos somente serão autorizados pela matrícula contextual quando o endpoint específico de leitura do aluno for integrado na próxima etapa.

## Endpoints

| Rota | Métodos | Comportamento |
|---|---|---|
| `/api/course-offers` | `GET`, `POST` | Lista ofertas por escopo e cria ofertas vinculadas a curso e professor proprietário |
| `/api/course-offers/[id]` | `GET`, `PATCH`, `DELETE`, `POST` | Consulta, atualiza, arquiva logicamente e restaura oferta com validação de papel |
| `/api/course-offers/[id]/teachers` | `GET`, `POST`, `DELETE` | Lista, atribui e remove professores delegados; alterações restritas a administradores |
| `/api/course-offers/[id]/students` | `GET`, `POST`, `PATCH`, `DELETE` | Lista, matricula, atualiza e remove alunos no escopo da oferta |

As matrículas podem apontar para um usuário interno, para um aluno externo legado ou para ambos. O endpoint valida a existência das identidades vinculadas, impede matrícula duplicada por oferta e exige um nome quando a identidade vinculada não fornece nome utilizável.

## Segurança e compatibilidade

Professores não conseguem criar uma oferta em nome de outro professor. A alteração de uma oferta não permite substituir `courseId`, proprietário, origem externa, identificador ou data de exclusão pelo corpo enviado. A exclusão é soft delete, e a restauração é limitada a administradores.

A atribuição docente verifica se o usuário-alvo possui papel de professor e usa `onConflictDoNothing` para produzir resposta de conflito em atribuições repetidas. A origem externa é apenas uma referência opcional; nenhum registro de `externalClasses`, `externalStudents`, notas ou frequência é convertido ou alterado.

## Validação

A verificação TypeScript passou sem erros. Os contratos da nova API, o modelo de schema e o contrato acadêmico passaram com **3 arquivos e 13 testes**. A migration `0079_course_offers_and_cohorts.sql` permanece a base de persistência criada na Fase 2.

Não foi executada operação contra o banco, pois a conexão de banco não está disponível nesta sessão. Também não foi feito deployment desta fase. A validação de integração com dados reais ficará para a fase de migração/integração, após uma revisão dos nomes de relações Drizzle e da estratégia de leitura para alunos matriculados.

## Próxima fase

A próxima etapa deve integrar as ofertas à interface administrativa e docente, criar a leitura do aluno por matrícula contextual e adicionar testes de integração com banco de staging. Antes de habilitar produção, deve-se validar transação de criação de oferta mais matrícula inicial, idempotência de atribuições e concorrência em arquivamento/restauração.
