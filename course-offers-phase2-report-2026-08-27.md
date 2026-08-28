# Relatório da Fase 2 — Ofertas e Coortes

**Data:** 27 de agosto de 2026
**Commit:** `0b7b2c6`
**Status:** modelos e migration criados e validados; migration ainda não aplicada ao banco.

## Entrega

Foi criada a camada de persistência para ofertas/coortes de cursos internos, mantendo `courses` como entidade de conteúdo e adicionando um contexto operacional separado para agenda, regras acadêmicas, professores, matrículas e frequência.

| Modelo | Tabela | Finalidade |
|---|---|---|
| `courseOffers` | `course_offers` | Oferta/coorte vinculada a um curso interno, com período, instituição, agenda, política acadêmica, fechamento e ciclo de vida |
| `courseOfferTeacherAssignments` | `course_offer_teacher_assignments` | Professores proprietários/delegados por oferta, com responsável pela atribuição e unicidade por oferta/professor |
| `courseOfferStudents` | `course_offer_students` | Matrícula contextual, com vínculo opcional a usuário interno ou aluno externo legado |
| `courseOfferAttendance` | `course_offer_attendance` | Chamada por data com atualização idempotente por oferta e data |

## Compatibilidade

A oferta possui `sourceExternalClassId` opcional para permitir correspondência controlada com uma turma externa existente. O vínculo não migra nem altera registros antigos automaticamente. Os dados externos permanecem nas tabelas legadas e podem ser associados somente por fluxo futuro explícito e reversível.

A política acadêmica é declarada por `gradingPolicy`, com suporte planejado para `standard`, `unit` e `simal`. Os campos de unidades, média mínima, limite de faltas e fechamento foram modelados para permitir que cada oferta habilite somente as capacidades necessárias. A fórmula SIMAL continua separada do modelo e permanece prova escrita até 8,0 mais apresentação até 2,0.

## Integridade e índices

A migration cria chaves estrangeiras para cursos, usuários, alunos externos e ofertas. Há unicidade por curso/período/nome da oferta, oferta/professor, oferta/usuário, oferta/aluno externo e oferta/data de chamada. Como índices únicos em PostgreSQL permitem múltiplos valores nulos, a matrícula sem usuário ou sem aluno externo deverá ser validada na camada de serviço para garantir que pelo menos uma identidade esteja presente.

## Migration

Foi gerado `drizzle/migrations/0079_course_offers_and_cohorts.sql`, acompanhado de `meta/0079_snapshot.json` e atualizado o journal Drizzle. O SQL foi revisado manualmente porque o journal histórico não registra todas as migrations legadas 0073–0078. O arquivo final contém somente criação das novas tabelas, constraints e índices; não contém `DROP`, `DELETE`, `TRUNCATE` nem alterações destrutivas nas tabelas externas existentes.

A migration não foi aplicada automaticamente ao banco, pois a conexão de banco não está disponível nesta sessão e a aplicação exige uma janela controlada. Antes da aplicação, recomenda-se executar backup/snapshot, verificar a presença das tabelas legadas e aplicar em staging. Depois, deve-se conferir constraints e índices antes da produção.

## Validação realizada

A verificação TypeScript passou sem erros. `drizzle-kit check` passou com a leitura de 57 tabelas. Os testes de schema, cálculo acadêmico, curso e SIMAL passaram com **4 arquivos e 19 testes**. A migration foi verificada por inspeção de segurança para garantir que não há operação destrutiva nem alteração automática de dados legados.

## Próxima fase

A Fase 3 deve criar serviços e endpoints para CRUD de ofertas, atribuição de professores, matrícula contextual e leitura por escopo. Esses endpoints devem usar autorização centralizada e ainda não devem migrar dados externos em massa. A migração de correspondências deve ocorrer somente após uma prévia de conflitos e aprovação operacional.

## Referências

[1]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/drizzle/schema.ts
[2]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/drizzle/migrations/0079_course_offers_and_cohorts.sql
[3]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io/blob/main/lib/course-offers-schema.test.ts
