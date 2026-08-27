# Fase 1 — Mapa de equivalência entre Cursos Externos e Cursos Internos

**Data:** 27 de agosto de 2026

## Escopo identificado
A superfície externa central é `app/professor/turmas-externas/page.tsx`, apoiada por `app/api/professor/external-classes/route.ts`, `app/api/professor/external-student-report/route.ts`, `app/professor/boletim/[studentId]/page.tsx` e `app/dashboard/aluno-externo/page.tsx`.
A superfície interna é distribuída entre `app/cursos/page.tsx`, `app/cursos/[id]/page.tsx`, `app/cursos/[id]/aulas/[lessonId]/page.tsx`, `app/dashboard/cursos/page.tsx`, `app/professor/cursos/page.tsx`, `app/admin/cursos/page.tsx`, `app/admin/cursos/[id]/modulos/page.tsx` e APIs de cursos, módulos, atividades, progresso, materiais, matrículas, certificados, avaliações e fila de espera.

## Matriz preliminar
| Capacidade | Cursos Externos | Cursos Internos | Situação para expansão |
|---|---|---|---|
| Catálogo e identidade | Instituição, turma, curso, período, modalidade, nível, duração | Curso, slug, categoria, imagem, publicação, visibilidade, avaliações | Adaptar turma/coorte e manter identidade do curso |
| Gestão administrativa | Criar, editar, duplicar, excluir logicamente, restaurar, excluir permanentemente | CRUD, lixeira, operações em lote, módulos e ordenação | Reaproveitar lixeira, logs e operações em lote |
| Pessoas e acesso | Alunos externos, status, matrícula, importação, boas-vindas, professores delegados | Usuários, matrículas, permissões, progresso, professores | Unificar identidade sem quebrar alunos externos existentes |
| Conteúdo | Materiais vinculados à turma | Módulos, aulas, materiais, atividades e comentários | Mapear material de turma para curso/módulo/aula |
| Aprendizagem | Chamada por data, presença, atraso e justificativa | Progresso de aulas e materiais, atividades concluídas | Introduzir frequência como capacidade opcional do curso/coorte |
| Avaliação | Notas decimais, componentes, versões, feedback, média manual e fechamento | Atividades, revisão de notas e progresso; sem equivalência completa de boletim | Criar camada acadêmica comum e preservar fórmula SIMAL por origem |
| Relatórios | CSV, XLSX, PDF acadêmico, boletim individual e gráfico comparativo | Certificados, relatórios administrativos e exportações de materiais | Consolidar relatórios por curso/coorte e aluno |
| Notificações | Boas-vindas e nota criada/atualizada | Notificações de plataforma, progresso e certificados | Reusar canal e chave de evento idempotente |
| Responsividade e acessibilidade | Dashboard, filtros, cartões, gráficos, estados vazios | Páginas de catálogo, aula, professor e administração | Reaplicar padrões sem copiar markup específico |

## Entidades e dependências
Cursos internos usam `courses`, `modules`, `lessons`, `materials`, `enrollments`, `progress`, `activities`, certificados e avaliações/reviews. Cursos externos usam `externalClasses`, `externalStudents`, `externalClassAttendance`, `externalClassGrades`, `externalClassMaterials` e `externalClassTeacherAssignments`, com relatórios e acesso externo próprios.

## Regras de compatibilidade obrigatórias
1. Nenhum registro existente de `externalClasses` ou de alunos externos pode ser convertido destrutivamente.
2. A fórmula SIMAL permanece prova escrita até 8,0 + apresentação até 2,0.
3. O mesmo aluno pode aparecer em experiências internas e externas, mas a matrícula, progresso, frequência, nota e permissão devem manter escopo explícito.
4. A expansão deve suportar cursos internos sem frequência/boletim e cursos internos com coorte, chamada e avaliação habilitadas.
5. Administradores globais, professores proprietários/delegados e alunos devem manter isolamento de dados equivalente ao módulo externo.

## Lacunas e riscos que exigem decisão na fase 2
- Definir se curso interno será a entidade pai e turma/coorte a entidade de oferta, ou se as tabelas externas serão estendidas com `courseId`.
- Definir o vínculo entre aluno externo sem conta e usuário interno com conta, evitando duplicidade e colisão de e-mail.
- Definir se notas e frequência serão comuns entre cursos ou apenas habilitadas por oferta/coorte.
- Definir o escopo das funcionalidades que não têm equivalente direto, especialmente SIMAL, fechamento, boletim e chamada.
- Definir estratégia de migração reversível, índices, unicidade e rollout progressivo.

## Próxima fase
Na fase 2 será elaborado o desenho de arquitetura, modelo de dados e matriz de compatibilidade, incluindo uma proposta de coorte/oferta que permita levar as capacidades externas aos cursos internos sem duplicar regras nem alterar dados existentes.
