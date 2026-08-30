# Plano de desativação gradual das tabelas legadas

**Autor:** Manus AI  
**Data:** 30 de agosto de 2026  
**Escopo:** `external_classes`, `external_students` e tabelas dependentes  
**Banco:** PostgreSQL/Neon  
**Aplicação:** Next.js 15, Drizzle ORM, Vercel

## 1. Decisão executiva

As tabelas `external_classes` e `external_students` **não devem ser removidas imediatamente**. A migração estrutural já criou duas ofertas publicadas e 12 matrículas contextuais, mas o código ainda possui dependências de runtime nas tabelas legadas. Além disso, ainda existem 18 notas em `external_class_grades`, dois registros de frequência em `external_class_attendance` e referências de compatibilidade mantidas pelo adaptador acadêmico.

A estratégia recomendada é uma desativação em seis ondas: inventário e contratos, migração completa de dados, dual-read, congelamento de escrita legada, remoção das dependências relacionais e somente então arquivamento ou remoção física. Cada onda possui critérios de entrada, critérios de saída, testes obrigatórios e uma janela de rollback.

> **Regra principal:** nenhuma tabela legada será apagada enquanto houver uma rota de produção, uma foreign key, uma tarefa agendada, um relatório ou uma fórmula acadêmica que dependa diretamente dela.

## 2. Estado inicial e riscos conhecidos

A auditoria atual encontrou duas turmas legadas ativas, 12 alunos externos ativos, 18 notas, dois registros de frequência e duas ofertas vinculadas por `sourceExternalClassId`. Os 12 alunos já possuem correspondência em `course_offer_students` por `externalStudentId`. Não foram encontrados placeholders ou órfãos nas verificações realizadas.

O principal risco não é mais a ausência de matrícula contextual, mas a possibilidade de uma funcionalidade ainda consultar a tabela legada sem passar pelo `AcademicContext`. A remoção física também pode atingir dados históricos porque várias tabelas possuem `ON DELETE CASCADE` para `external_classes` ou `external_students`.

| Risco | Impacto | Mitigação |
|---|---|---|
| Rota ainda lê `external_students` | Falha no portal ou na gestão de alunos | Migrar para `course_offer_students` e manter fallback temporário por feature flag |
| Notas legadas não migradas | Perda de histórico e cálculo incorreto | Migrar notas com auditoria de soma, decimais e fórmula SIMAL |
| Frequência JSON com IDs diferentes | Frequência incorreta por aluno | Comparar cada status antes e depois do remapeamento |
| `sourceExternalClassId` removido cedo | Perda de rastreabilidade | Manter coluna durante todo o período de observação |
| `ON DELETE CASCADE` | Exclusão em cadeia de dados históricos | Bloquear `DROP` até concluir inventário e backup validado |
| Link antigo com `classId` | Quebra de URLs e favoritos | Resolver `classId` no adaptador e redirecionar gradualmente para `offerId` |

## 3. Onda 0 — inventário e contratos

Antes de qualquer alteração de leitura, congelar um inventário versionado de todas as referências a `external_classes`, `external_students`, `externalClassId` e `externalStudentId`. O inventário deve incluir código de aplicação, scripts, jobs, actions, migrations, views, constraints, triggers, relatórios exportáveis e integrações externas.

As rotas devem adotar um contrato único de contexto. `offerId` será o identificador primário; `classId` permanecerá aceito apenas como compatibilidade. Quando ambos forem enviados, o servidor deve verificar que representam o mesmo contexto. O frontend não deve inferir o contexto a partir do curso.

**Critério de saída:** não existir rota acadêmica sem uma regra explícita de resolução e autorização contextual. Cada consumidor deve estar classificado como migrado, compatível temporariamente ou candidato à remoção.

## 4. Onda 1 — completar a migração de dados

A migração deve ser executada de forma idempotente e com relatório por turma, oferta e aluno. A ordem recomendada é:

1. garantir que cada turma legada tenha exatamente uma oferta ativa;
2. garantir que cada aluno ativo tenha uma linha em `course_offer_students`;
3. migrar atribuições de professores;
4. migrar frequência, remapeando as chaves dos mapas JSON;
5. migrar notas e avaliações para o modelo contextual;
6. migrar materiais, comentários, entregas e feedbacks, quando existirem;
7. comparar totais, identificadores e valores entre origem e destino.

A migração deve preservar `externalStudentId` e `sourceExternalClassId` durante todo o período de observação. Esses campos funcionarão como chaves de reconciliação, não como dependências permanentes do domínio.

Para notas, a comparação deve verificar valor bruto, valor decimal normalizado, componente, unidade, data, justificativa e eventual média manual. Para SIMAL, a validação deve confirmar que a nota escrita permanece limitada a oito pontos, a apresentação a dois pontos e a nota final mantém a precisão decimal.

**Critério de saída:** 100% dos alunos, frequências, notas e atribuições elegíveis com correspondência contextual; zero divergências críticas; nenhuma perda ou alteração não explicada.

## 5. Onda 2 — dual-read controlado

Durante uma janela de observação, as rotas devem ler primeiro pelas tabelas novas e usar a tabela legada somente como fallback explícito. O fallback deve produzir uma métrica, por exemplo `legacy_fallback_read`, contendo rota, tipo de registro, oferta e identificador anonimizado.

As áreas prioritárias são o portal do aluno, dashboard, turmas externas, relatórios de aluno, frequência, avaliações, materiais, medalhas e autorização administrativa. O `AcademicContext` deve ser o único ponto autorizado a resolver `offerId` e `classId`.

| Controle | Condição de aceite |
|---|---|
| Leitura pela oferta | Pelo menos 99,9% das leituras acadêmicas usam `offerId` após a estabilização |
| Fallback legado | Somente em rotas explicitamente catalogadas |
| Divergência | Zero divergência crítica entre origem e destino por sete dias |
| Erros | Nenhum aumento sustentado de respostas 4xx/5xx nas rotas acadêmicas |
| Experiência | Links antigos continuam funcionando e preservam o contexto correto |

## 6. Onda 3 — congelar escritas legadas

Depois da janela dual-read, remover as escritas diretas em `external_classes` e `external_students` das telas de produção. As mutações deverão gravar primeiro no modelo de ofertas. Se alguma rotina ainda exigir o legado por compatibilidade, ela poderá executar uma sincronização controlada, auditada e temporária, nunca uma gravação silenciosa.

As escritas que precisam ser migradas incluem criação e edição de alunos, exclusão, atribuição de acesso, frequência, notas, fechamento de notas, tarefas, materiais e vínculos de professores. Cada endpoint deve validar a cadeia `recurso → oferta → atribuição do professor` no servidor.

**Critério de saída:** nenhum endpoint de produção grava diretamente nas duas tabelas, exceto um job de compatibilidade explicitamente identificado e monitorado. A busca de código deve ser acompanhada por teste contratual que falhe se uma rota reintroduzir a escrita legada.

## 7. Onda 4 — remover dependências relacionais gradualmente

Somente após completar as ondas anteriores, criar uma migration para substituir dependências sem apagar dados. Primeiro, adicionar constraints ou colunas equivalentes no modelo novo. Depois, remover a dependência de `course_offers.sourceExternalClassId` e `course_offer_students.externalStudentId`, mantendo os valores em uma tabela de mapeamento histórica, como `legacy_academic_identity_map`.

A tabela de mapeamento deve registrar:

| Campo | Finalidade |
|---|---|
| `legacy_table` | Identificar `external_classes` ou `external_students` |
| `legacy_id` | Preservar o ID antigo |
| `offer_id` | Preservar o contexto atual |
| `offer_student_id` | Preservar o aluno contextual |
| `migrated_at` | Registrar quando ocorreu a associação |
| `migration_version` | Permitir auditoria e rollback lógico |

As tabelas de notas, frequência e materiais legados devem ser migradas ou convertidas para referências contextuais antes de qualquer remoção de foreign key. Constraints devem ser removidas em migrations separadas, com validação entre cada etapa.

## 8. Onda 5 — arquivamento e remoção física

A remoção física só poderá ser considerada quando todos os critérios abaixo forem atendidos simultaneamente:

- zero referências de runtime durante pelo menos 30 dias;
- zero fallback legado durante pelo menos 14 dias;
- zero escrita legada durante pelo menos 30 dias;
- todas as notas, frequências, materiais e atribuições reconciliadas;
- backup completo restaurado com sucesso em ambiente isolado;
- exportação imutável das tabelas legadas arquivada;
- foreign keys, scripts e migrations atualizados;
- plano de rollback ensaiado;
- aprovação administrativa registrada.

A primeira ação recomendada não é `DROP TABLE`, mas renomear as tabelas para uma área de arquivo, por exemplo `archive_external_classes_2026` e `archive_external_students_2026`, após remover as dependências. Manter o arquivo por pelo menos um ciclo acadêmico completo reduz o risco de perda de histórico. O `DROP TABLE` definitivo deve ser uma migration posterior e separada.

## 9. Matriz de testes

| Grupo | Teste | Resultado esperado |
|---|---|---|
| Contexto | URL com `offerId` válido | Acessa somente a oferta correta |
| Contexto | URL com `classId` legado | Resolve a oferta correspondente sem vazamento |
| Contexto | `offerId` e `classId` conflitantes | Retorna `400` ou `409` sem consultar dados indevidos |
| Autorização | Professor de outra oferta | `403` em leitura e mutação |
| Alunos | Lista de alunos | Contagem e identidade iguais ao destino contextual |
| Alunos | Cadastro, edição e exclusão | Grava somente no modelo novo após congelamento |
| Notas | Decimal com ponto e vírgula | Normalização preserva o valor |
| Notas | Nota zero | Aceita `0,0` sem interpretar como vazio |
| Notas | SIMAL | Escrita até 8, apresentação até 2 e soma correta |
| Notas | Override manual | Preserva valor, justificativa, autor e data |
| Frequência | Status válidos | Preserva `present`, `absent`, `late` e `justified` |
| Frequência | Mapas JSON | Cada chave é remapeada para o aluno contextual correto |
| Tarefas | Entrega e correção | Cadeia `submission → task → offer` autorizada |
| Materiais | Download e comentários | Não depende de turma legada removida |
| Medalhas | Concessão manual | Somente aluno atual e oferta correta |
| Relatórios | PDF, CSV e Excel | Totais e médias iguais antes/depois |
| Compatibilidade | Links antigos | Funcionam durante a janela de transição |
| Resiliência | Ausência de fallback | Erro controlado, sem dados misturados |
| Banco | Constraints | Nenhuma referência órfã após cada migration |
| Performance | Rotas acadêmicas | Sem regressão relevante de latência |

## 10. Observabilidade e auditoria

Criar métricas para leituras legadas, escritas bloqueadas, fallback por rota, divergências de reconciliação, matrículas sem contexto, notas sem oferta, frequência sem aluno contextual e tentativas de acesso cruzado. Os logs devem usar IDs técnicos e não expor dados pessoais desnecessários.

Executar diariamente uma GitHub Action de auditoria com os seguintes checks: contagem origem/destino, duplicidades, órfãos, divergência de frequência, divergência de notas, ofertas sem curso, alunos sem oferta, referências legadas inesperadas e uso de fallback. O workflow deve falhar quando encontrar severidade `error` e abrir um artefato JSON para investigação.

## 11. Rollback

Cada onda deve ter rollback próprio. Em mudanças de código, o rollback é a reversão do deployment com a feature flag de dual-read ainda disponível. Em migrações de dados, o rollback deve ser lógico: preservar os registros novos e restaurar a leitura anterior apenas quando a reconciliação demonstrar que os dados legados continuam íntegros. Não executar exclusões em cascata como mecanismo de rollback.

Para a remoção física, o rollback exige restauração do backup em uma instância isolada, validação dos checksums e reimportação em uma janela de manutenção. A restauração deve ser ensaiada antes da migration destrutiva; backup nunca deve ser considerado válido apenas porque foi criado.

## 12. Sequência recomendada para este projeto

A próxima execução prática deve seguir esta ordem:

1. migrar e reconciliar as 18 notas legadas;
2. confirmar que todas as rotas de professor e aluno usam `offerId`;
3. habilitar dual-read monitorado;
4. manter a auditoria diária por 14 a 30 dias;
5. congelar escritas legadas;
6. remover gradualmente as foreign keys de compatibilidade, substituindo-as por mapeamento histórico;
7. arquivar as tabelas por um ciclo acadêmico;
8. somente depois avaliar `DROP TABLE` em uma migration destrutiva separada.

**Recomendação final:** manter as tabelas legadas no banco por enquanto, tratá-las como fonte histórica e de fallback, e não iniciar a remoção física antes da migração das notas e da retirada comprovada das dependências de runtime.
