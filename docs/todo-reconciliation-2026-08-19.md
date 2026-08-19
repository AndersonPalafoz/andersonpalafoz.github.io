# Reconciliação do `todo.md` — 19/08/2026

## Resultado executivo

O `todo.md` anexado contém um inventário histórico da auditoria de 18/08/2026 em que várias rotas aparecem como pendentes. O `todo.md` do checkout atual possui uma seção mais recente de reconciliação e deve ser tratado como fonte operacional. Os itens de rota do anexo foram comparados com o código existente, sem marcar como concluída uma tarefa apenas pela existência do arquivo.

## Pendências reais tratadas nesta etapa

| Área | Evidência | Resultado |
|---|---|---|
| ZIP do professor | `components/teacher-materials-zip-export.tsx`, `app/api/professor/export-materials-zip/route.ts`, `app/api/professor/materials-size/route.ts` | Seleção por checkbox, seleção em massa, estimativa de tamanho, alerta de 40 MB e validação server-side implementados. |
| Admin | `app/admin/layout.tsx`, `app/admin/loading.tsx`, `app/admin/error.tsx` | Guard server-side por papel, skeleton global e erro recuperável adicionados. |
| Dashboard | `app/dashboard/layout.tsx`, `app/dashboard/dashboard-shell.tsx`, `app/dashboard/loading.tsx`, `app/dashboard/error.tsx` | Guard server-side de sessão/aprovação separado do shell client, com estados responsivos de carregamento e erro. |
| Neon | `drizzle/schema.ts` e `app/api/admin/media/route.ts` | A tabela `media_assets` guarda URL, chave, tamanho e metadados; não há coluna de bytes/blob. |
| Google Drive | `lib/google-drive-upload.ts` e `lib/google-drive-retry.test.ts` | Fallback que fabricava IDs foi removido. Sem OAuth real, a função falha de forma honesta; com OAuth, retry transitório usa backoff exponencial. |

## Itens históricos do anexo

As entradas de `/contato`, `/cadastro`, `/login`, `/redefinir-senha`, políticas, páginas de acesso, dashboard, professor e admin que continuam com `[ ]` no anexo são divergentes do estado do checkout: existem implementações e contratos de teste correspondentes. Elas não foram copiadas cegamente para o estado operacional. A validação de segurança deve continuar sendo feita pelo código, testes e respostas HTTP, não por uma caixa marcada no arquivo anexado.

## Política de armazenamento efetiva

A biblioteca de mídia administrativa usa Supabase Storage como armazenamento de objetos e o Neon como catálogo de metadados. A exportação de materiais do professor usa o Google Drive dedicado quando a autorização OAuth real está configurada. O sistema não deve informar sucesso de upload ao Drive sem uma resposta real da API.

## Validações executadas

- Testes direcionados do ZIP, seleção e layouts protegidos: **10 testes aprovados**.
- Suíte completa anterior ao reforço de layouts e Drive: **269 testes aprovados**.
- Testes de retry real com cliente Google mockado apenas no ambiente de teste e conta dedicada: **5 testes aprovados**.
- Rotas sem sessão: `/dashboard` e `/admin` retornam `307` para `/login`.
- Endpoints ZIP sem sessão: `/api/professor/materials-size` e `/api/professor/export-materials-zip` retornam `403`.
- A checagem global `tsc --noEmit` foi encerrada pelo limite de memória do sandbox; a compilação incremental das rotas no servidor de desenvolvimento foi concluída sem erro reportado.
