# Guia de Configuração de Variáveis de Ambiente no Vercel

Este documento registra a configuração efetiva do projeto **andersonpalafoz** após a auditoria autenticada realizada em 19/08/2026. O projeto utiliza Next.js, NextAuth, Neon PostgreSQL, integrações Google, Supabase Storage e Stripe em fluxos opcionais.

## Projeto confirmado

| Item | Valor |
|---|---|
| Projeto | `andersonpalafoz` |
| Domínio de produção | `https://andersonpalafoz.vercel.app` |
| Ambiente principal | Production |
| Banco principal | Neon PostgreSQL |

## Regra mais importante do banco

O arquivo `lib/db.ts` lê primeiro `NEON_DATABASE_URL` e usa `DATABASE_URL` apenas como alternativa. Portanto, a variável prioritária em produção é:

```text
NEON_DATABASE_URL
```

`NEON_DATABASE_URL` e `DATABASE_URL` devem apontar para a mesma instância PostgreSQL Neon, ou a variável alternativa deve ser mantida apenas se houver algum fluxo que realmente a utilize. Não substitua uma string de conexão secreta sem confirmar o banco de destino e sem verificar se o schema de produção está atualizado.

A conexão de produção deve utilizar SSL conforme exigido pelo Neon. O código também desativa `prepare` para manter compatibilidade com poolers/PgBouncer.

## Variáveis críticas e ambientes

As seguintes variáveis devem ser conferidas no painel **Settings → Environment Variables**:

| Variável | Finalidade | Production | Preview | Development |
|---|---|---:|---:|---:|
| `NEON_DATABASE_URL` | Conexão PostgreSQL prioritária usada pelo código | Obrigatória | Recomendada | Conforme o banco local |
| `DATABASE_URL` | Fallback de conexão PostgreSQL | Igual à conexão Neon ou confirmada como não utilizada | Igual à conexão Neon ou confirmada como não utilizada | Opcional |
| `NEXTAUTH_URL` | URL canônica da aplicação | `https://andersonpalafoz.vercel.app` | URL do preview correspondente ou domínio canônico, conforme o fluxo de teste | URL local quando necessário |
| `NEXTAUTH_SECRET` | Assinatura das sessões NextAuth | Obrigatória e estável | Obrigatória e estável | Pode usar um segredo separado |
| `GOOGLE_CLIENT_ID` | Cliente OAuth do Google | Obrigatória para login Google | Obrigatória para login Google | Conforme o cliente de desenvolvimento |
| `GOOGLE_CLIENT_SECRET` | Segredo do cliente OAuth do Google | Obrigatória para login Google | Obrigatória para login Google | Conforme o cliente de desenvolvimento |

A alteração de `NEXTAUTH_SECRET` invalida sessões existentes. Não gere uma nova chave apenas para “testar”; troque-a somente quando houver necessidade de rotação controlada.

Para criar um segredo localmente, use:

```bash
openssl rand -base64 32
```

Não envie esse valor, a senha do banco, tokens OAuth ou qualquer outro secret pelo chat.

## Configuração confirmada durante a auditoria

A variável não secreta `NEXTAUTH_URL` foi ajustada no Vercel para:

```text
https://andersonpalafoz.vercel.app
```

Ela foi mantida nos ambientes **Production** e **Preview**. Os valores de `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e das conexões de banco foram preservados e não foram expostos.

## Integrações Google opcionais

Os fluxos de armazenamento e sincronização Google podem utilizar as variáveis abaixo:

| Variável | Finalidade | Obrigatoriedade |
|---|---|---|
| `GOOGLE_REFRESH_TOKEN` | Acesso OAuth persistente para Drive, Calendar ou Gmail, conforme o fluxo autorizado | Necessária somente para sincronização server-side sem novo login |
| `GOOGLE_STORAGE_ACCOUNT` | Identificação da conta dedicada de armazenamento | Recomendada quando o Drive dedicado estiver ativo |
| `GOOGLE_STORAGE_HOST` | Host/configuração auxiliar do armazenamento Google | Conforme o fluxo implementado |

A conta dedicada planejada para armazenamento é `andersonpalafoznupel@gmail.com`, separada da conta administrativa `palafozanderson@gmail.com`. O refresh token deve ser emitido pelo mesmo cliente OAuth e pelo mesmo usuário que terá acesso aos arquivos.

No Google Cloud Console, confirme o URI de callback do login principal:

```text
https://andersonpalafoz.vercel.app/api/auth/callback/google
```

O projeto Google também precisa ter as APIs efetivamente utilizadas habilitadas. O login básico usa OpenID, e-mail e perfil; Calendar, Drive, Classroom e Gmail devem ser autorizados somente quando o usuário conectar cada integração.

## Supabase, Resend e Stripe

Estas variáveis são opcionais e devem ser mantidas apenas enquanto os respectivos fluxos estiverem ativos:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLISHABLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY` e tokens Google devem permanecer exclusivamente no servidor. Nunca use o prefixo `NEXT_PUBLIC_` ou `VITE_` para uma chave secreta.

As chaves Stripe de teste e produção não devem ser misturadas. O webhook precisa pertencer ao mesmo ambiente da chave secreta usada pelo backend.

## Aliases automáticos do Neon e Postgres

O painel pode exibir aliases gerados automaticamente por integrações, como `NEON_PGHOST`, `NEON_PGUSER`, `NEON_PGPASSWORD`, `NEON_POSTGRES_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL` e similares. Não remova essas variáveis somente pelo nome. Primeiro confirme no código, nas configurações de build e nas integrações se alguma delas ainda é necessária.

A aplicação atualmente prioriza `NEON_DATABASE_URL`. A existência de aliases adicionais não é, por si só, um erro; o risco está em aliases apontarem para bancos diferentes ou incompletos.

## Procedimento para atualizar no Vercel

1. Acesse https://vercel.com e abra o projeto `andersonpalafoz`.
2. Entre em **Settings → Environment Variables**.
3. Revise o nome, o valor mascarado e os ambientes selecionados sem copiar secrets para fora do painel.
4. Corrija primeiro `NEON_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
5. Salve a alteração e crie um novo deployment. Variáveis de ambiente alteradas não atualizam automaticamente um deployment já criado.
6. Aguarde o deployment ficar **Ready**.
7. Teste as rotas públicas e, depois de autenticar, as rotas protegidas.

## Validação realizada em 19/08/2026

O deployment baseado no checkpoint `061d08a7` ficou **READY** em Production. As seguintes páginas responderam sem HTTP 500 para acesso anônimo: `/cursos/6`, `/professor`, `/professor/turmas-externas`, `/professor/progresso-aulas`, `/admin/cms`, `/admin/mensagens` e `/admin/media`. As rotas protegidas renderizaram a tela de login, enquanto `/cursos/6` respondeu publicamente com HTTP 200.

As APIs protegidas também retornaram códigos de autorização esperados: `/api/professor/external-classes` respondeu HTTP 403 e `/api/professor/progress-speaking` respondeu HTTP 401 quando acessadas sem sessão. Nenhum cluster de erro de runtime foi encontrado nos 30 minutos posteriores ao deployment.

Além das variáveis, o banco Neon foi alinhado de forma aditiva com o schema Drizzle, incluindo tabelas e colunas que estavam ausentes e causavam erros 500. Nenhum registro acadêmico foi apagado.

## Diagnóstico em caso de falha

Se ocorrer `?error=Configuration` no login, revise `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`, além do callback no Google Cloud Console. Se ocorrer erro 500 em uma rota acadêmica, verifique primeiro a conexão efetiva de `NEON_DATABASE_URL` e, em seguida, os logs de runtime e o alinhamento do schema Neon.

Se uma rota protegida responder com a tela de login ou com HTTP 401/403 sem sessão, isso é comportamento esperado. O teste funcional completo deve ser realizado depois de entrar com a conta autorizada.
