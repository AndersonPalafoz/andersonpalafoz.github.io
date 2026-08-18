## Verificação visual local

A captura de `/professor` e `/admin/cms` sem sessão autenticada exibiu a tela de login, confirmando que as rotas administrativas e docentes continuam protegidas por autenticação. Não foi possível revisar o interior autenticado das páginas nessa captura porque não há sessão administrativa disponível no preview local.

As alterações de interface foram validadas por TypeScript e build; a revisão autenticada deve ser feita com uma conta autorizada no ambiente de preview.
