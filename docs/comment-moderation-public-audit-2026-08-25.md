# Auditoria pública de comentários — 25/08/2026

Fonte auditada: https://andersonpalafoz.vercel.app/blog/estrategias-de-letramento-e-fluencia-no-ensino-de-lingua-inglesa-1786773638128

A página pública exibe a seção “Avaliações e Comentários”, formulário com nome, e-mail opcional, estrelas e comentário, além de uma lista de comentários persistidos. O artigo auditado mostrava um comentário publicado. A página possui os endpoints `/api/articles/{id}/comments` para leitura e envio.

O painel administrativo existente em `/admin/reviews` já permitia selecionar artigo, listar comentários e publicar resposta oficial com selo “Resposta do Professor”. Antes desta etapa, não havia ações visíveis de ocultar, restaurar ou excluir logicamente comentários. O schema existente tinha `article_comments` e `article_comment_replies`; a moderação foi modelada como `moderation_status`, `moderated_at` e `moderated_by`, com filtro público para não retornar status `hidden` ou `deleted`.

A captura visual mostrou layout sem rolagem horizontal aparente em desktop. As informações foram coletadas por navegação passiva; nenhum comentário foi criado, alterado ou excluído durante a auditoria.

## Validação visual pós-alteração

A primeira captura após adicionar a migração encontrou `Internal Server Error` nas rotas por cache Webpack inconsistente (`Cannot find module './6321.js'`). O servidor foi reiniciado e o preview voltou a compilar em aproximadamente 1,8 segundo. A captura seguinte mostrou a tela de login normalmente e a página do artigo em estado de carregamento, sem o erro 500. A rota administrativa `/admin/reviews` continua protegida para usuários não autenticados; a validação funcional das ações depende de sessão administrativa.
