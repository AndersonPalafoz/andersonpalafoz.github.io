# Diagnóstico de HTTP 500 em Production — 25/08/2026

## Vercel

Deployment analisado: `dpl_DA1TJ1Pg5jfucvzkcmHuHYSefw5K`, commit `23f6b2a38ec7c1c6dd36a280b9f11cde400645d0`, branch `main`, estado `READY`.

O relatório de runtime do projeto Vercel `prj_kF1vCYnAkUm6VciN0dHHH5eSRXJ1` registrou falha em `/api/professor/external-classes` porque a API consultava os campos SIMAL `assessmentType`, `assessmentVersion`, `assessmentComponent`, `rubricScores` e `assessmentDate` ausentes na tabela Production `external_class_grades`. Também houve erro histórico em `/api/admin/messages` por `admin_reply`, `replied_at` e `replied_by` ausentes; a inspeção posterior do Neon confirmou que essas colunas já existem.

Após a migração, o relatório de runtime no intervalo final de cinco minutos não encontrou novos erros. As rotas protegidas testadas sem sessão retornam `302` para autenticação, não `500`.

## Neon Production

Projeto: `dark-unit-46507184` (`teacher-palafoz`). A tabela `public.external_class_grades` originalmente possuía apenas os campos base. Foi aplicada migração aditiva idempotente para criar os cinco campos SIMAL ausentes, incluindo `assessmentDate`. A inspeção posterior confirmou todos os cinco campos.

A tabela `public.contact_messages` foi inspecionada e contém `admin_reply`, `replied_at` e `replied_by`.

## Código local

A migração `drizzle/migrations/0064_wild_leech.sql` foi alinhada para usar `ADD COLUMN IF NOT EXISTS` e incluir `assessmentDate`. O teste `app/professor/external-classes-schema-alignment.test.ts` foi ampliado para verificar os cinco campos e a idempotência textual da migração. Testes focados e build de produção passaram.

## Observação

A API `/api/user/streak` ainda apresenta um erro runtime histórico relacionado a `Object.entries` em deployment anterior; o helper local atual já trata listas nulas. A página `/verificar/[code]` também possui um erro histórico de consulta `and is null` em deployment anterior, fora do escopo específico das áreas administrativas.
