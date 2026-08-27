# Auditoria de consistência entre legado e ofertas

## Objetivo

O auditor compara turmas externas legadas com a nova camada de ofertas/coortes sem executar qualquer escrita. Ele verifica vínculo da turma, período, professor proprietário, alunos, usuários associados, chamadas por data, remapeamento dos IDs de presença e professores delegados.

## Execução

Use `pnpm audit:course-offers` para executar a auditoria. O modo padrão é somente leitura. Use `pnpm audit:course-offers -- --json` para gerar saída estruturada e `--class-id=<id>` para limitar a uma turma. O argumento `--fail-on-warning` também transforma avisos em falha para uso em CI.

O processo retorna código `0` quando não há erros, código `1` quando há divergências de erro ou avisos com `--fail-on-warning`, e código `2` para argumento inválido. Quando não há `NEON_DATABASE_URL` nem `DATABASE_URL`, o auditor não importa a conexão e retorna `status: skipped`, sem falhar por configuração ausente.

## Invariantes verificados

| Código | Severidade | Regra |
|---|---|---|
| `MISSING_OFFER` | erro | Toda turma legada auditada deve ter oferta correspondente |
| `DUPLICATE_SOURCE_OFFERS` | erro | Uma turma legada não deve possuir mais de uma oferta vinculada |
| `SOURCE_LINK_MISMATCH` | erro | `sourceExternalClassId` deve apontar para a turma auditada |
| `ACADEMIC_TERM_MISMATCH` | aviso | O período deve permanecer equivalente |
| `OWNER_TEACHER_MISMATCH` | erro | O proprietário deve preservar o professor da turma legada |
| `MISSING_STUDENTS` | erro | Todos os alunos legados devem aparecer na oferta |
| `STUDENT_USER_MISMATCH` | erro | O vínculo de usuário não pode mudar |
| `MISSING_ATTENDANCE_DATES` | erro | Todas as datas de chamada devem ser preservadas |
| `ATTENDANCE_STATUS_MISMATCH` | erro | Os status devem permanecer iguais após remapeamento de IDs |
| `MISSING_TEACHER_ASSIGNMENTS` | erro | Proprietário e delegados devem ser preservados |

## Validação

TypeScript passou e os testes puros passaram com 3 arquivos e 13 testes. A execução do comando sem banco retornou corretamente `status: skipped`, sem consultar ou modificar dados. A auditoria contra staging depende da configuração de uma DSN segura.
