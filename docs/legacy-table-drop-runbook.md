# Runbook de remoção física das tabelas legadas

## Estado atual

Este runbook prepara a operação, mas não a executa. O preflight de produção em 31 de agosto de 2026 encontrou 2 turmas legadas, 12 alunos, 18 notas e 2 registros de frequência. Existem 2 registros arquivados de frequência e 18 registros arquivados de notas. O monitoramento registrou 0 leituras de fallback nos últimos 14 e 30 dias.

A operação permanece bloqueada enquanto existirem registros nas tabelas legadas, foreign keys apontando para elas ou dependências de runtime. O arquivo histórico deve permanecer após o DROP para preservar a recuperação lógica.

## Artefatos

| Arquivo | Uso |
|---|---|
| `legacy-table-drop-preflight.sql` | Diagnóstico somente leitura antes da janela de manutenção. |
| `legacy-table-drop-production.sql` | SQL transacional destrutivo, protegido por gates e sem `CASCADE`. |
| `legacy-table-drop-draft.sql` | Rascunho anterior, mantido para comparação e não executável automaticamente. |
| `legacy_external_class_grades_archive` | Arquivo das notas históricas. |
| `legacy_external_class_attendance_archive` | Arquivo da frequência histórica. |

## Gates obrigatórios

A equipe só pode promover o SQL de produção quando o preflight retornar zero registros nas seis tabelas legadas, zero foreign keys legadas, zero fallback nos últimos 30 dias e arquivo histórico completo. Todas as leituras e escritas de runtime devem estar direcionadas às ofertas. O staging deve ter executado a mesma sequência em uma cópia restaurada e os fluxos de administração, professor e aluno devem estar verdes.

## Execução controlada

Executar o preflight, salvar seu resultado como artefato de mudança e obter duas aprovações. Em seguida criar um backup restaurável, congelar deploys e escritas acadêmicas, executar o `legacy-table-drop-production.sql` em uma única transação e executar imediatamente as consultas de verificação pós-operação. O script aborta antes do primeiro `DROP` se qualquer gate falhar.

O SQL usa `RESTRICT` implícito ao não usar `CASCADE`. Se ainda existir uma foreign key, a transação é interrompida. As constraints não devem ser removidas manualmente durante a janela; elas devem ser eliminadas em migrations anteriores, depois de os dados e consumidores terem sido migrados.

## Rollback

O rollback primário é restaurar o backup ou a branch Neon criada antes da operação. O arquivo histórico não substitui um backup físico completo: ele cobre notas e frequência, mas não necessariamente todas as colunas e dependências futuras das tabelas de alunos e turmas. Se a aplicação apresentar erro após o DROP, interromper o tráfego acadêmico, restaurar a branch/backup, reverter o deployment e validar novamente o preflight.

## Verificação pós-operação

Confirmar que `to_regclass` retorna nulo para as seis tabelas legadas, que as duas tabelas de arquivo continuam presentes e com 18 e 2 registros, que as ofertas e matrículas continuam acessíveis, que nenhum endpoint retorna erro de tabela ausente e que o workflow de fallback continua sem eventos. A verificação deve incluir acesso administrativo, workspace do professor, dashboard do aluno, frequência, notas, relatórios e medalhas.

## Condição de encerramento

A mudança só pode ser encerrada quando a aplicação estiver estável durante a janela de observação definida pela equipe, sem erros de banco, sem eventos `legacy_fallback_read`, sem perda de dados e com backup restaurável confirmado. Caso contrário, executar o rollback primário e manter as tabelas legadas disponíveis.
