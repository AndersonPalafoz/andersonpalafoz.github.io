# Arquitetura de expansão — Cursos Externos para Cursos Internos

**Fase:** 2 — arquitetura, modelo de dados e matriz de compatibilidade  
**Data:** 27 de agosto de 2026

## Decisão arquitetural

O curso interno continuará sendo a entidade de **conteúdo e identidade**. Será criada uma entidade operacional de **oferta/coorte**, responsável por período, instituição, professor, agenda, matrícula contextual, frequência, avaliações, fechamento, relatórios e regras acadêmicas. O módulo externo será compatibilizado por adaptação progressiva, sem conversão destrutiva imediata.

A oferta poderá apontar para um curso interno por `courseId`. Registros externos existentes continuarão em suas tabelas atuais durante o rollout e receberão vínculo opcional com o curso interno apenas quando houver correspondência confirmada. Em uma etapa posterior, novas operações poderão usar a camada comum de oferta, enquanto os endpoints legados continuarão atendendo dados antigos.

## Modelo proposto

| Entidade | Papel | Relações principais | Observações |
|---|---|---|---|
| `courses` | Conteúdo e identidade do curso | módulos, aulas, materiais, atividades, certificados | Não recebe dados de uma turma específica além dos campos já existentes legados |
| `courseOffers` | Oferta/coorte/turma operacional | `courseId`, professor proprietário, instituição | Reúne agenda, período, modalidade, regras de ausência, média e status |
| `courseOfferTeachers` | Professores proprietários/delegados | oferta + usuário | Substitui duplicação de regra de atribuição e mantém auditoria |
| `courseOfferStudents` | Matrícula contextual | oferta + usuário/aluno externo | Permite aluno com ou sem conta e preserva identificador institucional |
| `courseOfferAttendance` | Chamada por data | oferta + data + mapa/linhas de presença | Mantém `present`, `absent`, `late`, `excused` |
| `courseOfferGrades` | Avaliações e componentes | oferta + aluno + avaliação | Permite nota decimal, versão, componente, feedback e auditoria |
| `courseOfferMaterials` | Materiais específicos da oferta | oferta + material interno/URL externo | Permite reutilizar `materials` sem perder links específicos |
| `courseOfferReports` | Opcional, somente se houver necessidade de snapshot | oferta + execução | Preferir cálculo sob demanda antes de criar snapshots |

## Compatibilidade e migração

A primeira migração deve adicionar tabelas novas e colunas opcionais de vínculo, sem renomear ou remover tabelas externas. Os dados externos serão lidos por adaptadores que expõem um contrato comum de oferta. Uma tabela de correspondência ou colunas `courseId`/`offerId` somente serão preenchidas por ações explícitas e idempotentes de administração.

A compatibilidade SIMAL é uma política de cálculo, não um comportamento implícito do curso. Ofertas SIMAL terão `gradingPolicy = "simal"` e preservarão prova escrita até 8,0 mais apresentação até 2,0. Ofertas internas comuns usarão `gradingPolicy = "standard"` ou política configurável equivalente.

## Autorização

A decisão de escopo deverá ser centralizada em um helper comum que receba usuário, oferta e operação. Administradores globais terão leitura e administração globais; o professor proprietário e professores delegados terão operação apenas nas ofertas atribuídas; alunos terão leitura somente de suas matrículas, progresso, notas, frequência e materiais permitidos. O vínculo de usuário nunca será inferido apenas por e-mail sem confirmação de identidade.

## Matriz de comportamento

| Funcionalidade externa | Implementação para cursos internos | Compatibilidade |
|---|---|---|
| Criar/editar/duplicar turma | Criar/editar/duplicar oferta vinculada a curso | Alta |
| Lixeira e restauração | Reusar convenção de soft delete de cursos/ofertas | Alta |
| Matrícula e importação | Matrícula contextual com usuário ou identidade externa | Média; requer deduplicação |
| Professores delegados | `courseOfferTeachers` com índice único | Alta |
| Chamada por data | `courseOfferAttendance` habilitada por oferta | Alta |
| Notas e médias | `courseOfferGrades` + serviço de cálculo comum | Alta |
| SIMAL | Política de avaliação da oferta | Alta; fórmula preservada |
| Média manual e fechamento | Campos de auditoria na oferta/aluno e estado de fechamento | Alta |
| Materiais específicos | Ponte para `materials` e URLs externas | Média |
| Relatórios e boletim | Adaptador comum para aluno/oferta | Alta |
| Gráfico comparativo | Agregação por oferta | Alta |
| Notificações | Eventos idempotentes por oferta, aluno e operação | Alta |
| Área do aluno externo | Leitura por matrícula contextual | Alta |

## Ordem segura de implementação

A fase 3 deverá extrair o serviço de regras acadêmicas e criar testes de contrato para políticas padrão e SIMAL. A fase 4 deverá criar as tabelas de oferta, professores e matrículas contextuais. A fase 5 deverá transportar frequência, notas, médias manuais e fechamento. A fase 6 deverá adaptar materiais, relatórios, gráficos e notificações. As fases seguintes cuidarão de interface, migração controlada e rollout.

## Riscos controlados

A duplicidade temporária entre tabelas antigas e novas será controlada por adaptadores e testes de paridade. Não haverá migração automática de alunos ou notas sem relatório de prévia, validação de conflitos e operação reversível. Índices únicos deverão ser definidos por escopo de oferta, e não globalmente por nome ou e-mail, para não impedir que uma mesma pessoa participe de cursos diferentes.

## Critérios de aceite da arquitetura

A arquitetura será considerada apta quando uma oferta interna puder habilitar somente catálogo/progresso, ou também matrícula, frequência, avaliação, fechamento e boletim, sem exigir que todos os cursos tenham todas as capacidades. Dados externos anteriores continuarão consultáveis, o SIMAL permanecerá numericamente idêntico e as regras de acesso serão cobertas por testes para administrador, professor proprietário, professor delegado, aluno matriculado e usuário sem vínculo.
