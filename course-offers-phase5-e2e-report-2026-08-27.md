# Relatório da Fase 5 — E2E e validação de staging

**Data:** 27 de agosto de 2026  
**Escopo:** API de ofertas/coortes e migrador de dados legados.

## Entrega

Foi criada a suíte `app/api/course-offers/e2e.test.ts`, que executa os handlers HTTP com sessões simuladas e verifica os fluxos principais de criação, listagem, leitura, atualização e negação por escopo. Também foi criado `scripts/validate-course-offers-staging.mts`, que chama a API real de staging quando configurado.

O validador de staging exige `STAGING_BASE_URL` e `STAGING_COOKIE`. Para o modo mutável `--apply`, exige ainda `STAGING_COURSE_ID`, `STAGING_TEACHER_ID` e `STAGING_STUDENT_USER_ID`. Ele recusa o domínio de produção por padrão, cria oferta temporária, consulta, atualiza, matricula aluno, lista a matrícula, remove o aluno e arquiva/restaura/arquiva a oferta durante a limpeza.

## Resultados

| Verificação | Resultado |
|---|---:|
| TypeScript | Aprovado — código `0` |
| E2E local de handlers | **3 arquivos, 15 testes aprovados** |
| Validador de staging em modo seguro | Executado com status `skipped` |
| Conexão de staging real | Não disponível |

O modo seguro foi ignorado porque `STAGING_BASE_URL` não está configurada. Não houve chamadas externas, criação de ofertas, matrícula de alunos ou alterações em banco.

## Critérios cobertos

A suíte E2E local confirma rejeição anônima, criação administrativa com proprietário informado, listagem docente, bloqueio de leitura fora do escopo e atualização sem permitir troca de `courseId` ou `ownerTeacherId`. Os testes do migrador continuam cobrindo idempotência, política SIMAL, nomes e remapeamento dos mapas de chamada.

## Procedimento para staging

Em uma sessão com uma URL de preview/staging e cookie de login apropriado, deve-se executar primeiro `pnpm validate:course-offers:staging` para validar somente leitura. Depois, com dados temporários autorizados, executar `pnpm validate:course-offers:staging -- --apply`. O script é desenhado para limpar o aluno e a oferta criados mesmo quando uma etapa intermediária falhar.

A migration 0079 deve estar aplicada no staging antes do teste. O cookie deve pertencer a um usuário de staging com as permissões adequadas, e os IDs informados devem apontar para registros descartáveis do ambiente de teste. Nunca se deve usar o banco de produção para esse fluxo.

## Conclusão

A Fase 5 está pronta no nível de E2E local e possui um executor de validação real protegido contra produção. A única validação pendente é a execução em staging, bloqueada pela ausência de URL, cookie e IDs temporários nesta sessão; isso é uma limitação de configuração, não uma falha de teste.
