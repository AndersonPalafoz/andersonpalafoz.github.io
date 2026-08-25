# Matriz de permissões — 25/08/2026

## Princípios

Administradores e super administradores possuem escopo global nas áreas operacionais. Professores podem executar operações pedagógicas, mas permanecem limitados aos cursos e turmas sob sua autoria ou responsabilidade. Alunos e visitantes não recebem acesso às APIs administrativas ou docentes.

| Área | Professor | Administrador | Super administrador |
|---|---|---|---|
| Cursos e módulos | Criar, editar e operar cursos sob sua autoria | Escopo global, incluindo arquivamento e exclusão | Escopo global e ações de governança |
| Materiais | Gerenciar materiais próprios ou vinculados aos seus cursos | Escopo global | Escopo global |
| Atividades e correções | Criar, remover e corrigir dentro dos cursos autorizados | Escopo global | Escopo global |
| Turmas externas | Gerenciar turmas em que `teacherId` corresponde ao próprio usuário | Escopo global | Escopo global |
| Alunos | Consultar e acompanhar alunos vinculados às suas turmas/cursos | Gerenciar qualquer aluno e acessos | Gerenciar qualquer aluno e permissões elevadas |
| Speaking e práticas | Avaliar entregas dos cursos autorizados | Avaliar qualquer entrega | Avaliar qualquer entrega |
| Certificados | Operar o fluxo docente permitido | Criar, editar, emitir, assinar, excluir e exportar globalmente | Todas as operações, incluindo governança |
| Medalhas | Sem concessão administrativa global | Criar, conceder individualmente e em lote | Todas as operações administrativas |
| Blog, mensagens e moderação | Operações conforme área docente autorizada | Moderação e gestão global | Gestão global e governança |
| Usuários e permissões | Sem alteração de papéis | Gestão administrativa conforme a política | Gestão total e concessões manuais protegidas |

## Guardas implementados

`requireAdmin` aceita somente o super-administrador configurado, `admin` e `super_admin`. `requireTeacherOrAdmin` inclui também `professor` para operações pedagógicas. `canManageCourse`, `canManageExternalClass` e `canManageMaterial` aplicam o isolamento por autoria ou vínculo; administradores recebem autorização global antes da checagem de propriedade.

## Auditoria

As rotas administrativas e docentes foram verificadas por busca estática e contratos Vitest. A separação central de escopos possui cobertura em `lib/admin-auth-external-class.test.ts`. Nenhuma alteração amplia acesso para alunos ou visitantes.
