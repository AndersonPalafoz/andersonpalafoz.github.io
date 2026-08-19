# Verificação visual — 19/08/2026

A captura mobile em 390×844 para `/dashboard` e `/admin` mostrou o redirecionamento esperado para `/login` quando não existe sessão. A página de login manteve logo legível, controles de tema, menu compacto, CTA com área de toque adequada e mensagem de acesso protegido. Não foi exibido conteúdo acadêmico fictício nem um painel protegido sem sessão. O servidor permaneceu saudável e informou `typescript: No errors` no health check do preview; a checagem global manual do `tsc` foi encerrada por pressão de memória, portanto a evidência principal de compilação foi o preview e a suíte Vitest.

## Verificação do seletor ZIP

A captura mobile de `/professor` em 390×844 foi renderizada sem erro e mostrou o redirecionamento para `/login` quando não há sessão. O fluxo permanece protegido; a busca não foi exibida porque o conteúdo do professor requer autenticação. A cobertura do componente foi validada por contrato com 5 testes aprovados, incluindo busca por nome, estado sem resultados e seleção contextual.
