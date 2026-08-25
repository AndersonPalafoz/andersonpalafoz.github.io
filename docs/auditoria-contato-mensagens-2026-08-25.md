
## Reprodução em produção

A consulta `GET /api/admin/messages` foi reproduzida com a sessão administrativa do navegador e retornou JSON `{ "error": "Erro interno ao listar mensagens." }`, confirmando erro HTTP 500 no endpoint que alimenta `/admin/mensagens`. A abertura direta de `GET /api/contact` não permitiu identificar o contrato de método porque o navegador encerrou a navegação com `ERR_HTTP_RESPONSE_CODE_FAILURE`; nenhuma submissão de mensagem foi realizada durante a auditoria.

## Correção e verificação

A causa foi confirmada no mesmo cliente Drizzle usado pela aplicação: `contact_messages` não possuía `admin_reply`, `replied_at` e `replied_by`, embora o schema e os endpoints já dependessem dessas colunas. Foi aplicada uma migração aditiva no banco Neon efetivamente usado por `NEON_DATABASE_URL`; nenhum registro foi inserido, atualizado ou excluído. A consulta Drizzle passou a retornar `{ ok: true, count: 0 }`, e a API publicada `GET /api/admin/messages` passou a retornar `{"messages":[]}` em vez de HTTP 500. O endpoint público também foi validado com payload inválido e retornou HTTP 400 com a mensagem de validação esperada, sem inserir dados.
