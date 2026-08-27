# Auditoria de Áreas da Plataforma — 26/08/2026

## Escopo inicial

Esta auditoria cobre as rotas públicas e as áreas autenticadas de aluno, professor, administração e superadministração. Os critérios são: erro de execução, incompatibilidade entre schema e código, acesso por papel, exposição de identidades técnicas, consistência visual e responsividade.

## Achados confirmados

| Prioridade | Área | Evidência | Situação |
|---|---|---|---|
| Alta | Histórico de runtime | O agregado do Vercel registra erros de schema de turmas externas, certificados, alunos externos, comentários e relatórios em deployments anteriores. | Requer confirmação por rota atual; as correções recentes de certificados, turmas e relatórios já foram aplicadas ao Neon. |
| Média | Dashboard | O Dashboard publicado carregou sem erro de banco, mas recomenda o curso **"English Mastery: Módulo de Teste & Pronúncia Avançada"** para a conta autenticada. | A verificar como curso de teste exposto indevidamente. |
| Informativo | Painel docente | A página `/professor` carregou sem alerta de consulta e preservou a navegação filtrada por papel. | Sem correção necessária neste ponto. |
| Média | API de alunos docentes | A consulta autenticada retornou o registro `andersonpalafozbackup@gmail.com` como aluno pendente. | Correção em andamento: a mesma filtragem central de identidades técnicas será usada nas listas docentes. |
| Informativo | API de tarefas docentes | Um `GET` manual retorna 405, mas a página usa a rota somente para criar/duplicar tarefas via `POST`; as leituras vêm das APIs de cursos e atividades. | Comportamento esperado, sem falha funcional confirmada. |
| Média | Painel administrativo | O painel carrega, mas o curso rotulado **"Módulo de Teste"** ainda é exibido entre os cursos disponíveis. | A verificar a política de visibilidade de conteúdo de teste. |
| Resolvido | APIs críticas | `streak`, comentários de artigo, relatórios acadêmicos, certificados e turmas externas responderam HTTP 200 na sessão autenticada. | Os erros de schema presentes no agregado de logs pertencem a deployments anteriores às migrações já aplicadas. |
| Alta — resolvido | Logs administrativos | A API de logs administrativos retornava HTTP 500 porque sua estrutura não existia no banco principal. | Estrutura restaurada mediante aprovação; nova consulta publicada responde HTTP 200 com lista vazia legítima. |
| Informativo | APIs com parâmetros ou escrita | `notes` sem aluno e `materials-size` em leitura direta respondem 400/405, pois exigem dados específicos ou não são rotas de listagem. | Sem falha funcional confirmada. |
| Resolvido | Proteção de rotas | Sem sessão, as rotas auditadas de dashboard, professor e administração redirecionam para `/login`. | Nenhum conteúdo protegido foi exposto na verificação HTTP e no preview local. |
| Resolvido | Área pública responsiva | A home foi verificada em desktop e em 375 px de largura. | Não houve rolagem horizontal visível; navegação e CTAs permanecem utilizáveis. |

## Decisão de auditoria

Nenhum registro será excluído durante a auditoria. Qualquer correção deverá ocultar dados técnicos da experiência pedagógica ou resolver uma incompatibilidade confirmada entre schema, API e interface.
