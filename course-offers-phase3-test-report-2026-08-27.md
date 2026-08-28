# Relatório de testes da Fase 3 — API de ofertas e coortes

**Data:** 27 de agosto de 2026
**Escopo:** serviços, autorização, CRUD de ofertas, professores e matrículas contextuais.

## Resultado consolidado

| Verificação | Resultado | Observação |
|---|---:|---|
| TypeScript (`pnpm run check`) | Aprovado | `CHECK_EXIT=0`, sem erros de tipagem |
| Contratos da API nova, schema e cálculo | Aprovado | 5 arquivos, 24 testes |
| Smoke de integração e contratos legados | Aprovado | 5 arquivos, 31 testes |
| Integração real com banco | Não executada | `NEON_DATABASE_URL`, `DATABASE_URL` e `TEST_DATABASE_URL` ausentes |

## Cobertura executada

Os testes da API nova verificaram autenticação, criação com proprietário seguro, leitura com escopo, soft delete, restauração administrativa, atribuição de professores, validação de papel docente, conflitos de atribuição, identidade de aluno e isolamento por oferta. Os contratos de schema verificaram as quatro tabelas novas, chaves estrangeiras, índices únicos e ausência de operações destrutivas na migration.

O smoke test existente verificou o tratamento de erros de rotas críticas e foi executado junto dos contratos de turmas externas, regressão HTTP 500 e alinhamento do schema legado. Todos passaram.

## Limitação importante

A validação executada é estática/contratual e unitária. Ela não abriu transação real nem chamou os endpoints contra PostgreSQL, portanto ainda não prova comportamento de constraint no banco, retorno real das queries Drizzle, concorrência, rollback ou interação com dados existentes. Não foi usado banco simulado para mascarar essa ausência.

Para concluir a integração real, é necessário fornecer uma DSN de staging com as migrations aplicadas. O teste deverá criar uma oferta temporária, atribuir professor, matricular aluno, consultar por cada papel, testar conflito e arquivar/restaurar, e ao final remover os dados de teste em transação controlada.

## Conclusão

A implementação está consistente no nível de compilação e contratos: **55 verificações/testes passaram** nos dois grupos executados. A integração real permanece pendente exclusivamente por configuração de banco ausente; não há falha de contrato identificada nesta execução.
