# Auditoria de persistência do login — 25/08/2026

## Evidência observada em produção

A rota `https://andersonpalafoz.vercel.app/dashboard` foi aberta duas vezes em navegações completas consecutivas na mesma sessão de navegador. Nas duas ocasiões, a área protegida carregou sem redirecionar para `/login`.

O conteúdo da sessão permaneceu disponível após a segunda navegação: o cabeçalho exibiu `Anderson Bacelar Palafoz`, o e-mail `palafozanderson@gmail.com`, o papel `Administrador`, o botão `Sair`, links para `/dashboard`, `/admin` e `/professor`, além dos dados do painel. Isso confirma persistência do cookie/sessão entre recarregamentos completos no domínio Vercel.

A sessão observada usa o fluxo NextAuth com estratégia JWT, duração configurada de sete dias e atualização a cada doze horas. O cookie de produção é `__Secure-next-auth.session-token`, marcado como `httpOnly`, `sameSite: lax`, `path: /` e `secure: true`. O navegador não expõe o valor do cookie ao JavaScript, o que é esperado para um cookie protegido por `httpOnly`.

## Observação de UX

A sessão persistiu, mas o dashboard abriu novamente o modal de orientação `Bem-vindo(a) ao Início`, indicando que a preferência de conclusão/pulo desse onboarding pode não estar persistida ou pode estar sendo exibida independentemente do estado da sessão. Isso não representa logout, mas é uma possível melhoria de experiência.

## Escopo ainda pendente

Não foi possível confirmar a persistência em uma nova janela isolada nem no preview local durante esta etapa. O preview local possui histórico de falha de OAuth, portanto deve ser validado separadamente com `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e callback autorizado para a origem local.

Nenhum logout, alteração de conta, emissão, exclusão ou operação destrutiva foi executado durante a auditoria.

## Confirmação pelo endpoint de sessão

Após a segunda navegação para o dashboard, o endpoint oficial `/api/auth/session` retornou uma sessão válida com o usuário administrador, papel `admin`, status `approved` e expiração em 01/09/2026. O retorno confirma que o cookie persistente está sendo aceito pelo servidor e que a sessão JWT é reconstruída corretamente depois do carregamento da página.

No preview local, `/login` carrega corretamente e `/api/auth/session` responde HTTP 200, porém sem sessão autenticada. Os logs locais não registraram erro de sessão no carregamento; portanto, a ausência local é compatível com a falta de um login OAuth concluído nessa origem, não com uma sessão que esteja sendo apagada após o login.
