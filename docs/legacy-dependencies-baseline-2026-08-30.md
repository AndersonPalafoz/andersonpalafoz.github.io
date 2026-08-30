# Baseline de dependências legadas — Onda 0

**Data da baseline:** 30 de agosto de 2026  
**Tabelas sob desativação:** `external_classes`, `external_students`  
**Objetivo:** impedir remoção prematura e orientar a migração gradual para `course_offers` e `course_offer_students`.

## Estado do banco no início da Onda 0

| Entidade | Estado observado |
|---|---:|
| Turmas ativas em `external_classes` | 2 |
| Alunos ativos em `external_students` | 12 |
| Notas em `external_class_grades` | 18 |
| Frequências em `external_class_attendance` | 2 |
| Materiais em `external_class_materials` | 0 |
| Ofertas ativas ligadas por `sourceExternalClassId` | 2 |
| Matrículas contextuais ligadas por `externalStudentId` | 12 |
| Alunos órfãos detectados na auditoria anterior | 0 |
| Placeholders detectados na auditoria anterior | 0 |

## Dependências de banco

As seguintes foreign keys ainda referenciam diretamente as tabelas legadas:

| Tabela dependente | Coluna | Tabela referenciada | Ação de exclusão |
|---|---|---|---|
| `external_students` | `externalClassId` | `external_classes.id` | `CASCADE` |
| `external_class_grades` | `externalClassId` | `external_classes.id` | `CASCADE` |
| `external_class_grades` | `studentId` | `external_students.id` | `CASCADE` |
| `external_class_attendance` | `externalClassId` | `external_classes.id` | `CASCADE` |
| `external_class_materials` | `externalClassId` | `external_classes.id` | `CASCADE` |
| `external_class_teacher_assignments` | `externalClassId` | `external_classes.id` | `CASCADE` |
| `course_offer_students` | `externalStudentId` | `external_students.id` | `NO ACTION` |
| `course_offers` | `sourceExternalClassId` | `external_classes.id` | `NO ACTION` |

Enquanto essas referências existirem, `DROP TABLE` não é uma operação segura. Em especial, as duas referências `NO ACTION` preservam a rastreabilidade entre ofertas, alunos contextuais e os registros legados.

## Consumidores de runtime classificados

### Dependências de leitura e escrita que ainda precisam de migração

| Área | Dependência atual | Classificação |
|---|---|---|
| `/api/professor/external-classes` | Alunos, notas, frequência e ações de turma | Migrar para `offerId`; manter fallback temporário |
| `/api/admin/external-students/access` | Consulta e associação de acesso de alunos externos | Migrar para matrícula contextual |
| `/api/aluno/portal` | Localização de aluno e turma por e-mail | Migrar para `course_offer_students` |
| `/api/professor/external-student-report` | Relatório baseado em aluno e turma legados | Migrar para oferta e matrícula contextual |
| `/api/admin/trash-count` | Lixeira de turmas externas | Substituir por estado de ofertas arquivadas |
| Dashboards de aluno | Leitura direta de `external_students` e frequência legada | Migrar com fallback controlado |
| `lib/academic-context.ts` | Resolução de `classId` legado | Manter até o fim da compatibilidade |
| `lib/db.ts` | Consultas de turmas externas | Remover após migração das consultas |
| Scripts de auditoria e migração | Reconciliação origem/destino | Manter até a conclusão e arquivamento |

### Dependências estruturais que não devem ser removidas na Onda 0

As tabelas de notas, frequência, materiais, atribuições de professores e as colunas `sourceExternalClassId` e `externalStudentId` são necessárias para reconciliação. Elas devem permanecer até que os dados sejam validados no modelo contextual e exista um mapa histórico de IDs.

## Contratos temporários da transição

Durante a transição, `offerId` é o identificador primário. `classId` somente pode ser aceito como compatibilidade e deve ser resolvido pelo `AcademicContext`. Se `offerId` e `classId` forem enviados simultaneamente e forem conflitantes, a requisição deve retornar `400` ou `409` sem acessar dados acadêmicos.

Toda mutação deve validar no servidor a cadeia `recurso → oferta → atribuição do professor`. O frontend não pode escolher o curso, aluno ou oferta apenas com base em IDs recebidos do cliente.

## Critérios de saída da Onda 0

A Onda 0 será considerada concluída quando:

1. o inventário de referências estiver versionado junto ao repositório;
2. cada consumidor estiver classificado como migrado, compatível temporariamente ou pendente;
3. existir uma auditoria automatizada de foreign keys, órfãos, placeholders, duplicidades e divergências;
4. houver métricas de fallback e de escrita legada;
5. estiver definido o conjunto mínimo de testes de bloqueio para qualquer tentativa de remoção;
6. houver backup restaurável e registro do último estado conhecido do banco.

## Bloqueios para remoção física

A remoção de qualquer uma das tabelas deve ser bloqueada se houver pelo menos uma destas condições:

- uma referência de runtime fora do adaptador de compatibilidade;
- uma escrita legada nas últimas semanas;
- uma leitura de fallback não explicada;
- notas, frequência, materiais ou atribuições sem correspondência contextual;
- foreign key ativa para a tabela;
- backup não restaurado em ambiente isolado;
- falha na reconciliação de valores decimais ou da fórmula SIMAL;
- ausência de plano de rollback aprovado.

## Próxima etapa

A próxima implementação deve criar os guardas automatizados e a auditoria diária. Em seguida, deve migrar as 18 notas legadas para o modelo contextual, validar as duas frequências e registrar métricas de dual-read antes de congelar as escritas legadas.
