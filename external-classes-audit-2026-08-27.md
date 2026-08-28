# Auditoria profunda das páginas de Turmas Externas

**Data:** 27 de agosto de 2026
**Ambiente principal:** produção em `andersonpalafoz.vercel.app`
**Versão analisada:** commit `54c139b`
**Responsável pelo documento:** Manus AI

## 1. Sumário executivo

A auditoria examinou a área de **Turmas Externas** sob a perspectiva de operação docente, administração global, professor delegado, aluno externo, acessos não autorizados, persistência, cálculos acadêmicos, relatórios, responsividade e estados de erro. A implementação principal está concentrada em `app/professor/turmas-externas/page.tsx`, com persistência e autorização em `app/api/professor/external-classes/route.ts`.

O resultado geral é **positivo para o escopo acadêmico auditado**. A suíte focada passou com **20 arquivos e 85 testes**, e a página em produção carregou corretamente as turmas, o gráfico comparativo, o deep-link de notas, o histórico de chamada e o estado vazio de materiais. A suíte completa registrou **201 arquivos e 628 testes aprovados**, com seis falhas de coleta provocadas pela ausência de `NEON_DATABASE_URL`/`DATABASE_URL` no ambiente local/CI, sem falha nos testes focados de Turmas Externas.

Não foram executadas operações destrutivas ou gravações de dados reais durante a auditoria. Os fluxos de criação, edição, exclusão, importação, lançamento de nota, fechamento de notas e correção de frequência foram avaliados por inspeção de código, contratos de teste e controles apresentados na produção. A validação ponta a ponta de gravação com dados reais permanece recomendada em ambiente controlado.

| Dimensão | Resultado | Classificação |
|---|---|---|
| Autenticação e bloqueio de acesso | Sessão ausente/usuário sem papel permitido recebe 403 no endpoint | Conforme |
| Escopo por turma | Admin global vê todas; professor vê própria ou delegada | Conforme, com regra duplicada a manter sincronizada |
| Gestão de turmas/alunos | Criar, editar, duplicar, excluir logicamente, restaurar, excluir permanentemente, matricular e importar | Conforme |
| Notas decimais e SIMAL | Ponto/vírgula, validação de limites, prova até 8 + apresentação até 2 | Conforme |
| Média manual | Limite 0–10, justificativa mínima, usuário/data/motivo, restauração do cálculo | Conforme |
| Frequência | Presente, ausente, atrasado, justificado; edição por data | Conforme |
| Relatórios | CSV, XLSX, PDF acadêmico e boletim individual | Conforme nos contratos e UI observados |
| Responsividade | Gráfico sem overflow em desktop/tablet/celular; layout adaptativo | Conforme |
| Acessibilidade e estados | Loading, erro recuperável, `aria-live`, labels, foco e controles identificados | Bom, com espaço para auditoria automatizada dedicada |
| CI | 6 arquivos falham na coleta por variável de banco ausente | Atenção operacional |

## 2. Método e limites

A auditoria foi dividida em dez fases: mapeamento de escopo; autenticação e autorização; gestão de turmas; notas e SIMAL; frequência; relatórios; interface e responsividade; testes automatizados; consolidação de evidências; e entrega do documento. Foram combinadas quatro fontes: inspeção do código versionado, execução dos testes Vitest, navegação de leitura na produção autenticada e medições de layout em viewports simulados.

A conta disponível durante a auditoria estava autenticada como proprietário/superadministrador. Por isso, a comparação visual de administrador e professor utilizou o mecanismo interno de visualização simulada, enquanto a autorização efetiva foi confirmada por helpers, endpoint e testes. Não foi possível criar uma sessão isolada real de professor delegado, aluno externo ou usuário anônimo sem alterar credenciais; esses comportamentos foram validados por contratos e regras de código, não por gravação em produção.

## 3. Fase 1 — Mapa de rotas, superfícies e contratos

A superfície central é `/professor/turmas-externas`. Ela agrega filtros globais, indicadores operacionais, gráfico acadêmico comparativo e cartões de turma. Cada cartão possui abas de **Alunos**, **Chamada**, **Notas & Avaliações** e **Materiais Didáticos**. A página também contém formulários de criação/edição de turma, matrícula/edição de aluno, importação de planilha, atribuição de professores, ações rápidas, relatórios e boletim individual.

As superfícies relacionadas são o relatório individual em `/professor/boletim/[studentId]`, o endpoint `/api/professor/external-student-report`, o calendário iCal da turma, os relatórios administrativos e a área do aluno externo. O endpoint principal agrega, por turma, alunos, último acesso, professores atribuídos, frequência, notas, materiais e estatísticas de total, ativos e concluídos.

As principais ações do endpoint são `createClass`, `updateClass`, `duplicateClass`, `deleteClass`, `restoreClass`, `permanentDeleteClass`, `addStudent`, `updateStudent`, `deleteStudent`, `importCsvStudents`, `sendWelcomeEmail`, `setTeacherAssignments`, `setManualAverage`, `setGradeStatus`, `saveAttendance`, `saveGrade`, `saveBatchGrades`, `updateGrade`, `deleteGrade`, `addMaterial` e `deleteMaterial`.

## 4. Fase 2 — Autenticação e autorização

O endpoint exige sessão válida e permite `admin`, `super_admin` ou `professor`, além da exceção explícita do e-mail do proprietário. Sessão ausente ou papel não permitido recebe **403 — Acesso não autorizado**. A conta autenticada também precisa ser encontrada no banco para a maior parte das operações, e a ausência do e-mail ou do registro de usuário é classificada como erro específico.

Administradores globais consultam todas as turmas não excluídas e podem consultar a lixeira com `mode=trash`. Professores consultam somente turmas cujo `teacherId` é seu próprio ID ou para as quais existe registro em `externalClassTeacherAssignments`. A função `canManageExternalClass` aplica a mesma regra para alterações, mantendo bypass de administrador global e proprietário.

A atribuição de professores adicionais é restrita ao administrador global. O servidor aceita somente professores ativos, remove duplicidades e substitui o conjunto anterior de atribuições. Na UI, o administrador observou o controle de atribuição; o professor observou apenas o fluxo operacional, sem menu administrativo nem botão de nova turma.

**Ponto de atenção:** a regra de privilégio está implementada tanto no endpoint quanto em `lib/admin-auth.ts`. Isso não é uma falha observada, mas cria risco de divergência futura. Recomenda-se centralizar a decisão de escopo em um único helper compartilhado por todos os handlers.

## 5. Fase 3 — Gestão de turmas e alunos

### 5.1 Turmas

A criação exige instituição, nome da turma, curso e período. O servidor valida data final não anterior à inicial, limite de faltas entre 0% e 100%, média mínima entre 0 e 10, quantidade de unidades entre 1 e 100, duração positiva e escopo de média válido. Os padrões incluem duração semestral, carga horária de 40 horas, limite de faltas de 25%, média mínima de 6 e modalidade remota quando não informadas.

A edição preserva campos omitidos e atualiza `updatedAt`. A duplicação copia a configuração acadêmica e os metadados da turma, mas inicia com zero alunos copiados, comportamento adequado para evitar duplicação acidental de registros acadêmicos.

A exclusão normal é lógica por `deletedAt`; a restauração limpa esse campo; a exclusão permanente remove alunos, frequência, notas, materiais e a turma. Esta última ação é irreversível e deve permanecer protegida por confirmação explícita na UI.

### 5.2 Alunos

A matrícula exige nome e turma. E-mail e matrícula/ID são protegidos contra duplicidade dentro da mesma turma. Os campos complementares incluem CPF, categoria, universidade, componente, status e anotações do professor. A edição reaproveita a autorização da turma. A UI apresenta acesso, status, alertas de baixa nota/frequência, boletim individual, edição e exclusão.

A importação possui limites de segurança para número de linhas, tamanho de textos e registros de frequência por aluno. O fluxo retorna contagens de importados, atualizados, ignorados e frequência importada, permitindo conferência operacional.

### 5.3 Acesso do aluno

O fluxo de boas-vindas exige aluno existente, e-mail e turma gerenciável; então envia a mensagem por serviço de e-mail. O código também calcula último acesso e trata contas que ainda precisam trocar senha. A existência de e-mail cadastrado sem conta correspondente é tratada como ausência de acesso efetivo.

**Ponto de atenção:** `deleteStudent`, `deleteGrade` e `deleteMaterial` retornam sucesso quando o ID não existe. Esse comportamento idempotente pode ser desejável em interfaces repetíveis, mas pode ocultar erro de integração. Recomenda-se decidir e documentar uma convenção: `404` para recurso inexistente ou resposta explícita `deleted: false`.

## 6. Fase 4 — Notas, médias e SIMAL

A página oferece lançamento individual, lançamento por aluno em lote, aplicação de nota padrão para todos, edição e exclusão. A nota zero é preservada, e valores com vírgula, como `7,5`, são normalizados para cálculo e persistência. O servidor rejeita valores não numéricos, notas negativas e notas superiores ao máximo.

Antes de salvar uma nota, o servidor confirma que o aluno pertence à turma indicada. Isso impede que um `studentId` de outra turma seja usado em uma operação válida de professor. Alterações de nota são bloqueadas quando `gradeStatus` é `closed`, com resposta **409** e instrução para reabrir o lançamento.

O SIMAL mantém a fórmula oficial: **prova escrita até 8,0 pontos + apresentação até 2,0 pontos**. A UI expõe versões e componentes como Grammar, Reading, Writing, Listening, Speaking, Presentation e nota total da prova escrita. A tela apresenta a unidade, data, versão, nota obtida, feedback e registros existentes.

A média manual aceita intervalo de 0 a 10, ponto ou vírgula, exige justificativa de pelo menos oito caracteres e registra média, justificativa, data e usuário responsável. A ação `Restaurar cálculo` remove o ajuste e devolve a média automática. Em produção, o resumo da turma Matutino exibiu Mario Augusto 9,6, Viktor Maicon 9,6 e Isabela Silva Luz 8,9, todos aprovados segundo média mínima 5,0 e frequência mínima 75%.

As notificações de nota criada ou atualizada são previstas para alunos com conta correspondente. A implementação possui proteção contra duplicidade em uma das rotas de notificação por chave de evento; a rota de criação individual também insere uma notificação direta. Recomenda-se uniformizar a emissão em uma única função para evitar notificações duplicadas quando os dois caminhos forem alterados no futuro.

## 7. Fase 5 — Frequência e consistência temporal

A chamada aceita `present`, `absent`, `late` e `excused`, apresentados na interface como **Presente**, **Ausente**, **Atrasado** e **Justificado**. O servidor valida o mapa de aluno para status, confirma turma e permissão e localiza a chamada pela combinação de turma e data. Se já existir registro para a data, atualiza-o; caso contrário, cria um novo.

Na produção, o deep-link `?classId=5&tab=attendance` exibiu a mensagem de que os registros da data foram carregados, a tabela de alunos, o botão **Atualizar chamada**, o histórico `Aula em 2026-08-27` e o controle **Editar chamada**. Isso confirma o comportamento esperado de correção de uma chamada já realizada.

A sumarização conta presença e atraso como participação válida, não conta justificadas como falta e aplica o limite configurado na turma. Os testes verificam frequência por período, limite específico por turma e reprovação por excesso de faltas.

**Ponto de atenção:** a API não impõe, no trecho auditado, uma validação explícita de que todos os IDs presentes no mapa de frequência pertencem à turma. Ela valida o status, mas o mapa recebido pode conter chave de aluno inesperada. Recomenda-se rejeitar ou ignorar IDs fora do conjunto de alunos da turma, seguindo a mesma proteção já aplicada às notas.

## 8. Fase 6 — Relatórios e exportações

A área oferece quatro famílias de saída: relatório acadêmico CSV, relatório Excel estruturado, relatório acadêmico em PDF e boletim individual em PDF. O filtro de exportação separa todos os alunos, reprovados por nota, reprovados por falta e qualquer reprovação.

O CSV usa UTF-8 com BOM e separador ponto e vírgula, adequado ao Excel brasileiro. O XLSX possui colunas dimensionadas, autofiltro e congelamento. O PDF acadêmico usa A4 paisagem, tabela com layout fixo, cabeçalho repetido e resumo de desempenho com estados aprovado, reprovado e dados insuficientes. O boletim individual usa A4 retrato e inclui média final, nota SIMAL, situação, frequência e pendências.

Na produção, cada aluno da turma apresentou ação **Boletim PDF**. A abertura de PDF depende de popup permitido pelo navegador; a UI contém mensagem específica caso o popup seja bloqueado. A validação ponta a ponta de download binário não foi executada para não iniciar downloads ou gerar arquivos em massa durante a auditoria, mas os contratos e a implementação foram verificados.

## 9. Fase 7 — Gráficos, responsividade e interface

O gráfico comparativo mostra, por turma, a distribuição das médias em quatro faixas — 0–4,9; 5–5,9; 6–7,9; 8–10 — e a distribuição de frequência — abaixo de 75%; 75–89,9%; 90–100%. A legenda diferencia notas e frequência por cor, e o texto explica que a média segue a configuração acadêmica e que presença/atraso são válidos para frequência.

Foram testados viewports de 1440, 768 e 390 pixels. A seção esteve presente em todos, os dois cartões foram renderizados e nenhum elemento interno apresentou `scrollWidth` superior à largura disponível. No desktop os cartões aparecem lado a lado; no tablet e celular o conteúdo empilha, aumentando a altura sem cortar labels, valores ou barras.

A página contém loading com `aria-busy="true"`, estado de erro com `role="alert"` e `aria-live="assertive"`, botão de nova tentativa e retorno ao painel. A inspeção estática encontrou 19 `aria-label`, 17 `title`, 57 ocorrências de labels/associação de campo e 58 botões na página principal. Há uso consistente de breakpoints `sm`, `md`, `lg` e `xl`, além de estados vazios para alunos, chamada, notas e materiais.

**Ponto de atenção:** a contagem estática não substitui um teste automatizado com leitor de tela, teclado e contraste. Recomenda-se uma rodada específica com axe/Lighthouse e navegação exclusivamente por teclado.

## 10. Fase 8 — Resultados de testes

### 10.1 Suíte focada

Foram executados os testes de importação, SIMAL, autorização, atribuição de professores, regressão 500, contrato da API, feedback, filtros, validação de formulários, notas/frequência, exportações, alinhamento de schema, visual, boas-vindas, mobile layout, resumo acadêmico, acesso externo, cálculo SIMAL e comparação acadêmica.

**Resultado:** 20 arquivos aprovados e 85 testes aprovados.

### 10.2 Suíte completa

**Resultado:** 201 arquivos e 628 testes aprovados. Seis arquivos falharam na fase de coleta por ausência de `NEON_DATABASE_URL` ou `DATABASE_URL`: `lib/db.connection.test.ts`, `lib/gamification.test.ts`, `lib/system-resilience.test.ts`, `lib/stripe.test.ts`, `app/contato/page.render.test.tsx` e `app/professor/professor.test.ts`.

As falhas ocorreram antes da execução dos testes desses arquivos, durante a importação da conexão de banco. Não foram observadas falhas nos 20 arquivos focados em Turmas Externas.

## 11. Matriz de comportamento por acesso

| Acesso | Pode consultar | Pode alterar | Restrições observadas |
|---|---|---|---|
| Superadministrador | Todas as turmas, lixeira, alunos, notas, frequência, materiais, relatórios | Todas as operações permitidas | Exceção de proprietário por e-mail também concede privilégio |
| Administrador | Todas as turmas e controles administrativos | Criar/editar/duplicar/excluir/restaurar, atribuir professores, operar acadêmico | Atribuição aceita apenas professores ativos |
| Professor proprietário | Turmas cujo `teacherId` é seu ID | Gestão da própria turma, alunos, notas, frequência, materiais e relatórios | Não atribui professores adicionais |
| Professor delegado | Turmas atribuídas | Operação acadêmica e de gestão na turma delegada | Não administra turmas fora da atribuição |
| Aluno externo | Área externa própria, materiais/notas/frequência vinculados à sua conta | Sem controles docentes | Conta e vínculo de aluno são necessários |
| Usuário comum/sem sessão | Nenhuma superfície protegida | Nenhuma | Endpoint principal retorna 403 |

## 12. Riscos e recomendações priorizadas

| Prioridade | Recomendação | Motivo | Esforço estimado |
|---|---|---|---|
| Alta | Configurar `NEON_DATABASE_URL` ou `DATABASE_URL` nos jobs que coletam testes | Eliminar falhas ambientais da suíte completa | Baixo |
| Alta | Validar IDs do mapa de frequência contra alunos da turma | Evitar registros órfãos ou cruzados | Baixo |
| Média | Centralizar `canManageExternalClass` e a regra de sessão | Reduzir divergência entre handlers | Médio |
| Média | Unificar emissão de notificações de notas | Evitar duplicidade em caminhos diferentes | Médio |
| Média | Definir resposta padrão para exclusões de recurso inexistente | Melhorar observabilidade de integrações | Baixo |
| Baixa | Validar URL de material no servidor, não apenas no input HTML | Reforçar qualidade e segurança dos links | Baixo |
| Baixa | Rodar axe/Lighthouse e teste de teclado | Completar evidência de acessibilidade | Médio |
| Baixa | Validar downloads reais em ambiente de staging | Confirmar binários e nomes de arquivos | Médio |

## 13. Conclusão

A área de Turmas Externas apresenta uma base funcional consistente e compatível com o SIMAL. Os requisitos centrais — notas decimais, cálculo automático de situação, média manual justificada, edição de chamadas, relatórios profissionais, gráfico comparativo e responsividade — estão presentes no código, cobertos por testes focados e visíveis na produção. A principal pendência operacional é a configuração da variável de banco para a coleta completa de testes; os demais pontos são melhorias preventivas de consistência, centralização de autorização, validação de dados e observabilidade.

## Referências

[1]: https://andersonpalafoz.vercel.app/professor/turmas-externas — Página de Turmas Externas em produção.
[2]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io-v2/commit/54c139b — Commit analisado no repositório.
[3]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io-v2/blob/main/app/professor/turmas-externas/page.tsx — Implementação da página principal.
[4]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io-v2/blob/main/app/api/professor/external-classes/route.ts — Endpoint de turmas externas.
[5]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io-v2/blob/main/lib/admin-auth.ts — Helpers de autorização administrativa e de turmas externas.
[6]: https://github.com/AndersonPalafoz/andersonpalafoz.github.io-v2/blob/main/lib/simal-grading.ts — Fórmula de cálculo SIMAL.
