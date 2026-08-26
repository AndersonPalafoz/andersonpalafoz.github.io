# Incidente de Certificados Docentes — 26/08/2026

## Fonte observada

- Produção: <https://andersonpalafoz.vercel.app/professor/certificados>
- Consulta afetada: `GET /api/admin/certificates`.
- Banco: Neon, projeto `dark-unit-46507184`, branch principal `br-lucky-lab-atg6m31w`.

## Causa confirmada

O painel de certificados consultava campos de destinatário externo que existiam no schema Drizzle, mas não no schema de produção do Neon. Isso impediam a listagem de certificados no painel docente.

## Correção aplicada e validação

Uma migração aditiva foi validada em ramificação temporária e aprovada antes de ser aplicada no banco principal. A página publicada voltou a listar dois certificados preservados, sem falha de consulta.
