# Matriz de permissões do Google Classroom

## Princípio de segurança

O login Google da plataforma e a autorização do Google Classroom são fluxos distintos. O login básico identifica a pessoa; a conexão Classroom concede acesso somente aos recursos autorizados no consentimento OAuth.

A aplicação deve aplicar autorização em duas camadas: o papel local do usuário e o papel efetivo da conta no curso do Google Classroom. O papel local nunca deve, sozinho, conceder acesso a dados externos.

## Matriz por papel

| Recurso ou ação | Administrador | Professor | Aluno |
|---|---:|---:|---:|
| Conectar a própria conta Classroom | Sim | Sim | Sim |
| Consultar cursos aos quais a conta tem acesso | Sim | Sim | Sim |
| Selecionar cursos para sincronização local | Sim | Sim, nos cursos sob sua responsabilidade | Não; seleção automática dos cursos próprios |
| Importar atividades do curso | Sim | Sim | Somente as atividades acessíveis ao próprio aluno |
| Consultar roster completo | Sim, quando a conta Google tiver permissão | Sim, no curso autorizado | Não |
| Consultar próprias submissions | Sim | Sim | Sim |
| Consultar submissions de outros alunos | Somente quando o Classroom permitir pelo papel externo | Somente quando o Classroom permitir pelo papel externo | Não |
| Vincular aluno Google a usuário local | Sim, com correspondência única ou revisão manual | Não deve alterar vínculos globais sem autorização administrativa | Não |
| Revogar a própria conexão | Sim | Sim | Sim |
| Revogar conexão de outro usuário | Sim, mediante fluxo administrativo auditado | Não | Não |
| Iniciar sincronização da própria conta | Sim | Sim | Sim, somente dados próprios |
| Iniciar sincronização de todas as contas | Sim, por rotina protegida | Não | Não |
| Criar ou alterar conteúdo no Classroom | Não nesta fase | Não nesta fase | Não nesta fase |

## Escopos recomendados

| Papel | Escopos mínimos planejados | Observação |
|---|---|---|
| Professor/admin | Cursos, coursework, submissions de estudantes, roster e perfil/e-mail quando indispensável | Permite a sincronização administrativa, condicionada às permissões efetivas no curso |
| Aluno | Cursos, coursework próprio, submissions próprias e perfil próprio | Não usar escopo de roster ou de submissions de estudantes para o fluxo do aluno |

Os escopos devem ser solicitados gradualmente. A aplicação não deve pedir permissões de professor durante o login de um aluno nem tratar um consentimento parcial como autorização completa.

## Campos da conexão

A tabela `google_classroom_connections` passa a registrar:

| Campo | Finalidade |
|---|---|
| `authorizedRole` | Papel para o qual o consentimento foi usado: `teacher`, `student` ou `admin` |
| `scopes` | Escopos efetivamente concedidos pelo Google |
| `status` | Estado operacional: `active`, `revoked`, `expired` ou `error` |
| `lastSyncStatus` | Resultado mais recente: `success`, `partial`, `error` ou `null` |
| `lastSyncAt` | Momento da última sincronização concluída |
| `consentedAt` | Momento do consentimento explícito |
| `revokedAt` | Momento da revogação local ou detectada |
| `lastError` | Último erro sanitizado, sem tokens ou dados sensíveis |

O `authorizedRole` representa o papel da conexão no fluxo do produto. Ele não substitui a verificação das permissões retornadas pelo Google para cada curso.

## Regras de isolamento

Todas as consultas Classroom devem filtrar por `connectionId` e pelo usuário autenticado. Uma rota de aluno nunca pode aceitar um `userId`, `courseId` ou `studentGoogleUserId` arbitrário vindo do cliente para ampliar o escopo da consulta.

Os dados de roster e submissions de outros estudantes só podem ser persistidos no fluxo autorizado de professor/admin. Mesmo nesse fluxo, o vínculo com um usuário local deve ocorrer apenas por correspondência única e auditável.

## Critérios de aceite da Sprint 1

A Sprint 1 será aceita quando a conexão persistir o papel autorizado e os timestamps de consentimento/revogação; quando as rotas conseguirem distinguir professor, aluno e administrador; quando uma conexão de aluno não puder acessar roster ou submissions de colegas; quando as conexões permanecerem isoladas por usuário; e quando cada sincronização atualizar `lastSyncStatus`, `lastSyncAt` e `lastError` de maneira sanitizada.

## Referências

- https://developers.google.com/workspace/classroom/guides/auth — Google Classroom API: OAuth e escopos.
- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork.studentSubmissions/list — Google Classroom API: submissions.
- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.students/list — Google Classroom API: roster de estudantes.
