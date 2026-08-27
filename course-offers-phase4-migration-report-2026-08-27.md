# Relatório da Fase 4 — Migração de dados para ofertas e coortes

**Data:** 27 de agosto de 2026  
**Status:** script implementado e validado sem gravação em banco.

## Entrega

Foi criado `scripts/migrate-external-classes-to-offers.mts` e o comando `pnpm migrate:external-classes`. O migrador opera em modo de prévia por padrão e somente grava quando recebe `--apply`. Também aceita `--class-id=<id>` para limitar a execução a uma turma legada específica.

## Regras de transformação

| Origem legada | Destino | Regra |
|---|---|---|
| `external_classes` | `courses` | Reutiliza curso ativo por título; cria curso somente quando não encontra correspondência |
| `external_classes` | `course_offers` | Cria uma oferta por turma, período e nome, com vínculo `sourceExternalClassId` |
| `external_students` | `course_offer_students` | Mantém vínculo com usuário e/ou aluno externo, nome, e-mail, matrícula, status e anotações |
| `external_class_attendance` | `course_offer_attendance` | Mantém data e remapeia as chaves do mapa para os IDs contextuais dos novos alunos |
| `external_class_teacher_assignments` | `course_offer_teacher_assignments` | Copia professores delegados dentro da mesma transação |

Ofertas já vinculadas pela origem externa são classificadas como `already-migrated` e não são duplicadas. A política `simal` é inferida somente para instituições cujo nome normalizado contém SIMAL; as notas não são recalculadas nem alteradas nesta fase.

## Segurança operacional

O script não executa nada por padrão além de leitura e emissão de decisões JSON. A execução com `--apply` usa uma transação por turma. A migration não exclui, atualiza nem converte registros legados. Inserções repetidas usam conflitos idempotentes para alunos, professores e chamadas. Falhas de JSON em chamada interrompem a transação da turma para evitar perda silenciosa de dados.

O remapeamento de frequência é necessário porque os IDs de `externalStudents` não são iguais aos IDs de `courseOfferStudents`. Chaves de alunos legados que não possuam matrícula criada são ignoradas no novo mapa e permanecem preservadas no registro legado original.

## Validação

A verificação TypeScript passou sem erros. Os testes do migrador e do schema passaram com **2 arquivos e 9 testes**. O comando foi registrado no `package.json`. Não foi executado `--apply` e nenhuma linha foi inserida, atualizada ou excluída no banco.

A prévia real depende de uma DSN de banco, que não está disponível nesta sessão. Antes da primeira execução aplicada, deve-se realizar backup/snapshot, executar `pnpm migrate:external-classes` em staging, revisar conflitos e contagens, e somente então usar `pnpm migrate:external-classes -- --apply` para um recorte aprovado.

## Limitações conhecidas

A correspondência de cursos usa título exato sem distinção de maiúsculas/minúsculas; quando houver títulos ambíguos, o relatório deverá ser revisado antes da aplicação. Notas e materiais ainda não foram copiados nesta fase, pois exigem modelos de destino adicionais e regras de paridade. A execução concorrente de duas instâncias deve ser evitada até que um lock de migração seja adicionado.

## Próxima fase

A próxima fase deve criar uma prévia administrativa, exportar o relatório de conflitos, incluir notas e materiais com mapeamento de IDs e adicionar testes de integração em banco de staging. A aplicação em produção deve continuar sendo um passo manual e auditado.
