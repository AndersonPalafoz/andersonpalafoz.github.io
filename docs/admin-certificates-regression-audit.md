# Auditoria de regressão — `/admin/certificados`

Data: 22/08/2026.

A rota publicada foi aberta sem uma sessão administrativa e respondeu com redirecionamento para `/login`, sem retorno de erro 500. O mesmo comportamento foi confirmado no preview local após o reinício do servidor: a proteção da rota permanece ativa.

A tela genérica observada no preview local foi reproduzida durante uma validação interrompida: o script `pnpm build` removeu `.next` e foi encerrado com SIGTERM antes de regenerar os manifestos, deixando `routes-manifest.json` ausente para o servidor de desenvolvimento. O servidor foi reiniciado, os artefatos foram recriados e o problema desapareceu.

Como mitigação estrutural para produção, os editores Fabric.js, Konva.js e GrapesJS passaram a ser importados dinamicamente com `ssr: false` e carregados apenas quando a aba correspondente é selecionada. Isso reduz o carregamento inicial e evita que bibliotecas de canvas/DOM sejam avaliadas durante SSR.

Validações concluídas: teste dedicado do laboratório (2 testes), suíte completa Vitest (135 arquivos, 416 testes), build de produção Next.js concluído com sucesso em execução isolada e rota protegida local respondendo com `/login`.

Limitação da auditoria visual: sem uma sessão administrativa autenticada disponível no navegador sandbox, a renderização interna do painel não pôde ser inspecionada diretamente; a responsividade foi validada por classes mobile-first no componente e pelo teste de navegação das tabs. O usuário deve confirmar o conteúdo autenticado no navegador após o novo checkpoint.

## Verificação de produção após a nova reclamação

A consulta ao projeto Vercel `andersonpalafoz` confirmou que o domínio `andersonpalafoz.vercel.app` está associado ao projeto correto e que o deployment de produção mais recente está em estado `READY`, com o commit `b899f25e` e alias do domínio principal. Os logs de build não registraram erro; o build foi concluído em 58 segundos. A consulta de erros de runtime e o filtro específico por HTTP 500 para `/admin/certificados` nas últimas 24 horas não retornaram ocorrências.

A requisição direta ao domínio de produção para `/admin/certificados` respondeu HTTP 200 com `x-matched-path: /login`, porque não havia sessão administrativa no navegador de auditoria. A navegação visual no navegador sandbox reproduziu o mesmo redirecionamento para `/login`, não a tela genérica de erro. A raiz `/` também respondeu HTTP 200.

Conclusão operacional: o código corrigido está publicado e o servidor não registra a exceção reportada. Para reproduzir a falha interna da área administrativa, é necessária uma sessão autenticada ou o caminho exato que aparece na barra de endereço da captura; o navegador sandbox não possui a sessão do usuário.

## Reprodução com sessão autenticada

Em 22/08/2026, a rota `/admin/certificados` foi aberta no navegador conectado após o usuário concluir o login. A página exibiu o `GlobalError` da aplicação. O console do navegador não mostrou exceções client-side. Uma requisição `fetch` à própria URL, com credenciais incluídas, retornou HTTP 200, `x-matched-path: /admin/certificados` e HTML contendo o error boundary; portanto, o problema ocorre durante o render/server component ou na fronteira RSC, não como uma simples resposta HTTP 500. Os recursos do chunk da página administrativa e do chunk `app/admin/error` foram carregados.

A próxima inspeção deve extrair do payload RSC o digest/mensagem de erro ou correlacionar o request ID `cle1::iad1::cwphv-1787375746281-80d5f048493c` nos logs de runtime. Como não há console client-side, a hipótese de falha de hidratação isolada perde força.

## Causa raiz confirmada

A reprodução autenticada exibiu a mensagem de `app/global-error.tsx`, enquanto o chunk da rota administrativa era carregado. A busca no repositório mostrou que o texto da captura vinha exclusivamente do error boundary global. A inspeção de `components/navbar.tsx` revelou que o componente renderizava `<Image src={session.user.image} ... />` para sessões autenticadas, mas não importava `Image` de `next/image`. Esse `ReferenceError` no layout global interrompia a renderização da árvore inteira e fazia `/admin/certificados` cair na tela genérica.

A correção foi aplicada adicionando `import Image from "next/image";` ao Navbar. O teste regressivo passou, a suíte completa passou com 417 testes, o build de produção passou e o servidor local reiniciou sem erro de compilação. O deployment corrigido ainda precisa ser publicado pelo fluxo de checkpoint/Publish antes de ser confirmado no domínio público.
