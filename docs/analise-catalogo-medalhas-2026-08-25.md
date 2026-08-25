# Análise do sistema e catálogo de medalhas

## Escopo e evidência

A análise foi baseada no schema Drizzle, nas APIs administrativas e do aluno, nas galerias visuais e em uma consulta somente leitura ao banco Neon ativo (`teacher-palafoz`). A consulta do catálogo não retornou registros em `medals_catalog`; portanto, não foram inventados nomes, requisitos, ícones ou estatísticas.

## Estado atual

| Área | Estado observado | Impacto |
|---|---|---|
| Catálogo persistido | Nenhuma medalha retornada no banco ativo | A galeria do aluno não consegue apresentar conquistas reais até o catálogo ser populado por uma ação administrativa legítima. |
| Concessão manual | API `POST /api/admin/medals` concede uma medalha existente a um aluno aprovado | O fluxo básico existe, com prevenção de duplicidade e notificação. |
| Gestão do catálogo | API administrativa expõe leitura, mas não criação, edição, arquivamento ou exclusão | O administrador ainda depende de seed ou acesso técnico para manter o catálogo. |
| Histórico de concessões | Lista limitada aos 100 registros mais recentes, sem filtros ou paginação | A auditoria fica limitada quando o volume crescer. |
| Reversão | Não há revogação documentada de uma concessão | Correções exigem intervenção técnica e podem comprometer a rastreabilidade. |
| Galeria do aluno | Exibe desbloqueadas e bloqueadas, mas sem progresso até cada requisito | O aluno vê o estado, mas não sabe claramente o próximo passo. |
| Modelo de dados | `user_medals.medalCode` não possui chave estrangeira explícita para `medals_catalog.code` | Um código removido ou digitado incorretamente pode gerar concessões órfãs. |

## Melhorias recomendadas

A primeira prioridade é criar uma gestão completa do catálogo no painel administrativo. O fluxo deve permitir criar, editar, arquivar e reativar medalhas, com código imutável após a primeira concessão. A exclusão física não é recomendada; um campo de status ou `archivedAt` preservaria o histórico e impediria novas concessões sem esconder medalhas já conquistadas.

A segunda prioridade é transformar requisitos em regras estruturadas. Hoje `requirement` é texto livre, o que é adequado para exibição, mas insuficiente para desbloqueio automático confiável. Recomenda-se manter o texto amigável e adicionar um objeto versionado, por exemplo `ruleType`, `ruleValue` e `ruleConfig`, com tipos como conclusão de curso, sequência de dias, nota mínima, quantidade de aulas ou participação em turma. Cada regra deve ter teste unitário e registro da versão aplicada.

A terceira prioridade é ampliar a auditoria. Concessões manuais devem registrar administrador, justificativa, data e, futuramente, revogação com motivo. A tela deve oferecer busca por aluno, código, categoria, tipo de concessão e período, além de paginação. A API deve devolver contagens por categoria e estado sem carregar listas ilimitadas.

A quarta prioridade é melhorar a experiência do aluno sem recorrer a gamificação excessiva. Em conformidade com a diretriz pedagógica da plataforma, a galeria deve enfatizar progresso real: mostrar o requisito, a evidência atual, o próximo marco e a data da conquista. Recomenda-se limitar o número de medalhas, evitar categorias redundantes e priorizar marcos academicamente significativos, como conclusão de módulo, consistência de estudo e desempenho em práticas linguísticas.

## Catálogo inicial recomendado para decisão do administrador

Esta tabela é uma proposta de produto, não representa dados existentes no banco e não deve ser inserida automaticamente sem aprovação.

| Código sugerido | Categoria | Marco pedagógico | Evidência necessária |
|---|---|---|---|
| `course_completion` | acadêmica | Conclusão de um curso | Matrícula concluída e requisitos do curso atendidos |
| `module_mastery` | acadêmica | Conclusão de um módulo | Todas as aulas e atividades do módulo concluídas |
| `study_consistency` | constância | Rotina de estudo consistente | Regra de dias consecutivos definida pelo administrador |
| `speaking_practice` | prática | Evolução em speaking | Tentativas avaliadas e critério mínimo configurado |
| `learning_portfolio` | progresso | Desenvolvimento equilibrado | Evidências em duas ou mais práticas linguísticas |

## Conclusão

O sistema já possui a base de concessão manual, prevenção de duplicidade, notificação e apresentação ao aluno. O principal problema atual não é a ausência de uma tela, mas a falta de um catálogo persistido e de uma camada de regras estruturadas, auditoria completa e progresso explicável. A implementação deve começar por CRUD administrativo com arquivamento, depois regras automáticas versionadas e, por fim, filtros e indicadores de progresso na galeria do aluno.
