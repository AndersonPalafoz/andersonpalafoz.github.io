# Incidente de Turmas Externas — 26/08/2026

## Fonte observada

- Produção: <https://andersonpalafoz.vercel.app/professor/turmas-externas?tab=students>
- API: `GET /api/professor/external-classes`
- Banco: Neon, projeto `dark-unit-46507184`, branch principal `br-lucky-lab-atg6m31w`.

## Causa confirmada

A API já consultava campos acadêmicos, de vínculo de usuário e de nota que ainda não existiam no schema de produção. Como a mesma rota atende professor, admin e superadmin, o descompasso retornava HTTP 500 para todos esses papéis.

## Correção aplicada e validada

Foram aplicadas duas migrações aditivas e não destrutivas no Neon após validação em ramificações temporárias. A consulta publicada voltou a retornar HTTP 200 e confirmou a preservação das turmas SIMAL `Turma Matutino` e `Turma Vespertino`, ambas do período `2026.1`.
