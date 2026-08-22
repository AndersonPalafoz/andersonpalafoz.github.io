# Auditoria de regressão — `/admin/certificados`

Data: 22/08/2026.

A rota publicada foi aberta sem uma sessão administrativa e respondeu com redirecionamento para `/login`, sem retorno de erro 500. O mesmo comportamento foi confirmado no preview local após o reinício do servidor: a proteção da rota permanece ativa.

A tela genérica observada no preview local foi reproduzida durante uma validação interrompida: o script `pnpm build` removeu `.next` e foi encerrado com SIGTERM antes de regenerar os manifestos, deixando `routes-manifest.json` ausente para o servidor de desenvolvimento. O servidor foi reiniciado, os artefatos foram recriados e o problema desapareceu.

Como mitigação estrutural para produção, os editores Fabric.js, Konva.js e GrapesJS passaram a ser importados dinamicamente com `ssr: false` e carregados apenas quando a aba correspondente é selecionada. Isso reduz o carregamento inicial e evita que bibliotecas de canvas/DOM sejam avaliadas durante SSR.

Validações concluídas: teste dedicado do laboratório (2 testes), suíte completa Vitest (135 arquivos, 416 testes), build de produção Next.js concluído com sucesso em execução isolada e rota protegida local respondendo com `/login`.

Limitação da auditoria visual: sem uma sessão administrativa autenticada disponível no navegador sandbox, a renderização interna do painel não pôde ser inspecionada diretamente; a responsividade foi validada por classes mobile-first no componente e pelo teste de navegação das tabs. O usuário deve confirmar o conteúdo autenticado no navegador após o novo checkpoint.
