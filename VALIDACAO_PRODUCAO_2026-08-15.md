# Validação de produção — 15/08/2026

## Resultado observado

- `https://andersonpalafoz.vercel.app/login` carregou com status visual consistente: fundo branco, cabeçalho com marca, navegação pública, cartão de autenticação e botão vermelho **Entrar com Google**.
- O fluxo público apresenta a mensagem de registro automático para novas contas e o contato administrativo `palafozanderson@gmail.com` no rodapé.
- A tentativa de visitar `https://andersonpalafoz.vercel.app/admin` sem sessão foi redirecionada para `/login`, confirmando que a área administrativa não é exposta a visitantes não autenticados.
- Não foi realizado login, postagem, alteração de conteúdo ou outra operação sensível.

## Limitação

A persistência da sessão com a conta administrativa e o acesso efetivo ao painel após o OAuth precisam ser confirmados pelo proprietário no domínio de produção, porque exigem a sessão Google pessoal e um redeploy com as variáveis configuradas no Vercel.

## Validação local após correção de resiliência

- A captura inicial do preview revelou falha de consulta em `/blog` e `/materiais` por `CONNECT_TIMEOUT` do banco.
- As páginas passaram a usar `lib/public-content.ts`, que captura a falha e retorna um estado explícito de indisponibilidade.
- Nova captura do preview confirmou que `/blog` e `/materiais` renderizam normalmente, com avisos claros e sem o overlay de erro do Next.js.
- A rota `/admin` sem sessão continua redirecionando para `/login`.
